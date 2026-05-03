"""Scrape VT UDC grade distributions into the Odysseus CSV format.

The UDC API stores table payloads as base64-encoded Brotli JSON. This script
does the same work as the web page: discover subjects, discover courses, fetch
grade rows for the selected window, then write a flat CSV.
"""

import argparse
import asyncio
import base64
import csv
import json
from pathlib import Path

import aiohttp
import brotli
from yarl import URL


BASE_URL = "https://udc.vt.edu/irdata/data/courses/grades"
API_URL = "https://udc.vt.edu/api/irdata/data/courses/grades"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "raw-data" / "newGradeDistribution.csv"
DEFAULT_FROM_ACADEMIC_YEAR = "2024-25"
DEFAULT_FROM_TERM = "Winter"
DEFAULT_TO_ACADEMIC_YEAR = "2025-26"

CSV_FIELDS = [
    "Academic Year",
    "Term",
    "Subject",
    "Course No.",
    "Course Title",
    "Instructor",
    "GPA",
    "A (%)",
    "A- (%)",
    "B+ (%)",
    "B (%)",
    "B- (%)",
    "C+ (%)",
    "C (%)",
    "C- (%)",
    "D+ (%)",
    "D (%)",
    "D- (%)",
    "F (%)",
    "Withdraws",
    "Graded Enrollment",
    "CRN",
    "Credits",
]

FIELD_MAP = {
    "Academic Year": "academic_year",
    "Term": "term",
    "Subject": "subject_code",
    "Course No.": "course_number",
    "Course Title": "course_title",
    "Instructor": "instructor",
    "GPA": "gpa",
    "A (%)": "grade_a",
    "A- (%)": "grade_a_negative",
    "B+ (%)": "grade_b_positive",
    "B (%)": "grade_b",
    "B- (%)": "grade_b_negative",
    "C+ (%)": "grade_c_positive",
    "C (%)": "grade_c",
    "C- (%)": "grade_c_negative",
    "D+ (%)": "grade_d_positive",
    "D (%)": "grade_d",
    "D- (%)": "grade_d_negative",
    "F (%)": "grade_f",
    "Withdraws": "withdraws",
    "Graded Enrollment": "student_no",
    "CRN": "course_ref_no",
    "Credits": "credit_hours",
}


def decompress_payload(payload):
    """Decode a UDC compressed table payload."""
    if not payload:
        return None
    return json.loads(brotli.decompress(base64.b64decode(payload)))


def cdt_to_rows(cdt):
    """Convert UDC's compact data table shape into dictionaries."""
    schema = cdt["schema"]
    return [dict(zip(schema, row)) for row in cdt["data"]]


def sql_value(value):
    """Quote a value for UDC's simple SQL-like filter language."""
    return "'" + str(value).replace("'", "''") + "'"


def course_condition(subject, course_number, course_title):
    return (
        f'("subject_code"={sql_value(subject)} AND '
        f'"course_number"={sql_value(course_number)} AND '
        f'"course_title"={sql_value(course_title)})'
    )


def add_filter(condition, field, values):
    if not values:
        return condition
    choices = " OR ".join(f'"{field}"={sql_value(value)}' for value in values)
    return f"({condition} AND ({choices}))"


def default_output_selected(output_path):
    return output_path.resolve() == OUTPUT_PATH.resolve()


def range_condition(from_academic_year, from_term, to_academic_year):
    """Default window: starting term plus all rows in the next academic year."""
    return (
        f'(("academic_year"={sql_value(from_academic_year)} '
        f'AND "term"={sql_value(from_term)}) '
        f'OR "academic_year"={sql_value(to_academic_year)})'
    )


def selected_window(args):
    """Use the default window unless the caller chose explicit filters."""
    if args.academic_year or args.term:
        return None
    return range_condition(
        args.from_academic_year,
        args.from_term,
        args.to_academic_year,
    )


def row_in_window(row, args):
    """Mirror the API filter locally so the CSV cannot leak extra rows."""
    if args.academic_year and row.get("academic_year") not in args.academic_year:
        return False
    if args.term and row.get("term") not in args.term:
        return False
    if args.academic_year or args.term:
        return True
    return (
        row.get("academic_year") == args.to_academic_year
        or (
            row.get("academic_year") == args.from_academic_year
            and row.get("term") == args.from_term
        )
    )


def normalize_number(value):
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value)


async def request_text(session, method, url, *, retries=5, **kwargs):
    """Fetch a URL with a small retry loop for transient UDC errors."""
    for attempt in range(retries):
        try:
            async with session.request(method, url, **kwargs) as response:
                text = await response.text()
                if response.status < 500:
                    return response.status, text
        except (aiohttp.ClientError, asyncio.TimeoutError):
            pass
        await asyncio.sleep(0.2 * (attempt + 1))
    return 0, ""


async def get_csrf_token(session):
    """Load the UDC page once so the API accepts subsequent POST requests."""
    status, text = await request_text(session, "GET", BASE_URL, retries=8)
    if status != 200:
        raise RuntimeError(f"Could not load grade distribution page: HTTP {status}")

    token = session.cookie_jar.filter_cookies(URL(BASE_URL)).get("csrftoken")
    if not token:
        raise RuntimeError("Could not find csrftoken cookie on grade distribution page.")
    return token.value


async def get_compressed_json(session, path, *, condition=None):
    """Fetch and decode one UDC API endpoint."""
    url = f"{API_URL}/{path}"
    if condition:
        status, text = await request_text(session, "POST", url, json={"c": condition})
    else:
        status, text = await request_text(session, "GET", url)
    if status != 200:
        raise RuntimeError(f"Could not fetch {url}: HTTP {status}")
    return decompress_payload(json.loads(text))


async def get_subjects(session, selected_subjects):
    """Return all subjects, or only the requested subject codes."""
    subjects = await get_compressed_json(session, "subject_code")
    if selected_subjects:
        selected = {subject.upper() for subject in selected_subjects}
        subjects = [subject for subject in subjects if subject in selected]
    return subjects


async def get_courses_for_subject(session, subject):
    """Return the course list for one subject."""
    courses = await get_compressed_json(
        session,
        "course_no",
        condition=f'"subject_code"={sql_value(subject)}',
    )
    return [
        {
            "subject": course[0],
            "course_number": course[1],
            "course_title": course[2],
        }
        for course in courses
    ]


async def fetch_course_rows(session, semaphore, course, academic_years, terms, window_condition):
    """Fetch grade rows for one course."""
    condition = course_condition(
        course["subject"],
        course["course_number"],
        course["course_title"],
    )
    if window_condition:
        condition = f"({condition} AND {window_condition})"
    else:
        condition = add_filter(condition, "academic_year", academic_years)
        condition = add_filter(condition, "term", terms)

    async with semaphore:
        status, text = await request_text(session, "POST", API_URL, json={"c": condition})

    if status != 200:
        return course, None
    payload = json.loads(text)
    return course, cdt_to_rows(decompress_payload(payload)) if payload else []


async def scrape(args):
    """Scrape grade rows and write the output CSV."""
    output_path = Path(args.output)
    if output_path.exists() and not args.overwrite and not default_output_selected(output_path):
        raise FileExistsError(
            f"{output_path} already exists. Pass --overwrite to replace it."
        )

    timeout = aiohttp.ClientTimeout(total=args.timeout)
    connector = aiohttp.TCPConnector(limit=0, ttl_dns_cache=300)
    cookie_jar = aiohttp.CookieJar()

    async with aiohttp.ClientSession(
        timeout=timeout,
        connector=connector,
        cookie_jar=cookie_jar,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Referer": BASE_URL,
            "Origin": "https://udc.vt.edu",
        },
    ) as session:
        csrf_token = await get_csrf_token(session)
        session.headers.update({"X-CSRFToken": csrf_token})

        subjects = await get_subjects(session, args.subject)
        print(f"Found {len(subjects)} subjects to scrape.")

        course_lists = await asyncio.gather(
            *(get_courses_for_subject(session, subject) for subject in subjects)
        )
        courses = [course for course_list in course_lists for course in course_list]
        if args.course_number:
            selected_numbers = set(args.course_number)
            courses = [
                course
                for course in courses
                if course["course_number"] in selected_numbers
            ]
        if args.limit_courses:
            courses = courses[: args.limit_courses]

        print(f"Found {len(courses)} courses to scrape.")

        rows = []
        failed = []
        semaphore = asyncio.Semaphore(args.concurrency)
        window_condition = selected_window(args)
        tasks = [
            fetch_course_rows(
                session,
                semaphore,
                course,
                args.academic_year,
                args.term,
                window_condition,
            )
            for course in courses
        ]

        for index, task in enumerate(asyncio.as_completed(tasks), start=1):
            course, course_rows = await task
            if course_rows is None:
                failed.append(course)
            else:
                rows.extend(course_rows)

            if index % 100 == 0:
                print(f"  Courses complete: {index}/{len(courses)}")

        if failed:
            raise RuntimeError(f"Could not fetch {len(failed)} courses after retries.")

    csv_rows = []
    seen = set()
    for row in rows:
        if not row_in_window(row, args):
            continue
        key = (
            row.get("academic_year"),
            row.get("term_code_full"),
            row.get("subject_code"),
            row.get("course_number"),
            row.get("course_title"),
            row.get("instructor"),
            row.get("course_ref_no"),
        )
        if key in seen:
            continue
        seen.add(key)
        csv_rows.append([normalize_number(row.get(FIELD_MAP[field])) for field in CSV_FIELDS])

    csv_rows.sort(key=lambda row: (row[0], row[1], row[2], row[3], row[20], row[5]))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
        csvfile.write(",".join(CSV_FIELDS) + "\n")
        writer = csv.writer(csvfile, quoting=csv.QUOTE_ALL)
        writer.writerows(csv_rows)

    print(f"Done. Wrote {len(csv_rows)} grade distribution rows to {output_path}.")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Scrape VT UDC grade distributions into the Odysseus CSV format."
    )
    parser.add_argument("--output", default=str(OUTPUT_PATH), help="CSV path to write.")
    parser.add_argument(
        "--academic-year",
        action="append",
        default=[],
        help='Academic year to include, e.g. "2024-25". May be repeated.',
    )
    parser.add_argument(
        "--term",
        action="append",
        default=[],
        help="Term to include. Overrides the default Winter 2024 onward window when used.",
    )
    parser.add_argument(
        "--from-academic-year",
        default=DEFAULT_FROM_ACADEMIC_YEAR,
        help='Default range start academic year, e.g. "2024-25".',
    )
    parser.add_argument(
        "--from-term",
        default=DEFAULT_FROM_TERM,
        help='Default range start term, e.g. "Winter".',
    )
    parser.add_argument(
        "--to-academic-year",
        default=DEFAULT_TO_ACADEMIC_YEAR,
        help='Default range end academic year, e.g. "2025-26".',
    )
    parser.add_argument(
        "--subject",
        action="append",
        default=[],
        help='Subject code to include, e.g. "ECE". May be repeated.',
    )
    parser.add_argument(
        "--course-number",
        action="append",
        default=[],
        help='Course number to include, e.g. "4664". May be repeated.',
    )
    parser.add_argument("--concurrency", type=int, default=16)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace the output file if it already exists.",
    )
    parser.add_argument(
        "--limit-courses",
        type=int,
        default=0,
        help="Only scrape the first N discovered courses. Intended for smoke tests.",
    )
    return parser.parse_args()


def main():
    asyncio.run(scrape(parse_args()))


if __name__ == "__main__":
    main()
