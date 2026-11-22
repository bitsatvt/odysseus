"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Course, Section } from "../../prisma/generated/prisma/client";
import type { RequirementNode } from "@/server/utils/fetchTrees";
import { courseLabel, courseTitle, subjectName } from "@/lib/course-format";
import Header from "./Header";
import SubjectIcon from "./SubjectIcon";
import PrereqTreeRenderer from "./PrereqTreeRenderer";
import PostreqTreeRenderer from "./PostreqTreeRenderer";
import CourseClientComponent from "./CourseClientComponent";
import styles from "@/app/courses/[slug]/page.module.css";

export interface CourseViewProps {
  course: Course & { sections: Section[]; crosslist: Course[] };
  prereqTree: RequirementNode | null;
  postreqTree: RequirementNode | null;
}

export default function CourseView({ course, prereqTree, postreqTree }: CourseViewProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [canExpandDescription, setCanExpandDescription] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const title = courseTitle(course.title);
  const description = course.description ? courseTitle(course.description) : "No description available.";
  const department = subjectName(course.subject);
  const pathways = course.pathways?.split(",").map((pathway) => pathway.trim()).filter(Boolean) || [];
  const credits = course.hours?.replace(/\s*credits?\s*$/i, "");

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element || descriptionExpanded) return;
    const measure = () => setCanExpandDescription(element.scrollHeight > element.clientHeight + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [description, descriptionExpanded]);

  return (
    <>
      <Header variant="course" />
      <article className={styles.page} id="course-top">
        <div className={styles.overview}>
          <nav className={styles.courseTrail} aria-label="Course classification">
            <span className={styles.subjectBadge}><SubjectIcon subject={course.subject} /><span><strong>{course.subject}</strong>{department && <span className={styles.departmentName}> - {department}</span>}</span></span>
            <span className={styles.trailArrow} aria-hidden="true">→</span>
            <span className={styles.courseChip}>{courseLabel(course.id)}: {title}</span>
          </nav>
          <section className={styles.heroCard} aria-labelledby="course-title">
            <div className={styles.identity}>
              <p className={styles.eyebrow}>{courseLabel(course.id)}</p>
              <h1 id="course-title"><SubjectIcon subject={course.subject} /><span>{title}</span></h1>
              <p className={styles.hours}>{credits ? <><strong>{credits}</strong> Course Hours</> : "Credit hours unavailable"}</p>
              <div className={styles.pathways}><strong>Pathways</strong>{pathways.length ? pathways.map((pathway) => {
                const match = pathway.match(/^(\S+)\s+(.*)$/);
                return <span key={pathway}>{match ? <><b>{match[1]}</b> {match[2].replace(/\.$/, "")}</> : pathway}</span>;
              }) : <span>None</span>}</div>
            </div>
            <div className={styles.details}>
              <h2>Description</h2>
              <div className={`${styles.description} ${descriptionExpanded ? styles.descriptionExpanded : ""}`}>
                <p id="course-description" ref={descriptionRef}>{description}</p>
                {canExpandDescription && <button type="button" aria-expanded={descriptionExpanded} aria-controls="course-description" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>{descriptionExpanded ? "See less" : "See more"}</button>}
              </div>
              <dl className={styles.relationships}>
                <div><dt>Cross-listed</dt><dd>{course.crosslist.length ? course.crosslist.map((item, index) => <span key={item.id}>{index > 0 && ", "}<Link href={`./${item.id}`}>{item.id}</Link></span>) : "None"}</dd></div>
                <div><dt>Required by</dt><dd>{postreqTree ? <PostreqTreeRenderer tree={postreqTree} /> : "None"}</dd></div>
                <div><dt>Repeatability</dt><dd>{course.repeatability || "None"}</dd></div>
              </dl>
            </div>
          </section>
          <PrereqTreeRenderer tree={prereqTree} />
        </div>
        <CourseClientComponent course={course} />
      </article>
    </>
  );
}
