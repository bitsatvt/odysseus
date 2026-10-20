"""Merge scraped grades and timetable names into the existing JSON database inputs.

Unlike cleanData.py, this incremental path preserves the catalog and group IDs.
All inputs are validated before output is written; --dry-run writes nothing.
"""

import argparse
import copy
import csv
import json
import math
from collections import Counter, defaultdict
from pathlib import Path

from grade_terms import (
    DEFAULT_FROM_ACADEMIC_YEAR, DEFAULT_FROM_TERM,
    DEFAULT_TO_ACADEMIC_YEAR, DEFAULT_TO_TERM, TERMS, row_term, window_pairs,
)

RAW_DATA = Path(__file__).resolve().parent.parent / "raw-data"
GRADES = ("A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F")
DATA_FILES = ("class", "group", "section", "instructors")


def normalize_name(value):
    return "-".join(value.strip().lower().replace(".", "").split())


def full_name(value):
    if "," not in value:
        return None
    last, first = value.rsplit(",", 1)
    last, first = normalize_name(last), normalize_name(first)
    return (last, first) if last and first else None


def convert_row(row):
    code = row_term(row)
    crn = int(row["CRN"])
    graded, withdrawn = int(row["Graded Enrollment"]), int(row["Withdraws"])
    enrollment = graded + withdrawn
    if min(graded, withdrawn) < 0 or enrollment <= 0:
        raise ValueError(f"Invalid enrollment for {code};{crn}")
    gpa = float(row["GPA"])
    raw_percentages = [row[f"{grade} (%)"].strip() for grade in GRADES]
    percentages = [float(value) if value else 0.0 for value in raw_percentages]
    if not math.isfinite(gpa) or not 0 <= gpa <= 4:
        raise ValueError(f"Invalid GPA for {code};{crn}")
    if any(not math.isfinite(p) or not 0 <= p <= 100 for p in percentages):
        raise ValueError(f"Invalid grade percentage for {code};{crn}")
    # UDC emits null/blank cells for some zero-percent buckets. Only fill them
    # when the known cells account for 100% within one-decimal rounding error.
    if "" in raw_percentages:
        expected = 100 if graded else 0
        tolerance = sum(p > 0 for p in percentages) * 0.05 + 1e-8
        if abs(sum(percentages) - expected) > tolerance:
            raise ValueError(f"Incomplete grade distribution for {code};{crn}")
    return {
        "super_CRN": f"{code[:4]};{code[4:]};{crn}",
        "year": int(code[:4]), "term": row["Term"],
        "course_id": f"{row['Subject'].strip()}-{row['Course No.'].strip()}",
        "title": row["Course Title"], "Instructor": normalize_name(row["Instructor"]),
        "GPA": gpa, "Enrollment": enrollment,
        "Grades_Dist": [p * graded / enrollment for p in percentages] + [withdrawn * 100 / enrollment],
        "CRN": crn, "Credits": row["Credits"].strip(),
    }


def choose_section(key, rows, names, report):
    # The database currently represents one instructor per CRN. Prefer Banner's
    # named instructor when UDC provides multiple rows for a team-taught section.
    canonical = full_name(names.get(key, ""))
    matching = [r for r in rows if canonical and r["Instructor"] == canonical[0]]
    candidates = matching or rows
    signatures = {json.dumps({k: v for k, v in r.items() if k != "Instructor"}, sort_keys=True)
                  for r in candidates}
    if len(signatures) > 1:
        raise ValueError(f"Conflicting grade rows for {key}; resolve this CRN in the input CSV before importing")
    chosen = sorted(candidates, key=lambda r: r["Instructor"])[0]
    if len(rows) > 1:
        report["duplicates"].append({"section": key, "rows": len(rows),
                                     "selected_surname": chosen["Instructor"]})
    return chosen


def resolve_instructor(section, names, instructors, existing, report):
    key, surname = section["super_CRN"], section["Instructor"]
    canonical = full_name(names.get(key, ""))
    if canonical and canonical[0] == surname:
        last, first = canonical
        instructor_id = f"{last}-{first}"
    elif existing and existing["Instructor"] in instructors and instructors[existing["Instructor"]]["lastName"] == surname:
        # Preserve a previous full-name match when a subsequent scrape lacks it.
        instructor_id = existing["Instructor"]
        report["unresolved_instructors"].append({"section": key, "source_name": names.get(key),
                                                "assigned": instructor_id, "reason": "retained existing match"})
        return instructor_id
    else:
        # Never guess a person merely because they share a surname/course.
        last, first = surname or "unknown", "staff"
        instructor_id = f"{last}-{first}"
        report["unresolved_instructors"].append({"section": key, "source_name": names.get(key),
                                                "assigned": instructor_id, "reason": "no matching full name"})
    if instructor_id not in instructors:
        instructors[instructor_id] = {
            "lastName": last, "firstName": first, "difficulty": -1, "rating": -1,
            "recommendedPct": -1, "numRatings": 0,
        }
    return instructor_id


def merge_update(data, rows, names, allowed):
    data = copy.deepcopy(data)
    courses, groups, sections, instructors = (data[k] for k in DATA_FILES)
    report = {"added": 0, "updated": 0, "unchanged": 0, "out_of_window": 0,
              "new_courses": [], "duplicates": [], "unresolved_instructors": [], "terms": {}}
    by_section = defaultdict(list)
    for row in rows:
        if (row["Academic Year"], row["Term"]) not in allowed:
            report["out_of_window"] += 1
            continue
        section = convert_row(row)
        by_section[section["super_CRN"]].append(section)
    if not by_section:
        raise ValueError("No grade rows in the requested window; nothing was written")

    next_group = max((int(k) for k in groups), default=-1) + 1
    term_counts = Counter()
    for key, candidates in sorted(by_section.items()):
        section = choose_section(key, candidates, names, report)
        previous = sections.get(key)
        section["Instructor"] = resolve_instructor(section, names, instructors, previous, report)
        course_id = section["course_id"]
        if course_id not in courses:
            subject, code = course_id.split("-", 1)
            courses[course_id] = {
                "id": course_id, "subject": subject, "code": code, "level": int(code[0]),
                "title": section["title"], "repeatability": "", "description": "", "pathways": "",
                "hours": section["Credits"], "crosslist": [], "groupId": next_group, "coreqs": "",
            }
            groups[str(next_group)] = {"id": next_group, "type": None, "requires": [],
                                       "requiredBy": [], "courseID": course_id, "hash": f"{course_id}:"}
            next_group += 1
            report["new_courses"].append(course_id)
        report["added" if previous is None else "unchanged" if previous == section else "updated"] += 1
        sections[key] = section
        term_counts[f"{section['year']} {section['term']}"] += 1

    # Derive counts from the merged history rather than incrementing on each run.
    counts, taught = Counter(), defaultdict(set)
    for key, section in sections.items():
        instructor_id, course_id = section["Instructor"], section["course_id"]
        if instructor_id not in instructors or course_id not in courses or key != section["super_CRN"]:
            raise ValueError(f"Broken section reference: {key}")
        counts[instructor_id] += 1
        taught[instructor_id].add(course_id)
    for key, instructor in instructors.items():
        instructor["CoursesTaught"] = instructor["FrozenCoursesTaught"] = counts[key]
        instructor["Courses"] = sorted(taught[key])
        instructor["FrozenCourses"] = sorted(taught[key])
    report["terms"] = dict(sorted(term_counts.items()))
    return data, report


def load_inputs(data_dir, csv_path, names_path):
    data = {name: json.loads((data_dir / f"{name}.json").read_text()) for name in DATA_FILES}
    with csv_path.open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    names = {}
    for line in names_path.read_text().splitlines():
        if line.strip():
            key, name = line.split(":", 1)
            names[key] = name.strip()
    return data, rows, names


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=RAW_DATA)
    parser.add_argument("--grades", type=Path, help="Default: data-dir/newGradeDistribution.csv")
    parser.add_argument("--instructor-map", type=Path, help="Default: data-dir/superCrnToProfessor.txt")
    parser.add_argument("--output-dir", type=Path, help="Default: data-dir; use another folder to review first")
    parser.add_argument("--from-academic-year", default=DEFAULT_FROM_ACADEMIC_YEAR)
    parser.add_argument("--from-term", choices=TERMS, default=DEFAULT_FROM_TERM)
    parser.add_argument("--to-academic-year", default=DEFAULT_TO_ACADEMIC_YEAR)
    parser.add_argument("--to-term", choices=TERMS, default=DEFAULT_TO_TERM)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    allowed = set(window_pairs(args.from_academic_year, args.from_term, args.to_academic_year, args.to_term))
    data, rows, names = load_inputs(args.data_dir, args.grades or args.data_dir / "newGradeDistribution.csv",
                                   args.instructor_map or args.data_dir / "superCrnToProfessor.txt")
    merged, report = merge_update(data, rows, names, allowed)
    print(json.dumps({k: len(v) if isinstance(v, list) else v for k, v in report.items()}, indent=2))
    if args.dry_run:
        return
    output = args.output_dir or args.data_dir
    output.mkdir(parents=True, exist_ok=True)
    # Serialize everything successfully before replacing any existing files.
    pending = []
    for name, value in {**merged, "grade-update-report": report}.items():
        target = output / f"{name}.json"
        temporary = target.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(value, indent=4, allow_nan=False) + "\n")
        pending.append((temporary, target))
    for temporary, target in pending:
        temporary.replace(target)
    print(f"Wrote merged data and grade-update-report.json to {output}")


if __name__ == "__main__":
    main()
