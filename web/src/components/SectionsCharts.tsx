"use client";

import { AreaChart, type ChartTooltipProps, getFilteredChartTooltipPayload } from "@mantine/charts";
import "@mantine/charts/styles.css";
import { Paper, Text } from "@mantine/core";
import type { Section } from "../../prisma/generated/prisma/client";
import styles from "./SectionsCharts.module.css";

interface SectionsGraphProps { sections: Section[] }
type CombinedGrades = { _key: number; term: string; numberSections: number; avgGPA: number; A: number; B: number; C: number; D: number; F: number; W: number };

const seriesColors = { A: "#1595a6", B: "#3fa55b", C: "#edb126", D: "#ed7d31", F: "#e34b45", W: "#202020" };

function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  const reversedPayload = [...payload].reverse();
  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}><b>{reversedPayload[0]?.name === "W" ? `${label} withdrawal rate` : label}</b></Text>
      {getFilteredChartTooltipPayload(reversedPayload).map((item: any) => {
        const value = item.name === "W"
          ? Math.round(item.value * 10) / 10
          : item.payload.avgGPA > 0 ? Math.round(item.value / item.payload.avgGPA * 1000) / 10 : 0;
        return <Text key={item.name} c={item.color} fz="sm">{item.name}: {value}%</Text>;
      })}
    </Paper>
  );
}

const adjustSections = (previous: number, next: number, count: number) => ((previous * count) + next) / (count + 1);

export function SectionsGraph({ sections }: SectionsGraphProps) {
  const terms = { Spring: 0, "Summer I": 1, "Summer II": 2, Fall: 3, Winter: 4 };
  const termData = Object.values(sections.map((section) => {
    const grades = section.gradeData;
    return {
      _key: Number(`${section.year}${terms[section.term as keyof typeof terms]}`), term: `${section.term} ${section.year}`,
      numberSections: 1, avgGPA: section.gpa, A: grades[0] + grades[1], B: grades[2] + grades[3] + grades[4],
      C: grades[5] + grades[6] + grades[7], D: grades[8] + grades[9] + grades[10], F: grades[11], W: grades[12],
    };
  }).reduce((all, current) => {
    if (!all[current.term]) all[current.term] = { ...current };
    else {
      const existing = all[current.term];
      existing.avgGPA = adjustSections(existing.avgGPA, current.avgGPA, existing.numberSections);
      existing.A = adjustSections(existing.A, current.A, existing.numberSections);
      existing.B = adjustSections(existing.B, current.B, existing.numberSections);
      existing.C = adjustSections(existing.C, current.C, existing.numberSections);
      existing.D = adjustSections(existing.D, current.D, existing.numberSections);
      existing.F = adjustSections(existing.F, current.F, existing.numberSections);
      existing.W = adjustSections(existing.W, current.W, existing.numberSections);
      existing.numberSections += 1;
    }
    return all;
  }, {} as Record<string, CombinedGrades>)).sort((a, b) => a._key - b._key);

  termData.forEach((term) => {
    term.avgGPA = Math.round(term.avgGPA * 100) / 100;
    const completionRate = Math.max(0.01, 1 - term.W / 100);
    term.A = term.A * term.avgGPA / completionRate / 100;
    term.B = term.B * term.avgGPA / completionRate / 100;
    term.C = term.C * term.avgGPA / completionRate / 100;
    term.D = term.D * term.avgGPA / completionRate / 100;
    term.F = term.F * term.avgGPA / completionRate / 100;
    if (term.avgGPA > 0) {
      const roundedTotal = [term.A, term.B, term.C, term.D, term.F].reduce((sum, value) => sum + Math.round(value / term.avgGPA * 1000) / 10, 0);
      term.B = term.avgGPA * (term.B / term.avgGPA + (100 - roundedTotal) / 100);
    }
  });

  const chartWidth = Math.max(620, termData.length * 88);
  const maximumWithdrawal = Math.max(0, ...termData.map((term) => term.W));
  const withdrawalCeiling = Math.min(100, Math.max(50, Math.ceil(maximumWithdrawal / 10) * 10));

  return (
    <div className={styles.charts}>
      <div className={styles.legend} aria-label="Chart legend">
        {Object.entries(seriesColors).map(([grade, color]) => <span key={grade}><i style={{ background: color }} />{grade}</span>)}
      </div>
      <p className={styles.explanation}>Stacked height shows average GPA on a 0–4 scale. Hover or tap a term to see grade shares; withdrawal rate uses its own percentage axis.</p>
      <div className={styles.chartScroller} tabIndex={0} aria-label="Grade distribution by term. Scroll horizontally to view all terms.">
        <div className={styles.chartCanvas} style={{ width: chartWidth }}>
          <AreaChart h={300} data={termData} dataKey="term" type="stacked"
            tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} /> }}
            curveType="monotone" withXAxis={false} yAxisLabel="GPA" yAxisProps={{ domain: [0, 4], ticks: [0, 1, 2, 3, 4] }}
            series={[
              { name: "F", color: seriesColors.F }, { name: "D", color: seriesColors.D }, { name: "C", color: seriesColors.C },
              { name: "B", color: seriesColors.B }, { name: "A", color: seriesColors.A },
            ]} />
          <AreaChart h={145} data={termData} dataKey="term" type="stacked"
            tooltipProps={{ content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} /> }}
            curveType="monotone" xAxisLabel="Term" yAxisLabel="% W"
            yAxisProps={{ domain: [0, withdrawalCeiling], ticks: [0, withdrawalCeiling / 2, withdrawalCeiling] }}
            series={[{ name: "W", color: seriesColors.W }]} />
        </div>
      </div>
      <p className={styles.scrollHint}>Scroll horizontally to explore every term.</p>
    </div>
  );
}
