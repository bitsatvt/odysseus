"""UDC academic years start with summer; Spring belongs to the following year."""

TERMS = ("Summer I", "Summer II", "Fall", "Winter", "Spring")
TERM_CODES = {"Summer I": "06", "Summer II": "07", "Fall": "09", "Winter": "12", "Spring": "01"}
DEFAULT_FROM_ACADEMIC_YEAR = "2024-25"
DEFAULT_FROM_TERM = "Winter"
DEFAULT_TO_ACADEMIC_YEAR = "2026-27"
DEFAULT_TO_TERM = "Summer II"


def academic_year_start(value):
    start, end = value.split("-")
    year = int(start)
    if len(start) != 4 or end != str(year + 1)[-2:]:
        raise ValueError(f"Invalid academic year: {value!r}; expected YYYY-YY")
    return year


def term_position(academic_year, term):
    return academic_year_start(academic_year), TERMS.index(term)


def window_pairs(from_year, from_term, to_year, to_term):
    start = term_position(from_year, from_term)
    end = term_position(to_year, to_term)
    if start > end:
        raise ValueError("The start term must be before or equal to the end term")
    for year in range(start[0], end[0] + 1):
        label = f"{year}-{str(year + 1)[-2:]}"
        for index, term in enumerate(TERMS):
            if start <= (year, index) <= end:
                yield label, term


def banner_term(academic_year, term):
    year = academic_year_start(academic_year) + (term == "Spring")
    return f"{year}{TERM_CODES[term]}"


def row_term(row):
    """Prefer the source's Banner code when supplied, including unified summers."""
    code = str(row.get("Term Code", "")).strip()
    if code:
        if len(code) != 6 or not code.isdigit() or code[4:] not in TERM_CODES.values():
            raise ValueError(f"Invalid Banner term code: {code!r}")
        expected = banner_term(row["Academic Year"], row["Term"])
        if code[:4] != expected[:4]:
            raise ValueError(f"Banner term {code} disagrees with academic year {row['Academic Year']}")
        months = {"06", "07"} if row["Term"] in ("Summer I", "Summer II") else {expected[4:]}
        if code[4:] not in months:
            raise ValueError(f"Banner term {code} disagrees with term {row['Term']}")
        return code
    return banner_term(row["Academic Year"], row["Term"])
