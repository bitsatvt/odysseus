'use client';

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import { getCourseIds } from './server/page';

export default function Page() {
  const [ids, setIds] = useState([]);
  const router = useRouter()

  useEffect(() => {
    async function fetchCourseIds() {
      const ids = await getCourseIds();
      setIds(ids as never[]);
    }
    fetchCourseIds();
  }, []);

  return (
    <div>
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
        {ids.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>
    </div>

  )
}
