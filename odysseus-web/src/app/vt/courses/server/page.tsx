'use server'

import prisma from "@/db"

export async function getCourseIds() {
  return (await prisma.course.findMany({
    select: { id: true }
  })).map(c => c.id)
}
