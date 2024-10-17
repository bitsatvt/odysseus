'use client';

import React, { useState, useMemo } from 'react';

// Client Component for handling UI and search
export default function InstructorClientComponent({ instructor }: { instructor: any }) {
  const [search, setSearch] = useState('');

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
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
      <div
        style={{
          backgroundColor: '#fae0cc',
          width: '1050px',
          height: '500px',
          borderRadius: '20px',
          border: '6px solid #cf4420',
          margin: 'auto',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fae0cc' }}>
          <div style={{ position: 'sticky', top: '0' }}>
            <div
              style={{
                fontWeight: 'bolder',
                fontSize: '20px',
                display: 'grid',
                gridTemplateColumns: '200px 400px 200px 100px',
                padding: '10px',
              }}>
              <div style={{ width: '200px' }}>ID</div>
              <div>Title</div>
              <div>GPA</div>
              <div>#Sections</div>
            </div>
            <hr style={{ border: '1px solid #630031', margin: '0' }} />
          </div>
        </div>
        <div style={{ paddingTop: '10px' }}>
          {filteredCourses.map((course: any) => {
            const totalGpa = course.sections.reduce((sum: number, section: any) => sum + section.gpa, 0);
            const averageGpa = course.sections.length > 0 ? (totalGpa / course.sections.length).toFixed(2) : 'N/A';
            const sectionCount = course.sections.length;

            return (
              <div key={course.id}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '200px 400px 200px 100px',
                    padding: '10px',
                  }}>
                  <div>
                    <a href={`/vt/courses/${course.id}`} style={{ color: '#cf4420', textDecoration: 'underline' }}>
                      {course.id}
                    </a>
                  </div>
                  <div>{course.title}</div>
                  <div>{averageGpa}</div>
                  <div>{sectionCount}</div>
                </div>
                <div>
                  <hr style={{ border: '1px solid #630031', margin: '0' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
