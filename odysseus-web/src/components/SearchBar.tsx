import Typesense from "typesense";
import { useState, useEffect } from 'react';
import { SegmentedControl, TextInput, Container, Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Text } from "@mantine/core";
import Link from "next/link";

interface Course {
  name: string;
  desc?: string;
}

interface Instructor {
  name: string;
}

type Result = Course | Instructor;

export default function SearchBar() {
  const client = new Typesense.Client({
    nodes: [
      {
        host: "localhost",
        port: 8108,
        protocol: "http",
      },
    ],
    apiKey: "zijgRU2wXKE4gMJqm7Xk", // don't use in production, create read-only API key instead
  });

  const [searchType, setSearchType] = useState('course');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  // Function to handle the search query
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]); // Clear results if input is empty
      return;
    }

    const collection = searchType === 'course' ? 'courses' : 'instructors';
    try {
      const searchResults = await client.collections(collection).documents().search({
        q: searchQuery,
        query_by: collection === 'courses' ? 'name,desc' : 'name',
      });

      if (searchResults.hits) {
        setResults(searchResults.hits.map((hit) => hit.document as Result));
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    }
  };

  // UseEffect to trigger search whenever query changes
  useEffect(() => {
    handleSearch(query);
  }, [query, searchType]);

  return (
    <Container size="100%" px={0} style={containerStyle}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px', // Set a max-width for the search bar if desired
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid red',
          borderRadius: '2rem',
          padding: '1% 2%',
          backgroundColor: '#ede9f4',
          flexShrink: 1,
          width: "100%",
          position: 'relative',
        }}>
          <IconSearch style={iconStyle} size={18} />
          <SegmentedControl
            value={searchType}
            onChange={(value) => setSearchType(value)}
            data={[
              { label: 'Course', value: 'course' },
              { label: 'Instructor', value: 'instructor' },
            ]}
            size="sm"
            radius="xl"
            color="orange"
            style={{ marginRight: '1%' }}
          />
          <TextInput
            placeholder={`Enter a ${searchType === 'course' ? 'Course' : 'Instructor'} Name`}
            radius="xl"
            size="sm"
            style={{ flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </div>

        {/* Results Section */}
        <div style={{
          marginTop: '0.5rem',
          position: 'absolute',
          background: "white",
          zIndex: 99,
          width: '100%', // Make results container match search bar width
          left: 0, // Align it with the search bar's left position
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}>
          {results.map((result, index) => (
            <Link href={`/${searchType}/${result.name}`}>
              <Box key={index} style={resultItemStyle}>
                <strong>{result.name}</strong>
                {(result as Course).desc && <Text truncate="end">{(result as Course).desc}</Text>}
              </Box>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}

// Styles
const containerStyle = {
  maxWidth: "100%",
  padding: "1rem",
  height: "auto",
};

const iconStyle = {
  marginRight: '3%'
};

const resultItemStyle = {
  padding: '0.5rem',
  backgroundColor: '#f9f9f9',
  borderBottom: '1px solid #ddd',
};
