
import { notFound } from "next/navigation";
import prisma from "@/db";
import InstructorClientComponent from "@/components/InstructorClientComponent";
import styles from "./page.module.css";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const instructor = await prisma.instructor.findUnique({
        where: { id: decodeURIComponent(slug) },
        include: {
            courses: {
                include: {
                    sections: {
                        where: { instructorName: decodeURIComponent(slug) }
                    }
                }
            },
        },

    });
    if (!instructor) {
        notFound();
    }
    return (
        <article className={styles.page}>
            <div className={styles.trail} aria-label="Instructor profile">
                <span className={styles.marker} aria-hidden="true" />
                <span className={styles.badge}>PROFESSOR</span>
                <span className={styles.nameChip}>{instructor.firstName} {instructor.lastName}</span>
            </div>
            <InstructorClientComponent instructor={instructor} />
        </article>
    );

}

export async function generateStaticParams() {
    const instructors = await prisma.instructor.findMany({
        select: {
            id: true
        }
    });
    return instructors.map((instructor) => ({ slug: instructor.id }))
}
