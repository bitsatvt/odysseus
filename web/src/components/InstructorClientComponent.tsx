"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { IconSearch } from "@tabler/icons-react";
import type { Course, Instructor, Section } from "../../prisma/generated/prisma/client";
import { sitePath } from "@/site";
import styles from "./InstructorClientComponent.module.css";

type InstructorCourse = Course & { sections: Section[] };
type InstructorDetails = Instructor & { courses: InstructorCourse[] };

const normalize = (value: string) => value.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
const decodeTitle = (title: string | null) => title ? title.replace(/&amp;/g, "&") : "Title unavailable";
const rating = (value: number) => value < 0 ? "N/A" : `${value.toFixed(1)}/10`;
const percentage = (value: number) => value < 0 ? "N/A" : `${value.toFixed(0)}%`;
const PAGE_SIZE = 12;

function PaginatedCourses<T>({ items, children }: { items: T[]; children: (visibleItems: T[]) => ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  return <>
    {children(items.slice(0, visibleCount))}
    {items.length > PAGE_SIZE && <div className={styles.pagination}>
      <span>Showing {Math.min(visibleCount, items.length)} of {items.length}</span>
      {visibleCount < items.length && <button type="button" onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, items.length))}>Show more</button>}
    </div>}
  </>;
}

export default function InstructorClientComponent({ instructor }: { instructor: InstructorDetails }) {
  const [search, setSearch] = useState("");
  const courses = useMemo(() => {
    const query = normalize(search);
    if (!query) return instructor.courses;
    return instructor.courses.filter((course) => normalize(course.id).includes(query) || normalize(course.title || "").includes(query));
  }, [instructor.courses, search]);

  return (
    <>
      <section className={styles.hero} aria-labelledby="instructor-name">
        <div className={styles.identity}>
          <p className={styles.eyebrow}>Instructor profile</p>
          <h1 id="instructor-name">{instructor.firstName} {instructor.lastName}</h1>
          <p className={styles.summary}>Historical teaching and student-feedback information from available Odysseus records.</p>
        </div>
        <dl className={styles.metrics}>
          <div className={styles.primaryMetric}>
            <dt>Sections taught</dt>
            <dd><strong className={styles.metricValue}>{instructor.sectionsTaught}</strong><span className={styles.metricNote}>Recorded total</span></dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd><strong className={styles.metricValue}>{rating(instructor.difficulty)}</strong><span className={styles.metricNote}>{instructor.difficulty < 0 ? "Not available" : "Student reported"}</span></dd>
          </div>
          <div>
            <dt>Overall rating</dt>
            <dd><strong className={styles.metricValue}>{rating(instructor.rating)}</strong><span className={styles.metricNote}>{instructor.rating < 0 ? "Not available" : "Student reported"}</span></dd>
          </div>
          <div>
            <dt>Would recommend</dt>
            <dd><strong className={styles.metricValue}>{percentage(instructor.recommendedPct)}</strong><span className={styles.metricNote}>{instructor.recommendedPct < 0 ? "Not available" : "Student reported"}</span></dd>
          </div>
        </dl>
      </section>

      <section className={styles.courses} aria-labelledby="courses-heading">
        <div className={styles.coursesInner}>
          <div className={styles.headingRow}>
            <div><p className={styles.eyebrow}>Teaching history</p><h2 id="courses-heading">Courses ({courses.length})</h2></div>
            <label className={styles.search}>
              <span className={styles.visuallyHidden}>Find a course</span>
              <IconSearch size={17} aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search courses" />
            </label>
            <p className={styles.courseCount}>{courses.length} {courses.length === 1 ? "course" : "courses"}</p>
          </div>

          <PaginatedCourses key={`${instructor.id}:${search}`} items={courses}>{(visibleCourses) =>
            <div className={styles.tableWrap} tabIndex={0} aria-label="Instructor courses. Scroll horizontally to view all columns.">
              <table>
                <colgroup>
                  <col className={styles.courseColumn} />
                  <col className={styles.titleColumn} />
                  <col className={styles.gpaColumn} />
                  <col className={styles.sectionsColumn} />
                </colgroup>
                <thead><tr><th>Course</th><th>Course title</th><th>Average GPA</th><th>Sections taught</th></tr></thead>
                <tbody>
                  {visibleCourses.map((course) => {
                    const validSections = course.sections.filter((section) => Number.isFinite(section.gpa));
                    const averageGpa = validSections.length
                      ? validSections.reduce((sum, section) => sum + section.gpa, 0) / validSections.length
                      : null;
                    return (
                      <tr key={course.id}>
                        <td><Link href={sitePath(`/courses/${course.id}`)}>{course.id}</Link></td>
                        <td>{decodeTitle(course.title)}</td>
                        <td>{averageGpa === null ? "N/A" : averageGpa.toFixed(2)}</td>
                        <td>{course.sections.length}</td>
                      </tr>
                    );
                  })}
                  {!courses.length && <tr><td className={styles.empty} colSpan={4}>{search ? "No courses match this search." : "No courses are available for this instructor."}</td></tr>}
                </tbody>
              </table>
            </div>}
          </PaginatedCourses>
          <p className={styles.scrollHint}>Scroll horizontally to view every column.</p>
        </div>
      </section>
    </>
  );
}
