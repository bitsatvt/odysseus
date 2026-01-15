interface PrereqNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PrereqNode[];
}

interface PostreqNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PostreqNode[];
}

import prisma from "@/db";

export async function fetchPrereqTree(
  id: number,
  depth = 1,
): Promise<PrereqNode> {
  const group = await prisma.group.findUnique({
    where: { id },
    include: { requires: true, course: true },
  });
  const course = group?.course;
  const courseId = course?.id || null;
  const children: PrereqNode[] = [];

  for (const r of group!.requires) {
    let childDepth = courseId == null ? depth : depth - 1;
    if (childDepth >= 0) {
      const child = await fetchPrereqTree(r.id, childDepth);
      children.push(child);
    }
  }

  return {
    id,
    type: group!.type!,
    courseId,
    children,
  };
}

export async function fetchPostreqTree(
  id: number,
  currentCourseId: string,
  depth = 1,
): Promise<PostreqNode> {
  const group = await prisma.group.findUnique({
    where: { id },
    include: { requiredBy: true, course: true },
  });
  const course = group?.course;
  const courseId = course?.id || null;
  const children: PostreqNode[] = [];

  for (const r of group!.requiredBy) {
    let childDepth = courseId == null ? depth : depth - 1;
    if (childDepth >= 0) {
      const child = await fetchPostreqTree(r.id, currentCourseId, childDepth);
      if (child.courseId !== currentCourseId) {
        children.push(child);
      }
    }
  }

  return {
    id,
    type: group!.type!,
    courseId: courseId !== currentCourseId ? courseId : null,
    children,
  };
}
