import Typesense from "typesense";
import { useState, useEffect, useRef, CSSProperties } from 'react';
import { SegmentedControl, TextInput, Container, Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Text } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Course {
  id: string;
  title: string;
  desc?: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}



type Result = Course | Instructor;

export default function SearchBar() {

  const [searchType, setSearchType] = useState<'courses' | 'instructors'>('courses');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);



  // Debounced search effect
  useEffect(() => {
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

    const handleSearch = async (searchQuery: string, currentSearchType: 'courses' | 'instructors') => {
      if (!searchQuery.trim()) {
        setResults([]); // Clear results if input is empty
        return;
      }
      const collection = searchType;
      try {
        const searchParameters = {
          q: searchQuery,
          query_by:
            currentSearchType === 'courses'
              ? 'code,subjectCode,title,desc'
              : 'firstName,lastName',
          per_page: 30,
          num_typos:
            currentSearchType === 'courses' ? "0,1,2,2" : '2,2'
        };

        const searchResults = await client
          .collections(collection)
          .documents()
          .search(searchParameters);

        // Check if searchType hasn't changed during the async operation
        if (currentSearchType !== searchType) {
          return; // Discard the results if searchType has changed
        }

        if (searchResults.hits) {
          const mappedResults = searchResults.hits.map((hit) => hit.document as Result);
          setResults(mappedResults);
          setIsResultsVisible(true); // Show results
        } else {
          setResults([]);
          setIsResultsVisible(false);
        }
      } catch (err) {
        console.error(err);
        setResults([]);
        setIsResultsVisible(false);
      }
    };


    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleSearch(query, searchType);
    }, 300); // Adjust the debounce delay as needed

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchType]);

  // Clear results when searchType changes
  useEffect(() => {
    setResults([]);
    setIsResultsVisible(false);
  }, [searchType]);

  // Hide results when clicking outside the search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsResultsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hide results when the Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsResultsVisible(false);
        inputRef.current?.blur(); // Optionally blur the input
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Hide results when the pathname changes (navigating to a new page)
  useEffect(() => {
    setIsResultsVisible(false);
  }, [pathname]);

  return (
    <Container px={0} style={containerStyle}>
      < div
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <div style={searchBarStyle}>
          <IconSearch style={iconStyle} size={18} />
          <SegmentedControl
            value={searchType}
            onChange={(value: string) => {
              setSearchType(value as "courses" | "instructors");
              setQuery(''); // Clear the query when switching types
            }}
            data={[
              { label: 'Course', value: 'courses' },
              { label: 'Instructor', value: 'instructors' },
            ]}
            size="sm"
            radius="xl"
            color="orange"
            style={{ marginRight: '1%' }}
          />
          <TextInput
            ref={inputRef}
            placeholder={`Enter a ${searchType === 'courses' ? 'Course' : 'Instructor'
              } Name`}
            radius="xl"
            size="sm"
            style={{ flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onFocus={() => {
              if (results.length > 0) {
                setIsResultsVisible(true);
              }
            }}
          />
        </div>

        {/* Results Section */}
        {
          isResultsVisible && results.length > 0 && (
            <div style={resultsContainerStyle}>
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={`/vt/${searchType}/${result.id}`}
                  onClick={() => setIsResultsVisible(false)}
                >
                  <Box style={resultItemStyle}>
                    <strong>
                      {searchType === 'courses'
                        ? `${(result as Course).id} ${(result as Course).title}`
                        : `${(result as Instructor).firstName} ${(result as Instructor).lastName}`}
                    </strong>
                    {searchType === 'courses' && (result as Course).desc && (
                      <Text truncate style={{ maxWidth: '100%' }}>
                        {(result as Course).desc}
                      </Text>
                    )}
                  </Box>
                </Link>
              ))}
            </div>
          )
        }
      </div >
    </Container >
  );
}

// Styles
const containerStyle: CSSProperties = {
  padding: '1rem',
  width: '100%',
  maxWidth: '600px',
};

const iconStyle = {
  marginRight: '3%',
};

const searchBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid red',
  borderRadius: '2rem',
  padding: '1% 2%',
  backgroundColor: '#ede9f4',
  flexShrink: 1,
  position: 'relative',
};

const resultsContainerStyle: CSSProperties = {
  marginTop: '0.5rem',
  position: 'absolute',
  background: 'white',
  zIndex: 99,
  width: '100%', // Make results container match search bar width
  left: 0, // Align it with the search bar's left position
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

const resultItemStyle = {
  padding: '0.5rem',
  backgroundColor: '#f9f9f9',
  borderBottom: '1px solid #ddd',
  cursor: 'pointer',
};