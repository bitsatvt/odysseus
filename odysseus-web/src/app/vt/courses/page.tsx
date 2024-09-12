'use client';

import { useRouter } from 'next/navigation'
import React, { useState, useMemo } from 'react';
import courseList from "./courses_lean.json" assert {type: "json"}


export default function Page() {
  const router = useRouter()
  const [query, setQuery] = useState('');

  const normalizeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
  };

  const handleItemClick = (id: string) => {
    router.push(`courses/${id}`);
  };

  const filteredItems = useMemo(() => {
    if (!query) return courseList;

    const normalizedQuery = normalizeString(query);

    // First filter for ID matches
    const idMatches = courseList.filter((item) => {
      const normalizedId = normalizeString(item.id);
      return normalizedId.includes(normalizedQuery);
    });

    // Then filter for Title matches, excluding already matched IDs
    const titleMatches = courseList.filter((item) => {
      const normalizedTitle = normalizeString(item.title);
      const normalizedId = normalizeString(item.id);
      return normalizedTitle.includes(normalizedQuery) && !normalizedId.includes(normalizedQuery);
    });

    // Combine results with ID matches prioritized
    return [...idMatches, ...titleMatches];
  }, [courseList, query]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <input
        type="text"
        placeholder="Search by title or ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      />
      <ul style={{ listStyleType: 'none', padding: '0' }}>
        {filteredItems.slice(0, 100).map((item) => (
          <li
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            style={{
              cursor: 'pointer',
              padding: '10px',
              borderBottom: '1px solid #ddd',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
            className="search-item">
            <span style={{ minWidth: '120px', fontWeight: 'bold', color: '#333' }}>{item.id}</span>
            <span style={{ color: '#555' }}>{item.title}</span>
          </li>
        ))}
      </ul>
      <style>
        {`
          .search-item:hover {
            background-color: #f0f0f0;
          }
        `}
      </style>
    </div>
  );
}