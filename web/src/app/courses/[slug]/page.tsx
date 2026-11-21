import { notFound } from "next/navigation";
import prisma from "@/db";
import CourseView from "@/components/CourseView";
import { fetchPostreqTree, fetchPrereqTree } from "@/server/utils/fetchTrees";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { id: slug },
    include: { sections: true, crosslist: true },
  });
  if (!course) notFound();

  const [prereqTree, postreqTree] = course.groupId == null ? [null, null] : await Promise.all([
    fetchPrereqTree(course.groupId, 3),
    fetchPostreqTree(course.groupId, course.id, 1),
  ]);
  return <CourseView course={course} prereqTree={prereqTree} postreqTree={postreqTree} />;
}

export async function generateStaticParams() {
  const courses = await prisma.course.findMany({ select: { id: true } });
  return courses.map((course) => ({ slug: course.id }));
}
