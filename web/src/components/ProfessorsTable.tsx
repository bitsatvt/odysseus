"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Section } from "../../prisma/generated/prisma/client";
import styles from "./ProfessorsTable.module.css";

type GradeKey = "A" | "B" | "C" | "D" | "F" | "W";
type SortKey = "instructor" | "recentTerm" | "avgGPA" | "numberSections" | GradeKey;
type Combined = { numberSections: number; recentTerm: number; gpaSum: number; grades: Record<GradeKey, number> };
const gradeKeys: GradeKey[] = ["A", "B", "C", "D", "F", "W"];
const gradeColors: Record<GradeKey, string> = { A: "#ff7014", B: "#faae65", C: "#ffe18a", D: "#aadaee", F: "#666666", W: "#1d1d1d" };
const PAGE_SIZE = 12;

function PaginatedRows<T>({ items, children }: { items: T[]; children: (visibleItems: T[]) => ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  return <>
    {children(items.slice(0, visibleCount))}
    {items.length > PAGE_SIZE && <div className={styles.pagination}>
      <span>Showing {Math.min(visibleCount, items.length)} of {items.length}</span>
      {visibleCount < items.length && <button type="button" onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, items.length))}>Show more</button>}
    </div>}
  </>;
}

function GradeSegment({ grade, percentage }: { grade: GradeKey; percentage: number }) {
  const segment = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const container = segment.current;
    const text = label.current;
    if (!container || !text) return;
    // Measure the full label, including its padding, after resizing or font loading.
    const measure = () => setFits(text.getBoundingClientRect().width <= container.clientWidth);
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(text);
    measure();
    return () => observer.disconnect();
  }, [percentage]);

  return <span ref={segment} style={{ flexGrow: Math.max(0, percentage), background: gradeColors[grade] }} title={`${grade}: ${percentage.toFixed(1)}%`}>
    <span ref={label} className={styles.barLabel} data-fits={fits} data-dark={grade === "F" || grade === "W"} aria-hidden="true"><b>{grade}</b> {percentage.toFixed(1)}%</span>
  </span>;
}

function formatName(name: string) {
  const [lastName, ...firstNames] = name.split("-");
  return [...firstNames, lastName].map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function ProfessorsTable({ sections, rangeControl }: { sections: Section[]; rangeControl?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "recentTerm", direction: "desc" });
  const rows = useMemo(() => {
    const combined = sections.reduce<Record<string, Combined>>((all, section) => {
      const current = all[section.instructorName] ?? { numberSections: 0, recentTerm: 0, gpaSum: 0, grades: { A: 0, B: 0, C: 0, D: 0, F: 0, W: 0 } };
      const grades = section.gradeData;
      const grade = (index: number) => grades[index] || 0;
      current.numberSections += 1;
      current.recentTerm = Math.max(current.recentTerm, section.year);
      current.gpaSum += section.gpa;
      current.grades.A += grade(0) + grade(1);
      current.grades.B += grade(2) + grade(3) + grade(4);
      current.grades.C += grade(5) + grade(6) + grade(7);
      current.grades.D += grade(8) + grade(9) + grade(10);
      current.grades.F += grade(11);
      current.grades.W += grade(12);
      all[section.instructorName] = current;
      return all;
    }, {});
    return Object.entries(combined).map(([instructor, data]) => ({
      instructor, numberSections: data.numberSections, recentTerm: data.recentTerm,
      avgGPA: data.gpaSum / data.numberSections,
      grades: Object.fromEntries(gradeKeys.map((grade) => [grade, data.grades[grade] / data.numberSections])) as Record<GradeKey, number>,
    })).filter((row) => formatName(row.instructor).toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => {
        const value = (row: typeof a) => sort.key === "instructor" ? formatName(row.instructor) : gradeKeys.includes(sort.key as GradeKey) ? row.grades[sort.key as GradeKey] : row[sort.key as Exclude<SortKey, GradeKey | "instructor">];
        const aValue = value(a), bValue = value(b);
        return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * (sort.direction === "asc" ? 1 : -1);
      });
  }, [query, sections, sort]);
  const paginationKey = useMemo(() => `${query}:${sort.key}:${sort.direction}:${sections.map((section) => section.id).join(",")}`, [query, sections, sort]);

  const requestSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));
  const heading = (label: string, key: SortKey) => <th scope="col" aria-sort={sort.key === key ? sort.direction === "asc" ? "ascending" : "descending" : "none"}>
    <button type="button" onClick={() => requestSort(key)} aria-label={`Sort by ${label}${key === "A" ? " (A grades)" : ""}`}>{label}<span aria-hidden="true">{sort.key === key && sort.direction === "asc" ? "↑" : "↓"}</span></button>
  </th>;

  return (
    <section aria-labelledby="instructors-heading">
      <div className={styles.toolbar}>
        <h2 id="instructors-heading">Instructors ({rows.length})</h2>
        <div className={styles.controls}>{rangeControl}<label className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></svg>
          <input aria-label="Find an instructor" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Instructor name" />
        </label></div>
      </div>
      <PaginatedRows key={paginationKey} items={rows}>{(visibleRows) =>
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Instructor statistics. Scroll horizontally on smaller screens.">
          <table>
            <colgroup><col className={styles.nameColumn} /><col className={styles.termColumn} /><col className={styles.distributionColumn} /><col className={styles.withdrawalColumn} /><col className={styles.gpaColumn} /><col className={styles.sectionsColumn} /></colgroup>
            <thead><tr>{heading("Instructor", "instructor")}{heading("Most recent term", "recentTerm")}{heading("Distribution", "A")}{heading("W%", "W")}{heading("GPA", "avgGPA")}{heading("# Sections", "numberSections")}</tr></thead>
            <tbody>
              {visibleRows.map((row) => <tr key={row.instructor}>
                <td><Link href={`../instructors/${row.instructor}`}>{formatName(row.instructor)}</Link></td>
                <td>{row.recentTerm}</td>
                <td><div className={styles.distribution} role="img" aria-label={gradeKeys.map((grade) => `${grade} ${row.grades[grade].toFixed(1)}%`).join(", ")}>
                  {gradeKeys.map((grade) => <GradeSegment key={grade} grade={grade} percentage={row.grades[grade]} />)}
                </div></td>
                <td>{Number(row.grades.W.toFixed(1))}%</td><td>{row.avgGPA.toFixed(2)}</td><td>{row.numberSections}</td>
              </tr>)}
              {!rows.length && <tr><td colSpan={6} className={styles.empty}>{sections.length ? "No instructors match this search." : "No instructor data available."}</td></tr>}
            </tbody>
          </table>
        </div>}
      </PaginatedRows>
    </section>
  );
}
