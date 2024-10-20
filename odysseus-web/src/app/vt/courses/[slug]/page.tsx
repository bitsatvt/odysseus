import { notFound } from "next/navigation";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import prisma from "@/db";
import { Divider, Flex, Title, Box, ScrollArea, Text } from "@mantine/core";


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

    let cleanedTitle = course.title;
    if (course.title != null) {
      cleanedTitle = course.title.replace(/&amp;/g, "&");
    }

    return (
      <div>
        <Title>
          Course: {course.id} {cleanedTitle}
        </Title>
        <Flex direction={{ base: 'column', sm: 'row' }} gap={20}>
          <Box style={{ flex: 1 }}>
            <Text style={{ hyphens: 'auto' }}>Description: {course.description}</Text>
            <Text>Hours: {course.hours}</Text>
            <Text>Pathways: {course.pathways}</Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text>
              Prereqs: <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={true} />
            </Text>
            <ScrollArea style={{ whiteSpace: 'nowrap' }} offsetScrollbars>
              <Text>
                Postreqs: <PostreqTreeRenderer tree={postreqTree} depth={1} />
              </Text>
            </ScrollArea>
          </Box>
        </Flex>

        <ProfessorsTable sections={course.sections} />
        <Title order={2} my={20}>Grade Distribution Over Time</Title>
        <SectionsGraph sections={course.sections} />
      </div >
    );
  }
}