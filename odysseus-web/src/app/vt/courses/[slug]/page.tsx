import { notFound } from "next/navigation";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import prisma from "@/db";
import { Divider, Title } from "@mantine/core";

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
        <Title>
          Course: {course.id} {course.title}
        </Title>
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
        <Divider />
        <ProfessorsTable sections={course.sections} />
        <Divider />
        <Title order={2} my={20}>Grade Distribution Over Time</Title>
        <SectionsGraph sections={course.sections} />
      </div>
    );
  }
}
