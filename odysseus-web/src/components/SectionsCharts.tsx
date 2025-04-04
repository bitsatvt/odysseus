"use client";

import { Section } from "@prisma/client";
// Keep Mantine imports needed for the original ChartTooltip and its styling
import { ChartTooltipProps, getFilteredChartTooltipPayload } from "@mantine/charts";
import '@mantine/charts/styles.css'; // Keep Mantine chart styles if ChartTooltip relies on them
import { Paper, Text } from '@mantine/core';
// Add Recharts imports
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import React from 'react'; // Import React for JSX

// Interface and Type Definitions (Keep as is)
interface SectionsGraphProps {
  sections: Section[];
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

// ChartTooltip Component (Keep EXACTLY as is)
// This component relies on Mantine's structure and styling internally
function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  // This reversal and filtering is specific to how Mantine passes the payload
  const reversedPayload = [...payload].reverse();
  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label} Outcomes
      </Text>
      {getFilteredChartTooltipPayload(reversedPayload).map((item) => {
        const roundedValue = item.name === 'Avg GPA'
          ? (Math.round(item.value * 100) / 100)
          : (Math.round(item.value * 10) / 10) + '%';

        return (
          <Text key={item.name} c={item.color} fz="sm">
            <b>{item.name}: {roundedValue}</b>
          </Text>
        );
      })}
    </Paper>
  );
}

// adjustSections Helper Function (Keep EXACTLY as is)
const adjustSections = (prev: number, n: number, num: number) => {
  return ((prev * num) + n) / (num + 1);
};

// --- Recharts Tooltip Content Adapter ---
// This functional component acts as a bridge. Recharts' Tooltip `content` prop
// will render this, which in turn prepares the data and renders the
// *original* Mantine-based ChartTooltip component.
const RechartsTooltipContentAdapter = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Map Recharts payload to the structure Mantine's ChartTooltip expects
    const mappedPayload = payload.map((item: any) => ({
        ...item.payload, // Pass through underlying data if needed by getFilteredChartTooltipPayload
        name: item.name, // Name from <Bar name="A" .../> or <Line name="Avg GPA" .../>
        value: item.value, // The value of this specific bar segment or line point
        color: item.color || item.fill || item.stroke, // The color of the segment/line
        dataKey: item.dataKey // Include dataKey just in case
    }));

    // Pass the mapped Recharts data to the original Mantine ChartTooltip
    // The `as any` cast is necessary because the Recharts payload structure
    // differs from the Mantine `ChartTooltipProps['payload']` type.
    return <ChartTooltip label={label} payload={mappedPayload as any} />;
  }
  return null;
};


// SectionsGraph Component (Replaces Mantine Chart with Recharts)
export function SectionsGraph({ sections }: SectionsGraphProps) {
  // --- Data Processing Logic (Keep EXACTLY as is) ---
  const terms = { "Spring": 0, "Summer I": 1, "Summer II": 2, "Fall": 3, "Winter": 4 };
  const termData = Object.values(
    sections.map((section) => {
      const gradeCount = section.gradeData;
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
        W: gradeCount[12],
      };
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
        acc[curr.term].numberSections += 1;
      }
      return acc;
    }, {} as Record<string, CombinedGrades>)).sort((a, b) => a._key - b._key);

  termData.forEach((currTerm, index) => {
    termData[index].avgGPA = Math.round(currTerm.avgGPA * 100) / 100;
    // Ensure percentages are calculated correctly if they represent parts of 100%
    // If A, B, C etc. are already percentages, no change needed.
    // If they are counts, you'd calculate percentages here.
    // Assuming they are already scaled or should be treated as direct values for stacking:
    termData[index].A = currTerm.A;
    termData[index].B = currTerm.B;
    termData[index].C = currTerm.C;
    termData[index].D = currTerm.D;
    termData[index].W = currTerm.W;
    termData[index].F = currTerm.F;
  });
  // --- End of Data Processing Logic ---

  const tickStyle = {
    fill: '#868e96', // Use theme color for tick labels
    fontSize: 12 // Slightly smaller font size for ticks
};
  const labelStyle = {
      fill: '#868e96', // Use theme color for axis labels
      fontSize: 12,
      fontWeight: 500
  };

  // --- Recharts Rendering Logic ---
  return (
    // Use ResponsiveContainer for flexible sizing
    <ResponsiveContainer width="100%" height={300}>
      {/* ComposedChart allows mixing Bar and Line charts */}
      <ComposedChart
        data={termData}
        margin={{
          top: 20, // Increased top margin for Legend
          right: 0,
          left: 35,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="5 5" vertical={false} horizontal={true} strokeWidth={2}/>
        <XAxis
            dataKey="term"
            tickLine={false} // Hide tick lines
            stroke={"#868e96"} // Use theme color for axis line
            tick={tickStyle} // Apply style to tick labels
            label={{
              value: 'Term',
              angle: 0,
              position: 'insideBottom',
              style: labelStyle, // Apply label style
              dy: 5           }}
          height={40} // Allocate space for label
        />
        {/* Right Y-Axis for the GPA line */}
        <YAxis
            yAxisId="left"
            orientation="left"
            domain={[0, 4]}
            ticks={[0, 1, 2, 3, 4]}
            tickLine={false} // Hide tick lines
            stroke={"#868e96"} // Use theme color for axis line
            tick={tickStyle} // Apply style to tick labels
            label={{
                value: 'Average GPA',
                angle: -90,
                position: 'insideLeft',
                style: labelStyle, // Apply label style
                dx: -10, // Adjust label position
                dy: 30
            }}
            width={40} // Allocate space for label
        />
        {/* Left Y-Axis for the stacked bars (scaled grade distribution) */}
        <YAxis
           yAxisId="right" // Identifier for this axis
           orientation="right"
           domain={[0, 100]} // Range 0 to 100 for percentages
           axisLine={false}
           tick={false} // Hide ticks for this axis if desired
        />
        {/* Tooltip uses the adapter to render the original Mantine tooltip */}
        {/* Pass original fill/stroke color to tooltip adapter */}
        <Tooltip content={<RechartsTooltipContentAdapter />} cursor={{ fill: 'rgba(200, 200, 200, 0.2)' }}/>
        <Legend verticalAlign="top" wrapperStyle={{top: 0}}/>

        {/* Bar components for stacked grades.
            Define in order: W, F, D, C, B, A. Recharts stacks bottom-up.
            Assign colors matching the Mantine series WITH 75% Opacity (BF hex alpha).
            Add stroke and strokeWidth.
            Assign all to the 'right' Y-Axis (0-100 range). */}
        {/* Bar components with Toned-Down Colors, 75% Opacity, and Opaque Stroke */}
        <Bar yAxisId="right" dataKey="W" name="W" stackId="grades" fill="#343a40" stroke="#343a40" strokeWidth={1.5} fillOpacity={0.5} /> {/* Gray */}
        <Bar yAxisId="right" dataKey="F" name="F" stackId="grades" fill="#e03131" stroke="#e03131" strokeWidth={1.5} fillOpacity={0.5} /> {/* Red (Toned Down) */}
        <Bar yAxisId="right" dataKey="D" name="D" stackId="grades" fill="#e8590c" stroke="#e8590c" strokeWidth={1.5} fillOpacity={0.5} /> {/* Orange (Toned Down) */}
        <Bar yAxisId="right" dataKey="C" name="C" stackId="grades" fill="#f08c00" stroke="#f08c00" strokeWidth={1.5} fillOpacity={0.5} /> {/* Yellow/Amber (Toned Down) */}
        <Bar yAxisId="right" dataKey="B" name="B" stackId="grades" fill="#37b24d" stroke="#37b24d" strokeWidth={1.5} fillOpacity={0.5} /> {/* Green (Toned Down) */}
        <Bar yAxisId="right" dataKey="A" name="A" stackId="grades" fill="#339af0" stroke="#339af0" strokeWidth={1.5} fillOpacity={0.5} /> {/* Blue (Toned Down) */}
        {/* Line component for average GPA.
            Assign to the 'left' Y-Axis (0-4 range). */}
        <Line
          yAxisId="left" // Assign to the left axis
          type="monotone"
          dataKey="avgGPA"
          name="Avg GPA" // Name for Legend and Tooltip
          stroke="#000000" // Black color for the line
          strokeWidth={2} // Make line slightly thicker
          dot={{ r: 3, strokeWidth: 1, fill: '#000000' }} // Style dots
          activeDot={{ r: 5, strokeWidth: 1, fill: '#000000' }} // Enlarge dot on hover/focus
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}