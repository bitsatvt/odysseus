'use client';
import { SectionsGraph } from "@/components/SectionsCharts";
import ProfessorsTable from "@/components/ProfessorsTable";
import { Divider, Flex, Title, SegmentedControl, Button, Text, Space } from "@mantine/core";
import React, { useState, useMemo } from 'react';
import { Course, Section } from '@prisma/client';

export default function CourseClientComponent({ course }: { course: Course & Record<string, any> }) {
    const sections = course.sections
    const [filteredSections, setFilteredSections] = useState(course.sections)
    const [nYears, setNYears] = useState("30")
    const filterNYears = (years: string, sections: Section[]) => {
        setNYears(years)
        const years_num = parseInt(years)
        const earliestAllowed = 2023 - years_num;
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
            <SegmentedControl
                value={nYears}
                onChange={(value: string) => filterNYears(value as "3" | "5" | "10" | "30", sections)}
                data={[
                    { label: 'Last 3 Years', value: '3' },
                    { label: 'Last 5 Years', value: '5' },
                    { label: 'Last 10 Years', value: '10' },
                    { label: 'All', value: '30' },
                ]}
                size="sm"
                radius="xl"
                color="#f05400"
            />
            <Space h="sm" />
            <Flex style={{ justifyContent: 'space-between' }} direction={{ base: 'column', sm: 'row' }} gap={10} py={5}>

                <Text>
                    <strong>Sections Taught: </strong>
                    {filteredSections === null ? 'N/A' : filteredSections.length}
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
