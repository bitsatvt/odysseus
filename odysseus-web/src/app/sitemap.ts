import type { MetadataRoute } from "next";
import prisma from "@/db";

const courses = await prisma.course.findMany({
  select: {
    id: true,
  },
});

const instructors = await prisma.instructor.findMany({
  select: {
    id: true,
  },
});

export default function sitemap(): MetadataRoute.Sitemap {
  // Generate paths for courses and instructors
  const coursePaths = courses.map((c) => ({
    url: `https://odyadvisor.com/vt/courses/${c.id}`,
  }));

  const instructorPaths = instructors.map((i) => ({
    url: `https://odyadvisor.com/vt/instructors/${i.id}`,
  }));

  return [...instructorPaths, ...coursePaths];
}
