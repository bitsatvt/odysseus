"use client";

import Typesense from "typesense";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/site";
import styles from "./SearchBar.module.css";

interface Course { code: string; title: string; desc?: string; }
interface Instructor { id: string; firstName: string; lastName: string; }
type Result = Course | Instructor;

interface SearchBarProps {
  variant?: "hero" | "header";
  width?: number;
}

export default function SearchBar({ variant = "header", width }: SearchBarProps) {
  const [searchType, setSearchType] = useState<"courses" | "instructors">("courses");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchRequest = useRef(0);

  useEffect(() => {
    const client = new Typesense.Client({
      nodes: [{
        host: process.env.NODE_ENV === "production" ? "api.odyadvisor.com" : "localhost",
        port: process.env.NODE_ENV === "production" ? 443 : 8108,
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
      }],
      apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY || "search-only",
    });

    async function handleSearch(searchQuery: string, currentSearchType: "courses" | "instructors") {
      const request = ++searchRequest.current;
      if (!searchQuery.trim()) {
        setResults([]);
        setIsResultsVisible(false);
        return;
      }

      try {
        const searchResults = await client
          .collections(currentSearchType)
          .documents()
          .search({
            q: searchQuery,
            query_by: currentSearchType === "courses" ? "code,title,desc" : "firstName,lastName",
            per_page: 20,
            num_typos: currentSearchType === "courses" ? "0,1,2" : "2,2",
          });

        const mappedResults = (searchResults.hits ?? []).map((hit) => hit.document as Result);
        if (request !== searchRequest.current) return;
        setResults(mappedResults);
        setIsResultsVisible(mappedResults.length > 0);
      } catch (error) {
        console.error(error);
        setResults([]);
        setIsResultsVisible(false);
      }
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => handleSearch(query, searchType), 300);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query, searchType]);

  function selectSearchType(type: "courses" | "instructors") {
    searchRequest.current += 1;
    setSearchType(type);
    setResults([]);
    setIsResultsVisible(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsResultsVisible(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsResultsVisible(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.search} ${styles[variant]}`}
      style={width ? { maxWidth: width } : undefined}
    >
      <div className={styles.controlRow}>
        <div className={styles.inputShell}>
          <span className={styles.searchIcon} aria-hidden="true">
            <img src="/figma/search.svg" alt="" />
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            aria-label={`Search ${searchType}`}
            placeholder={searchType === "courses" ? "Course name or number" : "Professor name"}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onFocus={() => results.length > 0 && setIsResultsVisible(true)}
          />
        </div>
        <div className={styles.typeToggle} aria-label="Search type">
          <button
            type="button"
            className={searchType === "courses" ? styles.active : ""}
            aria-pressed={searchType === "courses"}
            onClick={() => selectSearchType("courses")}
          >
            Course
          </button>
          <button
            type="button"
            className={searchType === "instructors" ? styles.active : ""}
            aria-pressed={searchType === "instructors"}
            onClick={() => selectSearchType("instructors")}
          >
            Professor
          </button>
        </div>
      </div>

      {isResultsVisible && results.length > 0 && (
        <div className={styles.results} role="listbox" aria-label="Search results">
          {results.map((result, index) => {
            const course = result as Course;
            const instructor = result as Instructor;
            const href = sitePath(searchType === "courses" ? `/courses/${course.code}` : `/instructors/${instructor.id}`);
            return (
              <Link
                key={`${href}-${index}`}
                href={href}
                className={styles.result}
                role="option"
                onClick={() => setIsResultsVisible(false)}
              >
                <strong>
                  {searchType === "courses"
                    ? `${course.code} ${course.title}`
                    : `${instructor.firstName} ${instructor.lastName}`}
                </strong>
                {searchType === "courses" && course.desc && <span>{course.desc}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
