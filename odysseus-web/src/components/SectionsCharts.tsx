"use client"
import { Section } from "@prisma/client";
import { Table } from '@mantine/core';
import { AreaChart } from "@mantine/charts";
import '@mantine/charts/styles.css';

interface SectionsGraphProps {
  sections: Section[]
}

type CombinedGrades = {
  _key: number;
  term: string;
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
  W: number;
};

type CombinedProfs = {
  numberSections: number;
  A: number[];
  B: number[];
  C: number[];
  D: number[];
  F: number[];
  W: number[];
}

export function SectionsGraph({ sections }: SectionsGraphProps) {
  const terms = { "Spring": 0, "Summer I": 1, "Summer II": 2, "Fall": 3, "Winter": 4 }
  const data = Object.values(sections.map(section => {
    section.gradeData.push(section.withdrawals)
    const gradeCount = section.gradeData.map(r => Math.round((r / 100) * section.enrollment))
    return {
      _key: Number(section.year + "" + terms[section.term as keyof typeof terms]),
      term: `${section.term} ${section.year}`,
      A: gradeCount[0] + gradeCount[1],
      B: gradeCount[2] + gradeCount[3] + gradeCount[4],
      C: gradeCount[5] + gradeCount[6] + gradeCount[7],
      D: gradeCount[8] + gradeCount[9] + gradeCount[10],
      F: gradeCount[11],
      W: gradeCount[12]
    }
  }).reduce((acc, curr) => {
    if (!acc[curr.term]) {
      acc[curr.term] = { ...curr };
    } else {
      acc[curr.term].A += curr.A;
      acc[curr.term].B += curr.B;
      acc[curr.term].C += curr.C;
      acc[curr.term].D += curr.D;
      acc[curr.term].F += curr.F;
    }
    return acc;
  }, {} as Record<string, CombinedGrades>)).sort((a, b) => a._key - b._key);
  return (
    <AreaChart h={300} data={data} dataKey="term" type="percent" series={[
      { name: 'W', color: 'black' },
      { name: 'F', color: 'red.6' },
      { name: 'D', color: 'orange.6' },
      { name: 'C', color: 'yellow.6' },
      { name: 'B', color: 'green.6' },
      { name: 'A', color: 'cyan.6' },
    ]} />
  )
}

export function ProfessorsTable({ sections }: SectionsGraphProps) {
  const combinedProfs = sections.reduce((acc, curr) => {
    const value = acc[curr.instructorName];
    if (!value) {
      acc[curr.instructorName] = { numberSections: 0, A: [], B: [], C: [], D: [], F: [], W: [] }
    } else {
      const gradeRatios = curr.gradeData;
      value.numberSections++;
      value.A.push(gradeRatios[0] + gradeRatios[1])
      value.B.push(gradeRatios[2] + gradeRatios[3] + gradeRatios[4])
      value.C.push(gradeRatios[5] + gradeRatios[6] + gradeRatios[7])
      value.D.push(gradeRatios[8] + gradeRatios[9] + gradeRatios[10])
      value.F.push(gradeRatios[11])
      value.W.push(curr.withdrawals)
    }
    return acc
  }, {} as Record<string, CombinedProfs>)

  const rows = Object.entries(combinedProfs).map(([k, v]) => {
    const averages = ['A', 'B', 'C', 'D', 'F', 'W'].map((letter) => {
      const grades = (v[letter as keyof CombinedProfs] as number[])
      const sum = grades.reduce((acc, curr) => acc += curr, 0)
      return (sum / grades.length)
    })
    const formattedAverages = averages.map(s => s.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 }))
    const averageRatios = averages.map((avg) => avg / 100)
    const gpas = [4, 3, 2, 1]
    const avgGPA = gpas.reduce((acc, curr, i) => acc + curr * averageRatios[i], 0)
    const formattedGPA = avgGPA.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

    return (
      <Table.Tr key={k}>
        <Table.Td>{k}</Table.Td>
        <Table.Td>{v.numberSections}</Table.Td>
        <Table.Td>{formattedAverages[0]}</Table.Td>
        <Table.Td>{formattedAverages[1]}</Table.Td>
        <Table.Td>{formattedAverages[2]}</Table.Td>
        <Table.Td>{formattedAverages[3]}</Table.Td>
        <Table.Td>{formattedAverages[4]}</Table.Td>
        <Table.Td>{formattedAverages[5]}</Table.Td>
        <Table.Td>{formattedGPA}</Table.Td>
      </Table.Tr>
    )
  })

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Instructor</Table.Th>
          <Table.Th>Sections Taught (#)</Table.Th>
          <Table.Th>A (%)</Table.Th>
          <Table.Th>B (%)</Table.Th>
          <Table.Th>C (%)</Table.Th>
          <Table.Th>D (%)</Table.Th>
          <Table.Th>F (%)</Table.Th>
          <Table.Th>W (%)</Table.Th>
          <Table.Th>GPA</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}