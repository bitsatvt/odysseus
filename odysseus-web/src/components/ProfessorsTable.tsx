"use client";

import { useState } from 'react';
import {
  ScrollArea,
  Table,
  TextInput,
  UnstyledButton,
  Group,
  Text,
  Center,
  rem,
  Box,
  Paper,
} from '@mantine/core';
import { Section } from '@prisma/client';
import Link from 'next/link';
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from '@tabler/icons-react';

// Define types
type GradeKeys = 'A' | 'B' | 'C' | 'D' | 'F' | 'W';

type CombinedProfs = {
  numberSections: number;
  A: number[];
  B: number[];
  C: number[];
  D: number[];
  F: number[];
  W: number[];
  recentTerm: number;
  gpaSum: number;
};

// ThProps interface
interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

// Custom Th component
function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
        <Group>
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

export default function ProfessorsTable({ sections }: { sections: Section[] }) {
  // Combine professor data
  const combinedProfs = sections.reduce((acc, curr) => {
    let value = acc[curr.instructorName];
    if (!value) {
      acc[curr.instructorName] = {
        numberSections: 0,
        A: [],
        B: [],
        C: [],
        D: [],
        F: [],
        W: [],
        gpaSum: 0,
        recentTerm: 0,
      };
      value = acc[curr.instructorName];
    }
    const gradeRatios = curr.gradeData;
    value.numberSections++;
    value.gpaSum += curr.gpa;
    value.A.push(gradeRatios[0] + gradeRatios[1]);
    value.B.push(gradeRatios[2] + gradeRatios[3] + gradeRatios[4]);
    value.C.push(gradeRatios[5] + gradeRatios[6] + gradeRatios[7]);
    value.D.push(gradeRatios[8] + gradeRatios[9] + gradeRatios[10]);
    value.F.push(gradeRatios[11]);
    value.W.push(gradeRatios[12]);

    if (curr.year > value.recentTerm) {
      value.recentTerm = curr.year;
    }

    return acc;
  }, {} as Record<string, CombinedProfs>);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const gradeKeys: GradeKeys[] = ['A', 'B', 'C', 'D', 'F', 'W'];

  // Convert combinedProfs to an array for sorting
  const profsArray = Object.entries(combinedProfs)
    .filter(([instructor]) => instructor.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(([instructor, v]: [string, CombinedProfs]) => {
      // Calculate average grades
      const avgGrades = gradeKeys.reduce((acc, grade) => {
        const totalGrade = v[grade].reduce((a: number, b: number) => a + b, 0);
        const avgGrade = totalGrade / v.numberSections;
        acc[grade] = avgGrade;
        return acc;
      }, {} as Record<GradeKeys, number>);

      const avgGPA = v.gpaSum / v.numberSections;

      return {
        instructor,
        numberSections: v.numberSections,
        recentTerm: v.recentTerm,
        avgGrades,
        avgGPA,
      };
    });

  // Sorting the data
  if (sortConfig !== null) {
    profsArray.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortConfig.key === 'instructor') {
        aValue = a.instructor.toLowerCase();
        bValue = b.instructor.toLowerCase();
      } else if (sortConfig.key === 'numberSections') {
        aValue = a.numberSections;
        bValue = b.numberSections;
      } else if (sortConfig.key === 'recentTerm') {
        aValue = a.recentTerm;
        bValue = b.recentTerm;
      } else if (sortConfig.key.startsWith('grade_')) {
        const gradeIndex = parseInt(sortConfig.key.split('_')[1], 10);
        const gradeKey = gradeKeys[gradeIndex];
        aValue = a.avgGrades[gradeKey];
        bValue = b.avgGrades[gradeKey];
      } else if (sortConfig.key === 'avgGPA') {
        aValue = a.avgGPA;
        bValue = b.avgGPA;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  const rows = profsArray.map((prof) => {
    const formattedGPA = prof.avgGPA.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

    return (
      <Table.Tr key={prof.instructor}>
        <Table.Td>
          <Link href={`../instructors/${prof.instructor}`}>{prof.instructor}</Link>
        </Table.Td>
        <Table.Td>{prof.numberSections}</Table.Td>
        <Table.Td>{prof.recentTerm}</Table.Td>
        {gradeKeys.map((grade, index) => (
          <Table.Td key={grade}>{prof.avgGrades[grade].toFixed(1)}%</Table.Td>
        ))}
        <Table.Td>{formattedGPA}</Table.Td>
      </Table.Tr>
    )
  });

  return (
    <>
      <TextInput
        placeholder="Search for an instructor"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        mb="md"
        style={{ width: 300 }}
      />

      <Paper mx={20} withBorder>
        <ScrollArea style= {{
          width: '100%',
          height: '500px',
        }}>
        <Table style={{
          backgroundColor: '#FFDFC9',
        }}>
          <Table.Thead>
            <Table.Tr style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fae0cc' }}>
              <Th
                sorted={sortConfig?.key === 'instructor'}
                reversed={sortConfig?.direction === 'desc'}
                onSort={() => requestSort('instructor')}
              >
                Instructor
              </Th>
              <Th
                sorted={sortConfig?.key === 'numberSections'}
                reversed={sortConfig?.direction === 'desc'}
                onSort={() => requestSort('numberSections')}
              >
                Sections Taught (#)
              </Th>
              <Th
                sorted={sortConfig?.key === 'recentTerm'}
                reversed={sortConfig?.direction === 'desc'}
                onSort={() => requestSort('recentTerm')}
              >
                Most Recent Term
              </Th>
              {gradeKeys.map((grade, index) => (
                <Th
                  key={grade}
                  sorted={sortConfig?.key === `grade_${index}`}
                  reversed={sortConfig?.direction === 'desc'}
                  onSort={() => requestSort(`grade_${index}`)}
                >
                  {grade} (%)
                </Th>
              ))}
              <Th
                sorted={sortConfig?.key === 'avgGPA'}
                reversed={sortConfig?.direction === 'desc'}
                onSort={() => requestSort('avgGPA')}
              >
                GPA
              </Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        </ScrollArea>
      </Paper >
    </>
  );
}
