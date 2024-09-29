import { Section } from "@prisma/client";
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
};

export function SectionsGraph({ sections }: SectionsGraphProps) {
  const terms = { "Spring": 0, "Summer I": 1, "Summer II": 2, "Fall": 3, "Winter": 4 }
  const data = Object.values(sections.map(section => {
    const gradeCount = section.gradeData.map(r => Math.round((r / 100) * section.enrollment))
    return {
      _key: Number(section.year + "" + terms[section.term as keyof typeof terms]),
      term: `${section.term} ${section.year}`,
      A: gradeCount[0] + gradeCount[1],
      B: gradeCount[2] + gradeCount[3] + gradeCount[4],
      C: gradeCount[5] + gradeCount[6] + gradeCount[7],
      D: gradeCount[8] + gradeCount[9] + gradeCount[10],
      F: gradeCount[11]
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
      { name: 'F', color: 'red.6' },
      { name: 'D', color: 'orange.6' },
      { name: 'C', color: 'yellow.6' },
      { name: 'B', color: 'green.6' },
      { name: 'A', color: 'cyan.6' },
    ]} />
  )

}