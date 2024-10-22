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
    function gpaToLetterGrade(gpa: number) {
        if (gpa >= 3.7) {
            return 'A';
        } else if (gpa >= 3.3) {
            return 'A-';
        } else if (gpa >= 3.0) {
            return 'B+';
        } else if (gpa >= 2.7) {
            return 'B';
        } else if (gpa >= 2.3) {
            return 'B-';
        } else if (gpa >= 2.0) {
            return 'C+';
        } else if (gpa >= 1.7) {
            return 'C';
        } else if (gpa >= 1.3) {
            return 'C-';
        } else if (gpa >= 1.0) {
            return 'D+';
        } else if (gpa >= 0.7) {
            return 'D';
        } else {
            return 'F';
        }
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
                    <strong>Sections Taught: </strong>
                    {course.sections.length === null ? 'N/A' : course.sections.length}
                </Text>
                <Text >
                    <strong> Average GPA: </strong>  {(() => {
                        if (filteredSections != null && filteredSections.length > 0) {
                            const totalGPA = filteredSections.reduce((sum: number, item: Section) => {

                                return sum + (item.gpa || 0); // Parse GPA and add to the sum
                            }, 0);
                            const avgGPA = ((totalGPA / filteredSections.length).toFixed(2))
                            const letterGrade = gpaToLetterGrade(parseFloat(avgGPA))
                            return `${avgGPA} (${letterGrade})`; // Return the total GPA rounded to 2 decimal places
                        } else {
                            return 'N/A';
                        }
                    })()}
                </Text>
                <Text >
                    <strong> Strict A Rate (No A-) : </strong>  {(() => {
                        if (filteredSections != null && filteredSections.length > 0) {
                            const totalAs = filteredSections.reduce((sum: number, item: Section) => {

                                return sum + (item.gradeData[0] || 0); // Parse W and add to the sum
                            }, 0);
                            const avgA = ((totalAs / filteredSections.length).toFixed(2))
                            return avgA; // Return the total GPA rounded to 2 decimal places
                        } else {
                            return 'N/A';
                        }
                    })()}%
                </Text>
                <Text >
                    <strong> Average Withdrawal Rate: </strong>  {(() => {
                        if (filteredSections != null && filteredSections.length > 0) {
                            const totalWithdrawals = filteredSections.reduce((sum: number, item: Section) => {

                                return sum + (item.gradeData[12] || 0); // Parse W and add to the sum
                            }, 0);
                            const avgWithdrawals = ((totalWithdrawals / filteredSections.length).toFixed(2))
                            return avgWithdrawals; // Return the total GPA rounded to 2 decimal places
                        } else {
                            return 'N/A';
                        }
                    })()}%
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
