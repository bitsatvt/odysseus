"use client";

import { useMemo, useState } from "react";
import type { Course, Section } from "../../prisma/generated/prisma/client";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import styles from "./CourseClientComponent.module.css";

const ranges = [
  { label: "3 years", value: "3" },
  { label: "5 years", value: "5" },
  { label: "10 years", value: "10" },
  { label: "All", value: "all" },
];

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
  const latestYear = sections.length
    ? Math.max(...sections.map((section) => section.year))
    : new Date().getFullYear();
  const [range, setRange] = useState("5");
  const filteredSections = useMemo(() => {
    if (range === "all") return sections;
    const earliestYear = latestYear - Number(range) + 1;
    return sections.filter((section) => section.year >= earliestYear);
  }, [latestYear, range, sections]);

  const metrics = useMemo(() => {
    if (!filteredSections.length) return null;
    const average = (select: (section: Section) => number) =>
      filteredSections.reduce((sum, section) => sum + select(section), 0) / filteredSections.length;
    const gpa = average((section) => section.gpa || 0);
    return {
      gpa,
      grade: gpaToLetterGrade(gpa),
      aRate: average((section) => section.gradeData[0] || 0),
      withdrawalRate: average((section) => section.gradeData[12] || 0),
      enrollment: average((section) => section.enrollment || 0),
    };
  }, [filteredSections]);

  return (
    <section className={styles.analytics} aria-labelledby="course-statistics-heading">
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>Historical outcomes</p>
          <h2 id="course-statistics-heading">Course statistics</h2>
        </div>
        <div className={styles.rangeControl} aria-label="Filter course data by year range">
          {ranges.map((item) => (
            <button key={item.value} type="button" className={range === item.value ? styles.active : ""} aria-pressed={range === item.value} onClick={() => setRange(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.primaryMetric}><span>Average grade</span><strong>{metrics ? metrics.grade : "N/A"}</strong><small>{metrics ? `${metrics.gpa.toFixed(2)} GPA` : "No data"}</small></div>
        <div><span>Sections taught</span><strong>{filteredSections.length}</strong></div>
        <div><span>Strict A rate</span><strong>{metrics ? `${metrics.aRate.toFixed(1)}%` : "N/A"}</strong></div>
        <div><span>Withdrawal rate</span><strong>{metrics ? `${metrics.withdrawalRate.toFixed(1)}%` : "N/A"}</strong></div>
        <div><span>Average class size</span><strong>{metrics ? Math.round(metrics.enrollment) : "N/A"}</strong></div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeading}><p>Teaching history</p><h3>Instructors</h3></div>
        <ProfessorsTable sections={filteredSections} />
      </div>

      <div className={styles.block}>
        <div className={styles.blockHeading}><p>Term by term</p><h3>Grade distribution</h3></div>
        <SectionsGraph sections={filteredSections} />
      </div>
    </section>
  );
}
