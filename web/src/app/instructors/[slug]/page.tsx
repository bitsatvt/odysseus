
import { notFound } from "next/navigation";
import prisma from "@/db";
import InstructorClientComponent from "@/components/InstructorClientComponent"; // Client Component

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    if (!slug) {
        notFound();
    }

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
        <InstructorClientComponent instructor={instructor} />
    );

}

export async function generateStaticParams() {
    const courses = await prisma.instructor.findMany({
        select: {
            id: true
        }
    });
    return courses.map((c) => ({ slug: c.id }))
}