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
  TextInput,
  Divider,
  Space,
} from '@mantine/core';
import Link from 'next/link';
import { Instructor } from '@prisma/client';

export default function InstructorClientComponent({ instructor }: { instructor: Instructor & Record<string, any> }) {
  const [search, setSearch] = useState('');

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]/g, '');
  };

  const capitalizeAndJoin = (name: string) => {
    const arr = name.split("-");
    const lastName = arr.shift();
    arr.push(lastName!);
    return arr.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  };

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
      <Title ta="center">{capitalizeAndJoin(instructor?.id)}</Title>
      <Space h="md" />
      <Flex style={{ justifyContent: 'space-between' }} direction={{ base: 'column', sm: 'row' }} gap={10}>
        <Text><strong>Sections Taught: </strong>{instructor.sectionsTaught}</Text>
        <Text><strong>Difficulty: </strong>{instructor.difficulty == -1 ? "N/A" : instructor.difficulty + "/10"}</Text>
        <Text><strong>Rating: </strong>{instructor.rating == -1 ? "N/A" : instructor.rating + "/10"}</Text>
        <Text><strong>Would Recommend: </strong>{instructor.recommendedPct == -1 ? "N/A" : instructor.recommendedPct + "%"}</Text>
      </Flex>
      <Space h="md" />
      <Divider />
      <Space h="xs" />
      <TextInput
        placeholder="Search for a course"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        w={300}
        mb="md"

      />
      <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
        <ScrollArea
          h={500}
        >
          <Table
            stickyHeader
            horizontalSpacing="sm"
            verticalSpacing="xs"
            miw={800}
            style={{ tableLayout: 'fixed' }}
          >
            <Table.Thead >
              <Table.Tr style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', }}>
                <Table.Th ta={'center'}>ID</Table.Th>
                <Table.Th ta={'center'}>Title</Table.Th>
                <Table.Th ta={'center'}>GPA</Table.Th>
                <Table.Th ta={'center'}>Sections Taught</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredCourses.map((course: any) => {
                const totalGpa = course.sections.reduce((sum: number, section: any) => sum + section.gpa, 0);
                const averageGpa = course.sections.length > 0 ? (totalGpa / course.sections.length).toFixed(2) : 'N/A';
                const sectionCount = course.sections.length;

                return (
                  <Table.Tr key={course.id}>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Link href={`/vt/courses/${course.id}`} style={{ color: '#cf4420', textDecoration: 'underline' }}>
                        {course.id}
                      </Link>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      {course.title ? course.title.replace(/&amp;/g, '&') : 'Not Available'}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{averageGpa}</Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{sectionCount}</Table.Td>
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
