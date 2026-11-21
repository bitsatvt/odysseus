import { cache } from "react";
import prisma from "@/db";

export interface RequirementNode {
  id: number;
  type: boolean;
  courseId: string | null;
  title?: string | null;
  subject?: string;
  children: RequirementNode[];
}

// Shared branches are read once per render, even when several prerequisites use them.
const getPrereqGroup = cache((id: number) => prisma.group.findUnique({
  where: { id },
  include: { requires: true, course: { select: { id: true, title: true, subject: true } } },
}));

export async function fetchPrereqTree(id: number, depth = 1, ancestors: number[] = []): Promise<RequirementNode> {
  const group = await getPrereqGroup(id);
  if (!group) return { id, type: false, courseId: null, children: [] };
  const course = group.course;
  const childDepth = course ? depth - 1 : depth;
  const children = childDepth >= 0 && !ancestors.includes(id)
    ? await Promise.all(group.requires.map((child) => fetchPrereqTree(child.id, childDepth, [...ancestors, id])))
    : [];
  return { id, type: group.type ?? false, courseId: course?.id ?? null, title: course?.title, subject: course?.subject, children: children.filter((child) => child.courseId || child.children.length > 0) };
}

export async function fetchPostreqTree(id: number, currentCourseId: string, depth = 1, ancestors: number[] = []): Promise<RequirementNode> {
  const group = await prisma.group.findUnique({ where: { id }, include: { requiredBy: true, course: true } });
  if (!group) return { id, type: false, courseId: null, children: [] };
  const courseId = group.course?.id ?? null;
  const childDepth = courseId ? depth - 1 : depth;
  const children = childDepth >= 0 && !ancestors.includes(id)
    ? await Promise.all(group.requiredBy.map((child) => fetchPostreqTree(child.id, currentCourseId, childDepth, [...ancestors, id])))
    : [];
  return { id, type: group.type ?? false, courseId: courseId === currentCourseId ? null : courseId, children: children.filter((child) => child.courseId !== currentCourseId && (child.courseId || child.children.length > 0)) };
}
