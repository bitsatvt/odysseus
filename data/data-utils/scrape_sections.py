"""Scrape VT timetable section instructors.

This script writes lines like:

    2024;12;40002:Tew, Gregory

The timetable search page gives us CRNs. The section detail page gives the
canonical instructor name in "Last, First" form, so we fetch both pages.
"""

import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcRequest"
COMMENTS_URL = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcComments"

# Banner term codes for Winter 2024-25 through Spring 2026.
START_TERM = "202412"
END_TERM = "202601"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "raw-data" / "superCrnToProfessor.txt"

# Command line:
#   python scrape_sections.py 25 50
# first number = subject/term search workers, second number = instructor detail workers
DISCOVERY_WORKERS = 25
FETCH_WORKERS = 50
REQUEST_TIMEOUT = 45
MAX_RETRIES = 8
MAX_POOL_ROUNDS = 10

THREAD_LOCAL = threading.local()
HEADERS = {
    "User-Agent": "Mozilla/5.0",
}


def get_session():
    """Keep one requests session per worker thread."""
    if not hasattr(THREAD_LOCAL, "session"):
        THREAD_LOCAL.session = requests.Session()
        THREAD_LOCAL.session.headers.update(HEADERS)
    return THREAD_LOCAL.session


def request_text(method, url, **kwargs):
    """Fetch a page with retries.

    Banner sometimes returns "no available server" with a 503 during busy
    periods. Treat that as retryable, but keep the final status for errors.
    """
    last_status = 0
    last_text = ""
    for attempt in range(MAX_RETRIES):
        try:
            res = get_session().request(method, url, timeout=REQUEST_TIMEOUT, **kwargs)
            text = res.text
            last_status = res.status_code
            last_text = text
            if res.status_code < 500 and "no available server" not in text.lower():
                return res.status_code, text
        except requests.RequestException:
            pass
        time.sleep(min(5, 0.5 * (attempt + 1)))
    return last_status, last_text


def parse_options(html, select_name):
    soup = BeautifulSoup(html, "html.parser")
    select = soup.find("select", {"name": select_name})
    if not select:
        return []
    return [
        (opt.get("value"), opt.text.strip())
        for opt in select.find_all("option")
        if opt.get("value") and opt.get("value") != "%"
    ]


def get_landing_page(history):
    params = {"history": "Y"} if history == "Y" else None
    status, text = request_text("GET", BASE_URL, params=params)
    if status != 200:
        raise RuntimeError(f"Could not load timetable page for history={history}: HTTP {status}")
    return text


def get_subjects_and_terms():
    """Read the subject list and the allowed term window from Banner."""
    pages = {
        "Y": get_landing_page("Y"),
        "N": get_landing_page("N"),
    }

    subjects = sorted(
        {
            value
            for html in pages.values()
            for value, _ in parse_options(html, "SUBJ_CODE")
        }
    )

    terms = {}
    for history, html in pages.items():
        for value, label in parse_options(html, "TERMYEAR"):
            if value.isdigit() and len(value) == 6 and START_TERM <= value <= END_TERM:
                terms[value] = {"value": value, "label": label, "history": history}

    ordered_terms = [terms[value] for value in sorted(terms)]
    print(f"Found {len(subjects)} subjects.")
    print("Terms to scrape: " + ", ".join(f"{t['value']} ({t['label']})" for t in ordered_terms))
    return subjects, ordered_terms


def discover_refs(term, subject):
    """Find all section-detail links for one subject in one term."""
    payload = {
        "CAMPUS": "0",
        "TERMYEAR": term["value"],
        "CORE_CODE": "AR%",
        "SUBJ_CODE": subject,
        "SCHDTYPE": "%",
        "CRSE_NUMBER": "",
        "crn": "",
        "open_only": "",
        "history": term["history"],
        "BTN_PRESSED": "FIND class sections",
        "inst_name": "",
    }
    status, text = request_text("POST", BASE_URL, data=payload)
    if status != 200:
        return None

    year = term["value"][:4]
    term_code = term["value"][4:]
    refs = []
    for match in re.finditer(
        r"HZSKVTSC\.P_ProcComments\?CRN=(\d+)&TERM=([^&]+)&YEAR=(\d+)&SUBJ=([^&]+)&CRSE=([^&\"\\]+)&history=([YN])",
        text,
    ):
        crn, term_from_url, year_from_url, subj, crse, history = match.groups()
        refs.append(
            {
                "super_crn": f"{year};{term_code};{crn}",
                "params": {
                    "CRN": crn,
                    "TERM": term_from_url,
                    "YEAR": year_from_url,
                    "SUBJ": subj,
                    "CRSE": crse,
                    "history": history,
                },
            }
        )
    return refs


def parse_instructor(html):
    """Extract the canonical instructor name from a section detail page."""
    soup = BeautifulSoup(html, "html.parser")
    instructor_label = soup.find("td", class_="mplabel", string="Instructor")
    if not instructor_label:
        return "N/A"

    instructor_name_row = instructor_label.find_next("tr")
    if not instructor_name_row:
        return "N/A"

    instructor_name_cell = instructor_name_row.find("td", class_="mpdefault")
    if not instructor_name_cell:
        return "N/A"

    instructor = instructor_name_cell.get_text(" ", strip=True)
    return instructor or "N/A"


def fetch_instructor(ref):
    """Return one output row for a section."""
    status, text = request_text("GET", COMMENTS_URL, params=ref["params"])
    if status != 200:
        return f"{ref['super_crn']}:N/A"
    return f"{ref['super_crn']}:{parse_instructor(text)}"


def run_pool(items, workers, fn, label):
    """Run a simple retrying thread pool and lower pressure if Banner struggles."""
    results = []
    pending = list(items)
    round_number = 1
    current_workers = workers

    while pending and round_number <= MAX_POOL_ROUNDS:
        total = len(pending)
        failed = []
        print(f"{label} round {round_number}: {total} items with {current_workers} workers")

        with ThreadPoolExecutor(max_workers=current_workers) as executor:
            future_to_item = {executor.submit(fn, item): item for item in pending}
            for completed, future in enumerate(as_completed(future_to_item), start=1):
                item = future_to_item[future]
                try:
                    result = future.result()
                except Exception:
                    result = None

                if result is None:
                    failed.append(item)
                else:
                    results.append(result)

                if completed % 100 == 0:
                    print(f"  {label}: {completed}/{total}")

        if not failed:
            return results

        failure_rate = len(failed) / total
        if failure_rate > 0.2 and current_workers > 5:
            current_workers = max(5, current_workers // 2)
        sleep_seconds = min(30, 2 * round_number)
        print(f"  Retrying {len(failed)} failed {label.lower()} items after {sleep_seconds}s.")
        time.sleep(sleep_seconds)
        pending = failed
        round_number += 1

    raise RuntimeError(f"{label} failed for {len(pending)} items after {MAX_POOL_ROUNDS} rounds.")


def scrape(discovery_workers, fetch_workers):
    """Scrape all configured terms and replace the output file on success."""
    subjects, terms = get_subjects_and_terms()

    discovery_items = [(term, subject) for term in terms for subject in subjects]
    discovered = run_pool(
        discovery_items,
        discovery_workers,
        lambda item: discover_refs(item[0], item[1]),
        "Discovery",
    )

    unique_refs = {}
    for refs in discovered:
        for ref in refs:
            unique_refs[ref["super_crn"]] = ref

    print(f"Discovered {len(unique_refs)} unique section refs.")
    rows = run_pool(list(unique_refs.values()), fetch_workers, fetch_instructor, "Instructor fetch")

    unique_rows = {}
    for row in rows:
        unique_rows[row.split(":", 1)[0]] = row

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = OUTPUT_PATH.with_suffix(".txt.tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        for row in sorted(unique_rows.values()):
            f.write(row + "\n")
    tmp_path.replace(OUTPUT_PATH)

    print(f"Done. Wrote {len(unique_rows)} section instructor entries to {OUTPUT_PATH}.")


def main():
    import sys

    discovery_workers = int(sys.argv[1]) if len(sys.argv) > 1 else DISCOVERY_WORKERS
    fetch_workers = int(sys.argv[2]) if len(sys.argv) > 2 else FETCH_WORKERS
    scrape(discovery_workers, fetch_workers)


if __name__ == "__main__":
    main()
