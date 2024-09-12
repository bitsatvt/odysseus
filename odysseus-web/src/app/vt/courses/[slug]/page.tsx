import prisma from "@/db";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.slug }, include: { group: true } })
  if (!course) {
    notFound()
  } else {
    const root = await TreeNode.fetchGroup(course.groupId, 1)
    return <div>
      <h1>{course.id} {course.title}</h1>
      <p>{course.description}</p>
      <p>{course.hours}</p>
      <p>{JSON.stringify(root)}</p>
    </div>
  }
}

// the site still runs without this but it might be more optimized cuz it generates the routes in build time
export async function generateStaticParams() {
  const ids = await prisma.course.findMany({
    select: { id: true }
  })

  return ids.map(course => ({
    slug: course.id
  }))
}

class TreeNode {
  id: number
  type: boolean
  courseId: string | null
  children: Array<TreeNode> = []

  constructor(groupId: number, children: Array<TreeNode>, courseId: string | null, type: boolean) {
    this.id = groupId
    this.children = children
    this.courseId = courseId
    this.type = type
  }

  static async fetchGroup(id: number, depth = 1) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { requires: true, course: true }
    })
    const course = group?.course!
    const courseId = course?.length > 0 ? course[0].id : null
    const children = new Array<TreeNode>()
    for (const r of group!.requires) {
      if (courseId == null) {
        let child = await TreeNode.fetchGroup(r.id, depth)
        children.push(child)
      } else if (depth != 0) {
        let child = await TreeNode.fetchGroup(r.id, depth - 1)
        children.push(child)
      }
    }
    return new TreeNode(id, children, courseId, group!.type!)
  }

  /*toString(): string {

  }*/
}