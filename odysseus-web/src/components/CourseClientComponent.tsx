'use client';
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import { Divider, Flex, Title, Box, Button, Text, Space } from "@mantine/core";
import React, { useState, useMemo } from 'react';
import { Course, Section } from '@prisma/client';

export default function CourseClientComponent({ course }: { course: Course & Record<string, any> }) {
    const sections = course.sections
    const [filteredSections, setFilteredSections] = useState(course.sections)
    const filterNYears = (years: number, sections: Section[]) => {
        const earliestAllowed = 2023 - years;
        setFilteredSections(sections.filter((section) => parseInt(section.id.substring(0, 4)) > earliestAllowed))
    }
    return (
        <>

            <Flex style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button variant="light" onClick={() => filterNYears(3, sections)}>Last 3 Years</Button>
                <Button variant="light" onClick={() => filterNYears(5, sections)}>Last 5 Years</Button>
                <Button variant="light" onClick={() => filterNYears(10, sections)}>Last 10 Years</Button>
                <Button variant="light" onClick={() => filterNYears(30, sections)}>All Years</Button>
            </Flex>
            <Space h="sm" />
            <Flex style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <Text>
                    <strong>Course Hours: </strong>
                    {course.hours === null ? 'N/A' : course.hours}
                </Text>
                <Text>
                    <strong>Repeatability: </strong>
                    {course.repeatability ? course.repeatability : "N/A"}
                </Text>
                <Text>
                    <strong>Sections Taught: </strong>
                    {course.sections.length === null ? 'N/A' : course.sections.length}
                </Text>
                <Text style={{ flex: 1, margin: '0 10px', textAlign: 'center' }}>
                    <strong> Average GPA: </strong>  {(() => {
                        if (filteredSections != null && filteredSections.length > 0) {
                            const totalGPA = filteredSections.reduce((sum: number, item: Section) => {

                                return sum + (item.gpa || 0); // Parse GPA and add to the sum
                            }, 0);

                            return ((totalGPA / filteredSections.length).toFixed(2)); // Return the total GPA rounded to 2 decimal places
                        } else {
                            return 'N/A';
                        }
                    })()}
                </Text>
            </Flex>

            <Space h="xs" />
            <Divider />
            <Space h="xs" />
            <ProfessorsTable sections={filteredSections} />
            <Title order={2} my={20}>Grade Distribution Over Time</Title>
            <SectionsGraph sections={filteredSections} />
        </>
    );
}
