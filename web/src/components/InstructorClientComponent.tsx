"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course, Instructor, Section } from "../../prisma/generated/prisma/client";
import { sitePath } from "@/site";
import styles from "./InstructorClientComponent.module.css";

type InstructorCourse = Course & { sections: Section[] };
type InstructorDetails = Instructor & { courses: InstructorCourse[] };

const normalize = (value: string) => value.toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9]/g, "");
const decodeTitle = (title: string | null) => title ? title.replace(/&amp;/g, "&") : "Title unavailable";
const rating = (value: number) => value < 0 ? "N/A" : `${value.toFixed(1)}/10`;
const percentage = (value: number) => value < 0 ? "N/A" : `${value.toFixed(0)}%`;

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
        <div className={styles.metrics}>
          <div className={styles.primaryMetric}><span>Sections taught</span><strong>{instructor.sectionsTaught}</strong><small>Recorded total</small></div>
          <div><span>Difficulty</span><strong>{rating(instructor.difficulty)}</strong><small>{instructor.difficulty < 0 ? "Not available" : "Student reported"}</small></div>
          <div><span>Overall rating</span><strong>{rating(instructor.rating)}</strong><small>{instructor.rating < 0 ? "Not available" : "Student reported"}</small></div>
          <div><span>Would recommend</span><strong>{percentage(instructor.recommendedPct)}</strong><small>{instructor.recommendedPct < 0 ? "Not available" : "Student reported"}</small></div>
        </div>
      </section>

      <section className={styles.courses} aria-labelledby="courses-heading">
        <div className={styles.headingRow}>
          <div><p className={styles.eyebrow}>Teaching history</p><h2 id="courses-heading">Courses</h2></div>
          <p className={styles.courseCount}>{courses.length} {courses.length === 1 ? "course" : "courses"}</p>
        </div>

        <label className={styles.search}>
          <span>Find a course</span>
          <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search by course or title" />
        </label>

        <div className={styles.tableWrap} tabIndex={0} aria-label="Instructor courses. Scroll horizontally to view all columns.">
          <table>
            <thead><tr><th>Course</th><th>Course title</th><th>Average GPA</th><th>Sections taught</th></tr></thead>
            <tbody>
              {courses.map((course) => {
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
        </div>
        <p className={styles.scrollHint}>Scroll horizontally to view every column.</p>
      </section>
    </>
  );
}
