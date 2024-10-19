import prisma from "@/db";
import { Course, Prisma } from "@prisma/client";

/**
 * Searches courses with priority given to the course id.
 * @param searchTerm The term to search for.
 * @returns An array of matching courses ordered by relevance.
 */
async function searchCourses(searchTerm: string) {
  const results = await prisma.$queryRaw<
    Array<Course>
  >(
    Prisma.sql`
    SELECT 
      "Course".*, 
      ts_rank(
        setweight(to_tsvector('english', COALESCE("id", '')), 'A') || 
        setweight(to_tsvector('english', COALESCE("title", '')), 'B') || 
        setweight(to_tsvector('english', COALESCE("description", '')), 'C'), 
        plainto_tsquery('english', $1)
      ) AS rank
    FROM "Course"
    WHERE 
      setweight(to_tsvector('english', COALESCE("id", '')), 'A') || 
      setweight(to_tsvector('english', COALESCE("title", '')), 'B') || 
      setweight(to_tsvector('english', COALESCE("description", '')), 'C') 
      @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC;
    `,
    searchTerm,
  );

  return results;
}
