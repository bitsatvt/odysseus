# Grade updates through summer 2026

Run these commands from the repository root. Python 3.9+ and Node 22.12+ are required.

## Date conventions

The default window is Winter 2024–25 through calendar summer 2026. It includes
Spring 2025 and Spring 2026, and excludes Fall 2026.

UDC academic years start with summer: calendar summer 2026 is **2026–27** in its
data. Banner combines the modern summer sessions under **202606**. For example,
CS 2114 CRN 60883 meets in July–August 2026 but UDC labels it `Summer I`.
Both UDC summer labels are included. The CSV retains the API's `term_code_full`
as `Term Code` so the processor can match the timetable's exact section IDs.
Older CSVs without that column still work using the academic year and term.

## Install dependencies

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r data/data-utils/requirements.txt
npm --prefix web install
```

## Scrape

```sh
python data/data-utils/scrape_grade_distribution.py
python data/data-utils/scrape_sections.py 10 20
```

These replace `data/raw-data/newGradeDistribution.csv` and
`data/raw-data/superCrnToProfessor.txt` only after successful completion.
The timetable requests public pages; no manually copied session cookie is needed.
The positional numbers control discovery/detail concurrency; reduce them if VT
is busy. Failed HTTP detail requests are retried rather than stored as `N/A`.

To check a single course without replacing the full CSV:

```sh
python data/data-utils/scrape_grade_distribution.py \
  --subject CS --course-number 2114 --output /tmp/cs2114-grades.csv --overwrite
```

The grade scraper and processor accept `--from-academic-year`, `--from-term`,
`--to-academic-year`, and `--to-term`. The timetable accepts `--start-term` and
`--end-term` as Banner codes, plus `--output`. Explicit grade scraper
`--academic-year`/`--term` filters override the date window.

## Preview and merge

```sh
python data/data-utils/process_grade_update.py --dry-run
python data/data-utils/process_grade_update.py --output-dir /tmp/odysseus-grade-update
```

This incremental processor replaces the old `cleanData.py` plus
`augmentSectionsInstructor.py` sequence **for grade updates**. It reads the actual
scraper filenames, preserves historical sections and existing catalog/group IDs,
adds placeholder catalog entries for newly encountered courses, and updates
existing sections by `year;term-code;CRN`. It recalculates instructor counts from
the merged history, so rerunning does not inflate totals. Existing ratings are
preserved; new instructors start with unavailable ratings. Blank percentage cells
are treated as zero only when the other cells account for the full distribution
within rounding error; incomplete distributions stop processing.

Review `grade-update-report.json` in the output folder. Missing/mismatched names
use a surname-plus-`staff` placeholder (or retain a previous matching full name)
and appear in the report. The schema supports one instructor per CRN: duplicate
UDC rows prefer the matching Banner instructor, or a deterministic surname when
their grade data agree. Conflicting values with no unambiguous Banner match stop
processing before any output is changed. Resolve those CRNs in a separate CSV
and pass it with `--grades PATH`; do not sum them without checking whether the
enrollments overlap. The currently stored CSV has one such conflict at
`2025;09;86016` (FST 4994).

To save reviewed results in the repository's normal input directory, rerun
without `--output-dir`. Alternatively import directly from the preview folder.
Do not run the catalog rebuild as part of an incremental update: it can reassign
prerequisite group IDs.

## Import into PostgreSQL

Use `DATABASE_URL` for the intended database. Without it, the existing project
default is `postgresql://postgres@localhost:5432/odysseus-prisma`.

```sh
cd web
npx prisma generate
npm run import-data -- --data-dir /tmp/odysseus-grade-update --dry-run
npm run import-data -- --data-dir /tmp/odysseus-grade-update
```

For a fresh database, run `npx prisma migrate deploy` before importing.
`npx prisma db seed` imports the normal `data/raw-data` files using the same code.
The import validates references first, then upserts records and synchronizes
relations in transactional batches. Records absent from the input are not
deleted. A failed batch exits nonzero; previously completed batches remain and
can be rerun. Keep the merged historical JSON as the source of truth for counts
and course/instructor relationships.

This workflow updates PostgreSQL. A deployed static site still needs a rebuild
and deployment; Typesense's separate search snapshots are not regenerated here.

## Tests

```sh
python -m unittest discover -s data/data-utils -p 'test_*.py'
cd web
npm run test:import
TEST_DATABASE_URL=postgresql://postgres@localhost:5432/odysseus-prisma npm run test:import
```

The optional PostgreSQL test creates a uniquely named temporary schema, applies
the repository migrations there, checks repeated imports, and removes that
schema afterward. It does not seed the application's tables.
