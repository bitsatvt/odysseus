import prisma from "@/db";
import { notFound } from "next/navigation";
export default async function Page({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.slug }, include: { group: true } })
  if (!course) {
    notFound()
  } else {
    const prereqs = await PrereqTreeNode.fetchPreReqs(course.groupId!, 1)
    const postreqs = await PostreqTreeNode.fetchPostReqs(course.groupId!, 1)
    return <div>
      <h1>Course: {course.id} {course.title}</h1>
      <p>Description: {course.description}</p>
      <p>Hours: {course.hours}</p>
      <p>Prereqs: <span dangerouslySetInnerHTML={{ __html: prereqs.toStringPreReqs().substring(1, prereqs.toStringLength - 1) }} /></p>
      <p>Postreqs:<span dangerouslySetInnerHTML={{ __html: postreqs.toStringPostReqs() }} /></p>

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

class PrereqTreeNode {
  id: number
  type: boolean
  courseId: string | null
  children: Array<PrereqTreeNode> = []
  toStringLength: number = 0

  constructor(groupId: number, children: Array<PrereqTreeNode>, courseId: string | null, type: boolean) {
    this.id = groupId
    this.children = children
    this.courseId = courseId
    this.type = type
  }

  static async fetchPreReqs(id: number, depth = 1) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { requires: true, course: true }
    })
    const course = group?.course!
    const courseId = course?.id
    const children = new Array<PrereqTreeNode>()
    for (const r of group!.requires) {
      if (courseId == null) {
        let child = await PrereqTreeNode.fetchPreReqs(r.id, depth)
        children.push(child)
      } else if (depth != 0) {
        let child = await PrereqTreeNode.fetchPreReqs(r.id, depth - 1)
        children.push(child)
      }
    }
    return new PrereqTreeNode(id, children, courseId, group!.type!)
  }

  toStringPreReqs(depth = 1): string {
    let result = ``
    if (this.courseId) {
      if (depth > 0) {
        result += `(`
        result += this.children.length > 0 ? this.children[0].toStringPreReqs(depth - 1) : ""
        for (let i = 1; i < this.children.length; i++) {
          result += (this.type ? ` or ` : ` and `)
          result += this.children[i].toStringPreReqs(depth - 1)
        }
        result += `)`
      }
      else {
        return `<a href="./${String(this.courseId)}"}>${String(this.courseId)}</a>`
      }
    }
    else {
      result += `(`
      result += this.children[0].toStringPreReqs(depth)
      for (let i = 1; i < this.children.length; i++) {
        result += (this.type ? ` or ` : ` and `)
        result += this.children[i].toStringPreReqs(depth)
      }
      result += `)`
    }
    this.toStringLength = result.length
    return result
  }
  // toString(depth: number = 1): JSX.Element | string {
  //   if (this.courseId) {
  //     if (depth > 0) {
  //       return (
  //         <>
  //           (
  //           {this.children.map((child, index) => (
  //             <React.Fragment key={index}>
  //               {index > 0 && (this.type ? " and " : " or ")}
  //               {child.toString(depth - 1)}
  //             </React.Fragment>
  //           ))}
  //           )
  //         </>
  //       );
  //     } else {
  //       return (
  //         <Link href={`../${String(this.courseId)}`}>
  //           {String(this.courseId)}
  //         </Link>
  //       );
  //     }
  //   } else {
  //     return (
  //       <>
  //         (
  //         {this.children.map((child, index) => (
  //           <React.Fragment key={index}>
  //             {index > 0 && (this.type ? " and " : " or ")}
  //             {child.toString(depth)}
  //           </React.Fragment>
  //         ))}
  //         )
  //       </>
  //     );
  //   }
  // }
}


class PostreqTreeNode {
  id: number
  type: boolean
  courseId: string | null
  children: Array<PostreqTreeNode> = []
  toStringLength: number = 0

  constructor(groupId: number, children: Array<PostreqTreeNode>, courseId: string | null, type: boolean) {
    this.id = groupId
    this.children = children
    this.courseId = courseId
    this.type = type
  }

  static async fetchPostReqs(id: number, depth = 1) {
    const group = await prisma.group.findUnique({
      where: { id },
      include: { requiredBy: true, course: true }
    })
    const course = group?.course!
    const courseId = course?.id
    const children = new Array<PostreqTreeNode>()
    const queue = new Array<PostreqTreeNode>()
    for (const r of group!.requiredBy) {
      if (courseId == null) {
        let child = await PostreqTreeNode.fetchPostReqs(r.id, depth)
        children.push(child)
      } else if (depth != 0) {
        let child = await PostreqTreeNode.fetchPostReqs(r.id, depth - 1)
        children.push(child)
      }
    }
    return new PostreqTreeNode(id, children, courseId, group!.type!)
  }

  toStringPostReqs(depth = 1): string {
    let result = ``
    if (this.courseId) {
      if (depth > 0) {
        result += this.children.length > 0 ? this.children[0].toStringPostReqs(depth - 1) : ""
        for (let i = 1; i < this.children.length; i++) {
          result += `, `
          result += this.children[i].toStringPostReqs(depth - 1)
        }
      }
      else {
        return `<a href="./${String(this.courseId)}"}>${String(this.courseId)}</a>`
      }
    }
    else {
      result += this.children[0].toStringPostReqs(depth)
      for (let i = 1; i < this.children.length; i++) {
        result += `, `
        result += this.children[i].toStringPostReqs(depth)
      }
    }
    this.toStringLength = result.length
    return result
  }
}