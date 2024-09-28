import prisma from "@/db";
import { notFound } from "next/navigation";
import Link from 'next/link';
import React from 'react';

export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.slug },
    include: { group: true },
  });

  if (!course) {
    notFound();
  } else {
    const prereqs = await PrereqTreeNode.fetchPreReqs(course.groupId!, 1);
    const postreqs = await PostreqTreeNode.fetchPostReqs(course.groupId!, course.id, 1);

    return (
      <div>
        <h1>
          Course: {course.id} {course.title}
        </h1>
        <p>Description: {course.description}</p>
        <p>Hours: {course.hours}</p>
        <p>
          Prereqs: {prereqs.renderPreReqs(1, false)}
        </p>
        <p>
          Postreqs: {postreqs.renderPostReqs()}
        </p>
      </div>
    );
  }
}

// The site still runs without this but it might be more optimized because it generates the routes at build time
export async function generateStaticParams() {
  const ids = await prisma.course.findMany({
    select: { id: true },
  });

  return ids.map((course) => ({
    slug: course.id,
  }));
}

class PrereqTreeNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PrereqTreeNode[] = [];

  constructor(
    groupId: number,
    children: PrereqTreeNode[],
    courseId: string | null,
    type: boolean
  ) {
    this.id = groupId;
    this.children = children;
    this.courseId = courseId;
    this.type = type;
  }

  static async fetchPreReqs(id: number, depth = 1) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { requires: true, course: true },
    });
    const course = group?.course!;
    const courseId = course?.id;
    const children = new Array<PrereqTreeNode>();

    for (const r of group!.requires) {
      if (courseId == null) {
        let child = await PrereqTreeNode.fetchPreReqs(r.id, depth);
        children.push(child);
      } else if (depth !== 0) {
        let child = await PrereqTreeNode.fetchPreReqs(r.id, depth - 1);
        children.push(child);
      }
    }
    return new PrereqTreeNode(id, children, courseId, group!.type!);
  }

  renderPreReqs(depth = 1, includeParens = true): React.ReactNode {
    if (this.courseId) {
      if (depth > 0 && this.children.length > 0) {
        const childElements = this.children.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && (this.type ? ' or ' : ' and ')}
            {child.renderPreReqs(depth - 1)}
          </React.Fragment>
        ));
        return includeParens ? (
          <>
            (
            {childElements}
            )
          </>
        ) : (
          <>{childElements}</>
        );
      } else {
        return (
          <Link href={`./${String(this.courseId)}`}>
            {String(this.courseId)}
          </Link>
        );
      }
    } else {
      const childElements = this.children.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 && (this.type ? ' or ' : ' and ')}
          {child.renderPreReqs(depth, true)}
        </React.Fragment>
      ));
      return includeParens ? (
        <>
          (
          {childElements}
          )
        </>
      ) : (
        <>{childElements}</>
      );
    }
  }
}

class PostreqTreeNode {
  id: number;
  type: boolean;
  courseId: string | null;
  children: PostreqTreeNode[] = [];

  constructor(
    groupId: number,
    children: PostreqTreeNode[],
    courseId: string | null,
    type: boolean
  ) {
    this.id = groupId;
    this.children = children;
    this.courseId = courseId;
    this.type = type;
  }

  static async fetchPostReqs(id: number, currentCourseId: string, depth = 1) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { requiredBy: true, course: true },
    });
    const course = group?.course!;
    const courseId = course?.id;

    // Skip adding the current course to avoid self-reference
    const children = new Array<PostreqTreeNode>();
    for (const r of group!.requiredBy) {
      let child: PostreqTreeNode | null = null;
      if (courseId == null) {
        child = await PostreqTreeNode.fetchPostReqs(r.id, currentCourseId, depth);
      } else if (depth !== 0) {
        child = await PostreqTreeNode.fetchPostReqs(r.id, currentCourseId, depth - 1);
      }

      if (child && child.courseId !== currentCourseId) {
        children.push(child);
      }
    }

    // Only add nodes that are not the current course
    if (courseId !== currentCourseId) {
      return new PostreqTreeNode(id, children, courseId, group!.type!);
    } else {
      return new PostreqTreeNode(id, children, null, group!.type!);
    }
  }

  renderPostReqs(depth = 1): React.ReactNode {
    if (this.courseId) {
      if (depth > 0 && this.children.length > 0) {
        const childElements = this.children.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && ', '}
            {child.renderPostReqs(depth - 1)}
          </React.Fragment>
        ));
        return <>{childElements}</>;
      } else {
        return (
          <Link href={`./${String(this.courseId)}`}>
            {String(this.courseId)}
          </Link>
        );
      }
    } else {
      if (this.children.length === 0) {
        return null;
      }
      const childElements = this.children.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 && ', '}
          {child.renderPostReqs(depth)}
        </React.Fragment>
      ));
      return <>{childElements}</>;
    }
  }
}
