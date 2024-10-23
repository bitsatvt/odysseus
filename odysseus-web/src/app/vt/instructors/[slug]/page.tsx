
import { notFound } from "next/navigation";
import prisma from "@/db";
import InstructorClientComponent from "@/components/InstructorClientComponent"; // Client Component

export default async function Page({ params }: { params: { slug: string } }) {
    const instructor = await prisma.instructor.findUnique({
        where: { id: decodeURIComponent(params.slug) },
        include: {
            courses: {
                include: {
                    sections: {
                        where: { instructorName: decodeURIComponent(params.slug) }
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