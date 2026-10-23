import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/db";
import CourseClientComponent from "@/components/CourseClientComponent";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { fetchPostreqTree, fetchPrereqTree } from "@/server/utils/fetchTrees";
import styles from "./page.module.css";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { id: slug },
    include: { group: true, sections: true, crosslist: true },
  });

  if (!course) notFound();

  const prereqTree = await fetchPrereqTree(course.groupId!, 1);
  const postreqTree = await fetchPostreqTree(course.groupId!, course.id, 1);

  return (
    <article className={styles.page}>
      <div className={styles.courseTrail} aria-label="Course classification">
        <span className={styles.marker} aria-hidden="true" />
        <span className={styles.subjectBadge}>{course.subject}</span>
        <span className={styles.courseChip}>{course.id}</span>
      </div>

      <section className={styles.heroCard} aria-labelledby="course-title">
        <div className={styles.identity}>
          <p className={styles.eyebrow}>{course.id}</p>
          <h1 id="course-title">{course.title}</h1>
          <div className={styles.quickFacts}>
            <span>{course.hours || "Credit hours unavailable"}</span>
            <span>{course.pathways || "No pathways listed"}</span>
          </div>
        </div>

        <dl className={styles.details}>
          <div>
            <dt>Description</dt>
            <dd>{course.description || "No description available."}</dd>
          </div>
          <div>
            <dt>Cross-listed</dt>
            <dd>
              {course.crosslist.length
                ? course.crosslist.map((item, index) => (
                    <span key={item.id}>
                      {index > 0 && ", "}
                      <Link href={`./${item.id}`}>{item.id}</Link>
                    </span>
                  ))
                : "N/A"}
            </dd>
          </div>
          <div>
            <dt>Required by</dt>
            <dd><PostreqTreeRenderer tree={postreqTree} /></dd>
          </div>
          <div>
            <dt>Repeatability</dt>
            <dd>{course.repeatability || "N/A"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.requirements} aria-labelledby="prerequisites-heading">
        <p className={styles.sectionLabel}>Course relationships</p>
        <h2 id="prerequisites-heading">Pre-requisites</h2>
        <div className={styles.treeSurface}>
          <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={false} />
        </div>
        <div className={styles.corequisites}>
          <h3>Co-requisites</h3>
          <p>{course.coreqs || "N/A"}</p>
        </div>
      </section>

      <CourseClientComponent course={course} />
    </article>
  );
}

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({ select: { id: true } });
  return courses.map((course) => ({ slug: course.id }));
}
