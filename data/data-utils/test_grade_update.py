import copy
import unittest
from unittest.mock import patch

import scrape_grade_distribution as grades
import scrape_sections as timetable
from grade_terms import row_term, window_pairs
from process_grade_update import GRADES, convert_row, merge_update


def row(year="2026-27", term="Summer I", crn="60883", instructor="Emebo", **changes):
    value = {"Academic Year": year, "Term": term, "CRN": crn, "Instructor": instructor,
             "Subject": "CS", "Course No.": "2114", "Course Title": "Software Design",
             "GPA": "3.2", "Graded Enrollment": "9", "Withdraws": "1", "Credits": "3"}
    value.update({f"{grade} (%)": "100" if grade == "A" else "0" for grade in GRADES})
    value.update(changes)
    return value


class GradeUpdateTests(unittest.TestCase):
    def setUp(self):
        self.args = grades.parse_args([])
        self.allowed = set(window_pairs(self.args.from_academic_year, self.args.from_term,
                                       self.args.to_academic_year, self.args.to_term))
        empty = {"class": {}, "group": {}, "section": {}, "instructors": {}}
        historical = row("2024-25", "Fall", "12345")
        self.data, _ = merge_update(empty, [historical], {"2024;09;12345": "Emebo, Onyeka"}, {("2024-25", "Fall")})
        self.data["instructors"]["emebo-onyeka"]["rating"] = 8.5

    def test_window_includes_missing_spring_and_both_summers_but_not_fall_2026(self):
        for year, term in [("2024-25", "Winter"), ("2024-25", "Spring"),
                           ("2025-26", "Summer I"), ("2025-26", "Spring"),
                           ("2026-27", "Summer I"), ("2026-27", "Summer II")]:
            self.assertTrue(grades.row_in_window({"academic_year": year, "term": term}, self.args))
            self.assertIn(f'"academic_year"=\'{year}\' AND "term"=\'{term}\'', grades.selected_window(self.args))
        for year, term in [("2024-25", "Fall"), ("2026-27", "Fall"), ("2026-27", "Spring")]:
            self.assertFalse(grades.row_in_window({"academic_year": year, "term": term}, self.args))

    def test_explicit_filters_override_default_window(self):
        args = grades.parse_args(["--academic-year", "2026-27", "--term", "Fall"])
        self.assertIsNone(grades.selected_window(args))
        self.assertTrue(grades.row_in_window({"academic_year": "2026-27", "term": "Fall"}, args))
        self.assertFalse(grades.row_in_window({"academic_year": "2026-27", "term": "Summer I"}, args))

    def test_calendar_year_and_source_term_codes(self):
        self.assertEqual(row_term(row("2025-26", "Spring")), "202601")
        self.assertEqual(row_term(row()), "202606")
        self.assertEqual(row_term(row(term="Summer II", **{"Term Code": "202606"})), "202606")
        self.assertEqual(row_term(row("2019-20", "Summer II")), "201907")
        with self.assertRaises(ValueError):
            row_term(row(**{"Term Code": "202506"}))

    def test_merge_preserves_history_catalog_ratings_and_reruns_without_double_counting(self):
        original = copy.deepcopy(self.data)
        rows = [row(), row("2026-27", "Fall", "99999")]
        names = {"2026;06;60883": "Emebo, Onyeka"}
        merged, report = merge_update(self.data, rows, names, self.allowed)
        self.assertEqual(report["added"], 1)
        self.assertEqual(report["out_of_window"], 1)
        self.assertEqual(self.data, original)
        self.assertEqual(merged["section"]["2024;09;12345"], original["section"]["2024;09;12345"])
        self.assertEqual(merged["group"], original["group"])
        instructor = merged["instructors"]["emebo-onyeka"]
        self.assertEqual(instructor["CoursesTaught"], 2)
        self.assertEqual(instructor["rating"], 8.5)
        self.assertEqual(merged["section"]["2026;06;60883"]["Grades_Dist"], [90.0] + [0.0]*11 + [10.0])
        repeated, report = merge_update(merged, rows, names, self.allowed)
        self.assertEqual(repeated, merged)
        self.assertEqual(report["unchanged"], 1)
        revised, _ = merge_update(merged, [row(GPA="3.8")], names, self.allowed)
        self.assertEqual(revised["section"]["2026;06;60883"]["GPA"], 3.8)
        self.assertEqual(revised["instructors"]["emebo-onyeka"]["CoursesTaught"], 2)

    def test_new_courses_append_groups_and_missing_names_are_reported(self):
        merged, report = merge_update(self.data, [row(**{"Course No.": "9999"})], {}, self.allowed)
        self.assertEqual(merged["class"]["CS-9999"]["groupId"], 1)
        self.assertEqual(merged["group"]["0"], self.data["group"]["0"])
        self.assertEqual(merged["section"]["2026;06;60883"]["Instructor"], "emebo-staff")
        self.assertEqual(len(report["unresolved_instructors"]), 1)

    def test_duplicates_prefer_banner_and_reject_conflicting_values(self):
        rows = [row(instructor="Other"), row()]
        merged, report = merge_update(self.data, rows, {"2026;06;60883": "Emebo, Onyeka"}, self.allowed)
        self.assertEqual(merged["section"]["2026;06;60883"]["Instructor"], "emebo-onyeka")
        self.assertEqual(len(report["duplicates"]), 1)
        with self.assertRaisesRegex(ValueError, "Conflicting grade rows"):
            merge_update(self.data, [row(), row(GPA="2")], {}, self.allowed)

    def test_zero_enrollment_and_nonfinite_grades_are_rejected(self):
        for invalid in [row(**{"Graded Enrollment": "0", "Withdraws": "0"}), row(GPA="nan")]:
            with self.assertRaises(ValueError):
                convert_row(invalid)

    def test_blank_zero_percent_cells_require_a_complete_distribution(self):
        self.assertEqual(convert_row(row(**{"D- (%)": ""}))["Grades_Dist"],
                         [90.0] + [0.0]*11 + [10.0])
        with self.assertRaisesRegex(ValueError, "Incomplete grade distribution"):
            convert_row(row(**{"A (%)": "50", "D- (%)": ""}))

    def test_timetable_uses_unified_summer_and_retries_http_failure(self):
        html = '<select name="SUBJ_CODE"><option value="CS">CS</option></select><select name="TERMYEAR">' + ''.join(
            f'<option value="{code}">{code}</option>' for code in ["202412", "202601", "202606", "202609"]
        ) + '</select>'
        with patch.object(timetable, "get_landing_page", return_value=html):
            _, terms = timetable.get_subjects_and_terms()
        self.assertEqual([t["value"] for t in terms], ["202412", "202601", "202606"])
        with patch.object(timetable, "request_text", return_value=(503, "unavailable")):
            self.assertIsNone(timetable.fetch_instructor({"params": {}, "super_crn": "2026;06;60883"}))


if __name__ == "__main__":
    unittest.main()
