'use client';

import React, { useState, useMemo } from 'react';
import {
  ScrollArea,
  Table,
  Paper,
  Box,
  Title,
  Text,
  Flex,
} from '@mantine/core';
import Link from 'next/link';

export default function InstructorClientComponent({ instructor }: { instructor: any }) {
  const [search, setSearch] = useState('');

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]/g, '');
  };

  const formatname = (id: string) => {
    let nameParts = id.split("-");
    if (nameParts.length == 2) {
      let [firstName, lastName] = nameParts;
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
      return firstName + " " + lastName;
    }
    else if (nameParts.length == 3) {
      let [firstName, lastName, middleName] = nameParts;
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      middleName = middleName.charAt(0).toUpperCase() + middleName.slice(1);
      lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
      return firstName + " " + middleName + " " + lastName;
    }
  }

  const filteredCourses = useMemo(() => {
    if (!search) return instructor.courses;

    const normalizedQuery = normalizeString(search);

    const idMatches = instructor.courses.filter((course: any) => {
      const normalizedId = normalizeString(course.id);
      return normalizedId.includes(normalizedQuery);
    });

    const titleMatches = instructor.courses.filter((course: any) => {
      const normalizedTitle = normalizeString(course.title || '');
      const normalizedId = normalizeString(course.id);
      return normalizedTitle.includes(normalizedQuery) && !normalizedId.includes(normalizedQuery);
    });

    return [...idMatches, ...titleMatches];
  }, [instructor.courses, search]);

  return (
    <Box>
      <Title style={{ textAlign: 'center' }}>{formatname(instructor?.id)}</Title>
      <Flex justify={'center'}>
        <Text><strong>Difficulty:</strong>{instructor.difficulty == -1 ? "N/A" : instructor.difficulty + "/10"}</Text>
        <Text><strong>Rating: </strong>{instructor.rating == -1 ? "N/A" : instructor.rating + "/10"}</Text>
        <Text><strong>Would Recommend: </strong>{instructor.recommendedPct == -1 ? "N/A" : instructor.recommendedPct + "%"}</Text>
        <Text><strong>Courses Taught: </strong>{instructor.coursesTaught}</Text>
      </Flex>
      <hr style={{ border: '2px solid #cf4420' }} />
      <div style={{ display: 'flex', justifyContent: 'space-evenly', textAlign: 'center', marginBottom: '5px' }}>
        <div style={{ fontWeight: 'bolder', fontSize: '24px' }}>Courses</div>
        <div>
          <div style={{ display: 'flex', textAlign: 'center' }}>
            <input
              placeholder="Enter a Title or ID"
              style={{ borderRadius: '20px', padding: '5px 15px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <Paper withBorder radius={'lg'}>
        <ScrollArea h={500}>
          <Table stickyHeader>
            <Table.Thead >
              <Table.Tr style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', }}>
                <Table.Th>ID</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th >GPA</Table.Th>
                <Table.Th>Sections Taught</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredCourses.map((course: any) => {
                const totalGpa = course.sections.reduce((sum: number, section: any) => sum + section.gpa, 0);
                const averageGpa = course.sections.length > 0 ? (totalGpa / course.sections.length).toFixed(2) : 'N/A';
                const sectionCount = course.sections.length;

                return (
                  <Table.Tr key={course.id}>
                    <Table.Td>
                      <Link href={`/vt/courses/${course.id}`} style={{ color: '#cf4420', textDecoration: 'underline' }}>
                        {course.id}
                      </Link>
                    </Table.Td>
                    <Table.Td >{course.title.replace(/&amp;/g, '&')}</Table.Td>
                    <Table.Td>{averageGpa}</Table.Td>
                    <Table.Td>{sectionCount}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Box >
  );
}
