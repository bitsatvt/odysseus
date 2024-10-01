import { notFound } from "next/navigation";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { SectionsGraph, ProfessorsTable } from "@/components/SectionsCharts";
import prisma from "@/db";

export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.slug },
    include: { group: true, sections: true },
  });

  if (!course) {
    notFound();
  } else {
    const prereqTree = await fetchPrereqTree(course.groupId!, 1);
    const postreqTree = await fetchPostreqTree(course.groupId!, course.id, 1);
    return (
      <div>
        <h1>
          Course: {course.id} {course.title}
        </h1>
        <p>Description: {course.description}</p>
        <p>Hours: {course.hours}</p>
        <p>
          Prereqs:{" "}
          <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={true} />
        </p>
        <p>
          Postreqs:{" "}
          <PostreqTreeRenderer tree={postreqTree} depth={1} />
        </p>
        <ProfessorsTable sections={course.sections} />
        <SectionsGraph sections={course.sections} />
      </div>
    );
  }
}
