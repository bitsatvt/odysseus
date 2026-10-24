import type { MetadataRoute } from "next";
import prisma from "@/db";
import { productionSiteUrl } from "@/site";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, instructors] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
      },
    }),
    prisma.instructor.findMany({
      select: {
        id: true,
      },
    }),
  ]);

  // Generate paths for courses and instructors
  const coursePaths = courses.map((c) => ({
    url: `${productionSiteUrl}/courses/${c.id}`,
  }));

  const instructorPaths = instructors.map((i) => ({
    url: `${productionSiteUrl}/instructors/${i.id}`,
  }));

  return [{ url: productionSiteUrl }, ...instructorPaths, ...coursePaths];
}
