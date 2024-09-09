'use client';

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import { getCourseNamesIDs } from './server/page';

export default function Page() {
  const [courseInfo, setCourseInfo] = useState([]);

  const router = useRouter()

  useEffect(() => {
    async function fetchCourseInfo() {
      const ids = await getCourseNamesIDs();
      setCourseInfo(ids as never[]);
    }
    fetchCourseInfo();
  }, []);

  return (
    <div>
      <p>Search for courses by ID or Name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent the form from actually submitting
          const inputElement = (e.target as HTMLFormElement).elements.namedItem('courseInput')! as RadioNodeList;
          router.push(`/vt/courses/${inputElement.value}`);
        }}
      >
        <input list="courses" name="courseInput" />
      </form>
      <datalist id="courses">
        {courseInfo.map((courseInfo) => (
          <div>
            <option key={courseInfo.id} value={courseInfo.id} />
            <option key={courseInfo.title} value={courseInfo.title} />
          </div>
        ))}
      </datalist>

    </div>

  )
}
