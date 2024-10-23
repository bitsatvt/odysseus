import { notFound } from "next/navigation";
import prisma from "@/db";
import CourseClientComponent from "@/components/CourseClientComponent";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { Flex, Title, Box, ScrollArea, Text, Space, Divider } from "@mantine/core";
import Link from 'next/link';

export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.slug },
    include: { group: true, sections: true, crosslist: true },
  });

  if (!course) {
    notFound();
  } else {
    const prereqTree = await fetchPrereqTree(course.groupId!, 1);
    const postreqTree = await fetchPostreqTree(course.groupId!, course.id, 1);
    return (
      <div>
        <Title mb={10}>
          {course.id}: {course.title}
        </Title>
        <Flex direction={{ base: 'column', sm: 'row' }} gap={50}>
          <Box style={{ flex: 1 }}>
            <Text style={{ hyphens: 'auto' }}><strong>Description:</strong> {course.description}</Text>
            <Space h="xs" />
            <Text><strong>Pathways:</strong> {course.pathways ? course.pathways : "N/A"}</Text>
            <Space h="xs" />
            <Text>
              <strong>Course Hours: </strong>
              {course.hours === null ? 'N/A' : course.hours}
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <ScrollArea style={{ whiteSpace: 'nowrap' }} offsetScrollbars>
              <Text>
                <strong> Prerequisites: </strong> <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={true} />
              </Text>
              <Space h="xs" />
              <Text>
                <strong> Required By: </strong> <PostreqTreeRenderer tree={postreqTree} depth={1} />
              </Text>
            </ScrollArea>
            <Text>
              <strong>Corequisites: </strong> {course.coreqs ? course.coreqs : "N/A"}
            </Text>
            <Space h="xs" />
            <Text>
              <strong>Crosslist: </strong>
              {(() => {
                if (course.crosslist.length > 0) {
                  return course.crosslist.map((item, index) => (
                    <span key={item.id}>
                      <Link href={`./${String(item.id)}`}>
                        {String(item.id)}{index < course.crosslist.length - 1 && ', '}
                      </Link>
                    </span>
                  ));
                } else {
                  return 'N/A';
                }
              })()}
            </Text>
            <Space h="xs" />
            <Text>
              <strong>Repeatability: </strong>
              {course.repeatability ? course.repeatability : "N/A"}
            </Text>

          </Box>
        </Flex>
        <Space h="xs" />
        <Divider />
        <Space h="xs" />
        <CourseClientComponent course={course} />
      </div>
    );
  }
}


export async function generateStaticParams() {
  const courses = await prisma.course.findMany({
    select: {
      id: true
    }
  });
  return courses.map((c) => ({ slug: c.id }))
}