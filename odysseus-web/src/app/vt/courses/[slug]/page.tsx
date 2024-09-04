import prisma from "@/db";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.slug }
  })
  if (!course) {
    notFound()
  } else {
    return <div>
      <h1>{course.id} {course.title}</h1>
      <p>{course.description}</p>
    </div>
  }
}

// the site still runs without this but it might be more optimized cuz it generates the routes in build time
export async function generateStaticParams() {
  const ids = await prisma.course.findMany({
    select: { id: true }
  })

  return ids.map(course => ({
    slug: course.id
  }))
}