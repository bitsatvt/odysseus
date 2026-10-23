"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Section } from "../../prisma/generated/prisma/client";
import styles from "./ProfessorsTable.module.css";

type GradeKey = "A" | "B" | "C" | "D" | "F" | "W";
type SortKey = "instructor" | "recentTerm" | "avgGPA" | "numberSections" | GradeKey;
type Combined = { numberSections: number; recentTerm: number; gpaSum: number; grades: Record<GradeKey, number> };
const gradeKeys: GradeKey[] = ["A", "B", "C", "D", "F", "W"];
const gradeColors: Record<GradeKey, string> = { A: "#ed5722", B: "#f18a42", C: "#f3bd63", D: "#8e9c91", F: "#4a514d", W: "#202020" };

function formatName(name: string) {
  const parts = name.split("-");
  const lastName = parts.shift();
  parts.push(lastName!);
  return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function ProfessorsTable({ sections }: { sections: Section[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "avgGPA", direction: "desc" });

  const rows = useMemo(() => {
    const combined = sections.reduce<Record<string, Combined>>((all, section) => {
      const current = all[section.instructorName] ?? { numberSections: 0, recentTerm: 0, gpaSum: 0, grades: { A: 0, B: 0, C: 0, D: 0, F: 0, W: 0 } };
      current.numberSections += 1;
      current.recentTerm = Math.max(current.recentTerm, section.year);
      current.gpaSum += section.gpa;
      current.grades.A += section.gradeData[0] + section.gradeData[1];
      current.grades.B += section.gradeData[2] + section.gradeData[3] + section.gradeData[4];
      current.grades.C += section.gradeData[5] + section.gradeData[6] + section.gradeData[7];
      current.grades.D += section.gradeData[8] + section.gradeData[9] + section.gradeData[10];
      current.grades.F += section.gradeData[11];
      current.grades.W += section.gradeData[12];
      all[section.instructorName] = current;
      return all;
    }, {});

    return Object.entries(combined)
      .map(([instructor, data]) => ({
        instructor,
        numberSections: data.numberSections,
        recentTerm: data.recentTerm,
        avgGPA: data.gpaSum / data.numberSections,
        grades: Object.fromEntries(gradeKeys.map((grade) => [grade, data.grades[grade] / data.numberSections])) as Record<GradeKey, number>,
      }))
      .filter((row) => formatName(row.instructor).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aValue = sort.key === "instructor" ? formatName(a.instructor) : gradeKeys.includes(sort.key as GradeKey) ? a.grades[sort.key as GradeKey] : a[sort.key as Exclude<SortKey, GradeKey | "instructor">];
        const bValue = sort.key === "instructor" ? formatName(b.instructor) : gradeKeys.includes(sort.key as GradeKey) ? b.grades[sort.key as GradeKey] : b[sort.key as Exclude<SortKey, GradeKey | "instructor">];
        return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (sort.direction === "asc" ? 1 : -1);
      });
  }, [query, sections, sort]);

  const requestSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const heading = (label: string, key: SortKey) => (
    <button type="button" onClick={() => requestSort(key)} aria-label={`Sort by ${label}`}>
      {label}<span aria-hidden="true">{sort.key === key ? (sort.direction === "desc" ? " ↓" : " ↑") : " ↕"}</span>
    </button>
  );

  return (
    <div>
      <label className={styles.search}><span>Find an instructor</span><input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search by name" /></label>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>{heading("Instructor", "instructor")}</th><th>{heading("Most recent", "recentTerm")}</th><th>Grade distribution</th><th>{heading("GPA", "avgGPA")}</th><th>{heading("Sections", "numberSections")}</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.instructor}>
                <td><Link href={`../instructors/${row.instructor}`}>{formatName(row.instructor)}</Link></td>
                <td>{row.recentTerm}</td>
                <td>
                  <div className={styles.distribution} aria-label={gradeKeys.map((grade) => `${grade} ${row.grades[grade].toFixed(1)}%`).join(", ")}>
                    {gradeKeys.map((grade) => <span key={grade} style={{ width: `${Math.max(0, row.grades[grade])}%`, background: gradeColors[grade] }} title={`${grade}: ${row.grades[grade].toFixed(1)}%`} />)}
                  </div>
                </td>
                <td>{row.avgGPA.toFixed(2)}</td><td>{row.numberSections}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className={styles.empty}>No instructors match this search.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className={styles.legend}>{gradeKeys.map((grade) => <button type="button" key={grade} onClick={() => requestSort(grade)} aria-pressed={sort.key === grade}><i style={{ background: gradeColors[grade] }} />{grade}{sort.key === grade && (sort.direction === "desc" ? " ↓" : " ↑")}</button>)}</div>
    </div>
  );
}
