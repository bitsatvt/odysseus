import { notFound } from "next/navigation";
import { fetchPrereqTree, fetchPostreqTree } from "@/server/utils/fetchTrees";
import PrereqTreeRenderer from "@/components/PrereqTreeRenderer";
import PostreqTreeRenderer from "@/components/PostreqTreeRenderer";
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import prisma from "@/db";
import { Divider, Flex, Title, Box, ScrollArea, Text, Space } from "@mantine/core";
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

    let cleanedTitle = course.title;
    if (course.title != null) {
      cleanedTitle = course.title.replace(/&amp;/g, "&");
    }

    return (
      <div>
        <Title>
          Course: {course.id} {cleanedTitle}
        </Title>
        <Flex direction={{ base: 'column', sm: 'row' }} gap={50}>
          <Box style={{ flex: 1 }}>
            <Text style={{ hyphens: 'auto' }}><strong>Description:</strong> {course.description}</Text>
            <Space h="xs" />
            <Text><strong>Pathways:</strong> {course.pathways}</Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
          <Text>
            <strong>Crosslist: </strong> 
            {(() => {
                if (course.crosslist.length > 0) 
                  {
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
              <Space h="xs" />
          </Text>
          {/* Just to add an extra space cuz i like it */}


          <ScrollArea style={{ whiteSpace: 'nowrap' }} offsetScrollbars>
            <Text>
            <strong> Prereqs: </strong> <PrereqTreeRenderer tree={prereqTree} depth={1} includeParens={true} />
             <Space h="xs" />
                <strong> Postreqs: </strong> <PostreqTreeRenderer tree={postreqTree} depth={1} />
              </Text>
            </ScrollArea>
          </Box>
        </Flex>
        
        <Space h="xl" />

        {/* Course Details Section */}


        <Flex style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
              <Text style={{flex: 1, margin: '0 10px', textAlign: 'center'}}>
              <strong>Course Hours:</strong> {course.hours}
              </Text>
         
              <Text style={{flex: 1, margin: '0 10px', textAlign: 'center'}}>
                {(() => {
                  if (course.repeatability === "") {
                    return 'Repeatability: N/A';  // Ensure to return the value
                  } else {
                    return String(course.repeatability);
                  }
                })()}
              </Text>

           <Text style={{flex: 1, margin: '0 10px', textAlign: 'center'}}>
           <strong> Sections Taught: </strong> {course.sections.length}
           </Text>



           <Text style={{flex: 1, margin: '0 10px', textAlign: 'center'}}>
           <strong> Average GPA: </strong>  {(() => {
                if (course.sections != null && course.sections.length > 0) {
                  const totalGPA = course.sections.reduce((sum, item) => {
                    
                    return sum + (item.gpa || 0); // Parse GPA and add to the sum
                  }, 0);
                  
                  return ((totalGPA / course.sections.length).toFixed(2)); // Return the total GPA rounded to 2 decimal places
                } else { 
                  return 'N/A'; 
                }
              })()}
              </Text>
          </Flex>

       
        <Divider />
        <ProfessorsTable sections={course.sections} />
        <Title order={2} my={20}>Grade Distribution Over Time</Title>
        <SectionsGraph sections={course.sections} />
      </div>
    );
  }
}
