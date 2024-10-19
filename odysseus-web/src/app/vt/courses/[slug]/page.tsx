import { notFound } from "next/navigation";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import prisma from "@/db";
import { Divider, Title } from "@mantine/core";
import { ScrollArea, Box } from '@mantine/core';
import { Grid } from "@mantine/core";


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
        <div style = {courseContainer}>
        <div style={leftStyle}>
        <p>Description: {course.description}</p>
        <p>Hours: {course.hours}</p>
        <p>Pathways: {course.pathways}</p>
      </div>
        <div style={scrollableStyle}>
        <ScrollArea w={660}>
      <Box w={800}>
         <p>
          Prereqs:{" "}
          <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={true} />
          </p>
          <p>
          Postreqs:{" "}
          <PostreqTreeRenderer tree={postreqTree} depth={1} />
          </p>
        </Box>
        </ScrollArea>
        </div>
        </div>
        <div>
        <p>Course Hours: {course.hours}</p>
        </div>
        <Divider />
        <ProfessorsTable sections={course.sections} />
        <Divider />
        <Title order={2} my={20}>Grade Distribution Over Time</Title>
        <SectionsGraph sections={course.sections} />
      </div>
    );
  }
}

const courseContainer: React.CSSProperties = {
  flex: '0 0 50%',  // Left column takes 50% of the space
  padding: "20px",
  overflowY: "auto",  // Allows scrolling if content overflows
  display: "flex",     // Enables flex properties
  justifyContent: "center", // Aligns content to the left
  alignItems: "flex-start",     // Aligns items at the top
};

const leftStyle: React.CSSProperties = {
  flex: '0 0 50%',  // Left column takes 50% of the space
  padding: "20px",
  borderRight: "1px solid #ccc",  // Separator between columns
  overflowY: "auto",  // Allows scrolling if content overflows
  //display: "flex",     // Enables flex properties
  justifyContent: "left", // Aligns content to the left
  //alignItems: "flex-start",     // Aligns items at the top
};
const scrollableStyle: React.CSSProperties = {
  flex: 1,  // Right column takes 50% of the space
  //borderLeft: "1px solid #ccc",  // Separator between columns
  display: "flex",  // Flex inside right column to control scrolling
  justifyContent: "right",
  alignItems: "center",
  padding: "10px",
  maxHeight: "100%",  // Take full height of the right column
  overflowY: "auto",  // Independent scrolling for prerequisites
};