"use client"
import { Section } from "@prisma/client";
import { Table } from '@mantine/core';
import { AreaChart, ChartTooltipProps, getFilteredChartTooltipPayload } from "@mantine/charts";
import '@mantine/charts/styles.css';
import { Paper, Text } from '@mantine/core';

interface SectionsGraphProps {
  sections: Section[]
}

type CombinedGrades = {
  _key: number;
  term: string;
  numberSections: number;
  avgGPA: number;
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
function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  const reversedPayload = [...payload].reverse();
  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      {getFilteredChartTooltipPayload(reversedPayload).map((item: any) => (
        <Text key={item.name} c={item.color} fz="sm">
          {item.name}: {Math.round(item.value / item.payload.avgGPA * 1000) / 10}%
        </Text>
      ))}
    </Paper>
  );
}
const adjustSections = (prev: number, n: number, num: number) => {
  return ((prev * num) + n) / (num + 1)
}
export function SectionsGraph({ sections }: SectionsGraphProps) {
  const terms = { "Spring": 0, "Summer I": 1, "Summer II": 2, "Fall": 3, "Winter": 4 }
  const termData = Object.values(sections.map(section => {
    const gradeCount = section.gradeData
    return {
      _key: Number(section.year + "" + terms[section.term as keyof typeof terms]),
      term: `${section.term} ${section.year}`,
      numberSections: 1,
      avgGPA: section.gpa,
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
      acc[curr.term].avgGPA = adjustSections(acc[curr.term].avgGPA, curr.avgGPA, acc[curr.term].numberSections);
      acc[curr.term].A = adjustSections(acc[curr.term].A, curr.A, acc[curr.term].numberSections);
      acc[curr.term].B = adjustSections(acc[curr.term].B, curr.B, acc[curr.term].numberSections);
      acc[curr.term].C = adjustSections(acc[curr.term].C, curr.C, acc[curr.term].numberSections);
      acc[curr.term].D = adjustSections(acc[curr.term].D, curr.D, acc[curr.term].numberSections);
      acc[curr.term].F = adjustSections(acc[curr.term].F, curr.F, acc[curr.term].numberSections);
      acc[curr.term].W = adjustSections(acc[curr.term].W, curr.W, acc[curr.term].numberSections);
      acc[curr.term].numberSections += 1
    }
    return acc;
  }, {} as Record<string, CombinedGrades>)).sort((a, b) => a._key - b._key);
  termData.forEach((currTerm, index) => {
    termData[index].avgGPA = Math.round(currTerm.avgGPA * 100) / 100
    termData[index].A = (currTerm.A * 10) / 10 * termData[index].avgGPA / 100
    termData[index].B = (currTerm.B * 10) / 10 * termData[index].avgGPA / 100
    termData[index].C = (currTerm.C * 10) / 10 * termData[index].avgGPA / 100
    termData[index].D = (currTerm.D * 10) / 10 * termData[index].avgGPA / 100
    termData[index].F = (currTerm.F * 10) / 10 * termData[index].avgGPA / 100
    termData[index].W = (currTerm.W * 10) / 10 * termData[index].avgGPA / 100
  })

  return (
    <AreaChart h={300} data={termData} dataKey="term" type="stacked"
      tooltipProps={{
        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
      }}
      curveType="step"
      series={[
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
    let value = acc[curr.instructorName];
    if (!acc[curr.instructorName]) {
      acc[curr.instructorName] = { numberSections: 0, A: [], B: [], C: [], D: [], F: [], W: [] }
      value = acc[curr.instructorName];
    }
    const gradeRatios = curr.gradeData;
    value.numberSections++;
    value.A.push(gradeRatios[0] + gradeRatios[1])
    value.B.push(gradeRatios[2] + gradeRatios[3] + gradeRatios[4])
    value.C.push(gradeRatios[5] + gradeRatios[6] + gradeRatios[7])
    value.D.push(gradeRatios[8] + gradeRatios[9] + gradeRatios[10])
    value.F.push(gradeRatios[11])
    value.W.push(gradeRatios[12])

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