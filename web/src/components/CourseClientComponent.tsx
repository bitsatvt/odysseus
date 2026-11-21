"use client";

import { useMemo, useState } from "react";
import type { Course, Section } from "../../prisma/generated/prisma/client";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import styles from "./CourseClientComponent.module.css";

const ranges = [3, 5, 10];
function gpaToLetterGrade(gpa: number) {
  if (gpa >= 3.85) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.15) return "B+";
  if (gpa >= 2.85) return "B";
  if (gpa >= 2.5) return "B-";
  if (gpa >= 2.15) return "C+";
  if (gpa >= 1.85) return "C";
  if (gpa >= 1.5) return "C-";
  if (gpa >= 1.15) return "D+";
  if (gpa >= .85) return "D";
  return "F";
}

export default function CourseClientComponent({ course }: { course: Course & { sections: Section[] } }) {
  const sections = course.sections;
  const latestYear = sections.length ? Math.max(...sections.map((section) => section.year)) : new Date().getFullYear();
  const [range, setRange] = useState(3);
  const filteredSections = useMemo(() => sections.filter((section) => section.year >= latestYear - range + 1), [latestYear, range, sections]);
  const metrics = useMemo(() => {
    if (!filteredSections.length) return null;
    const average = (select: (section: Section) => number) => filteredSections.reduce((sum, section) => sum + select(section), 0) / filteredSections.length;
    const gpa = average((section) => section.gpa || 0);
    return {
      gpa, grade: gpaToLetterGrade(gpa),
      aRate: average((section) => section.gradeData[0] || 0),
      withdrawals: average((section) => section.enrollment * (section.gradeData[12] || 0) / 100),
      enrollment: average((section) => section.enrollment || 0),
    };
  }, [filteredSections]);

  const rangeControl = <div className={styles.rangeControl} aria-label="Filter historical data by year range">
    {ranges.map((years) => <button key={years} type="button" className={range === years ? styles.active : ""} aria-pressed={range === years} title={`${latestYear - years + 1}–${latestYear}`} onClick={() => setRange(years)}>Last {years} years</button>)}
  </div>;

  return (
    <section className={styles.analytics} aria-label="Course statistics">
      <div className={styles.inner}>
        <dl className={styles.metrics}>
          <div className={styles.primaryMetric}><dt>AVG. GRADE</dt><dd>{metrics?.grade ?? "N/A"}</dd></div>
          <div><dt>Sections Taught</dt><dd>{filteredSections.length}</dd></div>
          <div><dt>Avg. GPA</dt><dd>{metrics ? `${metrics.gpa.toFixed(2)} / 4` : "N/A"}</dd></div>
          <div><dt>Strict A rate <span className={styles.info} tabIndex={0} aria-label="Strict A rate includes A grades only, excluding A-minus." title="A grades only; excludes A-minus.">i</span></dt><dd>{metrics ? `${metrics.aRate.toFixed(0)}%` : "N/A"}</dd></div>
          <div><dt>Avg. withdrawals</dt><dd>{metrics ? `${metrics.withdrawals.toFixed(1)} students/section` : "N/A"}</dd></div>
          <div><dt>Avg. class size</dt><dd>{metrics ? `~${Math.round(metrics.enrollment)}` : "N/A"}</dd></div>
        </dl>
        <ProfessorsTable sections={filteredSections} rangeControl={rangeControl} />
        <section className={styles.graphSection} aria-labelledby="grade-distribution-heading">
          <h2 id="grade-distribution-heading">Grade Distribution Over Time</h2>
          <div className={styles.graphSurface}>{filteredSections.length ? <SectionsGraph sections={filteredSections} /> : <p className={styles.empty}>No grade distribution data available.</p>}</div>
        </section>
      </div>
    </section>
  );
}
