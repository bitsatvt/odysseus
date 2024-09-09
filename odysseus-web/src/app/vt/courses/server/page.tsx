'use server'

import prisma from "@/db"

export async function getCourseIds() {
  return (await prisma.course.findMany({
    select: { id: true }
  })).map(c => c.id)
}

export async function getCourseNamesIDs() {
  return (await prisma.course.findMany({
    select: { id: true, title: true }
  })).map(c => ({ id: c.id, title: c.title }))
}
