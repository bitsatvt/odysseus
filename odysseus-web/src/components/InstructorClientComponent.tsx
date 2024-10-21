'use client';

import React, { useState, useMemo } from 'react';
import {
  ScrollArea,
  Table,
  Paper,
} from '@mantine/core';

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
    <div>
      <h1 style={{ textAlign: 'center' }}>{formatname(instructor?.id)}</h1>
      <div style={{ display: 'flex', justifyContent: 'space-evenly', fontWeight: 'bold' }}>
        <div>Difficulty: {instructor.difficulty}/10</div>
        <div>Rating: {instructor.rating}/10</div>
        <div>Would Recommend: {instructor.recommendedPct}%</div>
        <div>Courses Taught: {instructor.coursesTaught}</div>
      </div>
      <hr style={{ border: '2px solid #cf4420', width: '1100px' }} />
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
      <div style={{ textAlign: 'center' }}>
        <Paper withBorder radius={'lg'} style={{ width: '1050px', borderRadius: '1px', border: '3px solid #cf4420', margin: '0 auto' }}>
          <ScrollArea h={500}>
            <Table stickyHeader>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
                <tr style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',}}>
                  <th style={{ width: '10%', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '40%', textAlign: 'center' }}>Title</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>GPA</th>
                  <th style={{ width: '30%', textAlign: 'center' }}>Sections Taught</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course: any) => {
                  const totalGpa = course.sections.reduce((sum: number, section: any) => sum + section.gpa, 0);
                  const averageGpa = course.sections.length > 0 ? (totalGpa / course.sections.length).toFixed(2) : 'N/A';
                  const sectionCount = course.sections.length;

                  return (
                    <tr key={course.id} style={{ padding: '10px', borderBottom: '1px solid #630031' }}>
                      <td style={{ textAlign: 'center', padding: '10px', }}>
                        <a href={`/vt/courses/${course.id}`} style={{ color: '#cf4420', textDecoration: 'underline' }}>
                          {course.id}
                        </a>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px', }}>{course.title.replace(/&amp;/g, '&')}</td>
                      <td style={{ textAlign: 'center', padding: '10px', }}>{averageGpa}</td>
                      <td style={{ textAlign: 'center', padding: '10px', }}>{sectionCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </ScrollArea>
        </Paper>
      </div>
    </div>
  );
}
