import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const defaultDataDir = fileURLToPath(new URL("../../data/raw-data/", import.meta.url));

export async function loadData(directory = defaultDataDir) {
  const names = { courses: "class", groups: "group", sections: "section", instructors: "instructors" };
  return Object.fromEntries(await Promise.all(Object.entries(names).map(async ([key, name]) =>
    [key, JSON.parse(await readFile(resolve(directory, `${name}.json`), "utf8"))],
  )));
}

export function validateData({ courses, groups, sections, instructors }) {
  const require = (condition, message) => { if (!condition) throw new Error(message); };
  const hashes = new Set();
  for (const [id, group] of Object.entries(groups)) {
    require(String(group.id) === id, `Group key mismatch: ${id}`);
    require(!hashes.has(group.hash), `Duplicate group hash: ${group.hash}`);
    hashes.add(group.hash);
    for (const target of group.requires) require(groups[target], `Group ${id} requires missing group ${target}`);
  }
  const courseGroups = new Set();
  for (const [id, course] of Object.entries(courses)) {
    require(course.id === id, `Course key mismatch: ${id}`);
    if (course.groupId !== -1 && course.groupId != null) {
      require(groups[course.groupId], `Course ${id} has missing group ${course.groupId}`);
      require(!courseGroups.has(course.groupId), `Group ${course.groupId} belongs to multiple courses`);
      courseGroups.add(course.groupId);
    }
  }
  for (const [id, instructor] of Object.entries(instructors)) {
    for (const course of instructor.Courses) require(courses[course], `Instructor ${id} has missing course ${course}`);
  }
  for (const [id, section] of Object.entries(sections)) {
    require(section.super_CRN === id, `Section key mismatch: ${id}`);
    require(courses[section.course_id], `Section ${id} has missing course ${section.course_id}`);
    require(instructors[section.Instructor], `Section ${id} has missing instructor ${section.Instructor}`);
    require(Number.isFinite(section.GPA) && section.Grades_Dist.length === 13 && section.Grades_Dist.every(Number.isFinite),
      `Invalid grades in section ${id}`);
  }
}

const capitalize = (name) => name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

export async function importData(prisma, data, { batchSize = 500 } = {}) {
  validateData(data);
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error("batchSize must be positive");
  const { courses, groups, sections, instructors } = data;
  async function batches(label, entries, operation) {
    for (let offset = 0; offset < entries.length; offset += batchSize) {
      await prisma.$transaction(entries.slice(offset, offset + batchSize).map(operation));
    }
    console.log(`${label}: ${entries.length} records imported`);
  }
  const upsert = (model, record) => model.upsert({ where: { id: record.id }, create: record, update: record });

  await batches("Groups", Object.values(groups), (group) => upsert(prisma.group, {
    id: group.id, hash: group.hash, type: group.type == null ? null : Boolean(group.type),
  }));
  await batches("Group prerequisites", Object.values(groups), (group) => prisma.group.update({
    where: { id: group.id }, data: { requires: { set: group.requires.map((id) => ({ id })) } },
  }));
  await batches("Courses", Object.values(courses), (course) => upsert(prisma.course, {
    id: course.id, subject: course.subject, code: course.code, level: course.level,
    title: course.title, repeatability: course.repeatability, description: course.description,
    pathways: course.pathways, hours: course.hours, coreqs: course.coreqs,
    groupId: course.groupId === -1 ? null : course.groupId,
  }));
  await batches("Crosslists", Object.values(courses), (course) => prisma.course.update({
    where: { id: course.id },
    // The catalog contains crosslist references to courses absent from the source.
    data: { crosslist: { set: course.crosslist.filter((id) => courses[id]).map((id) => ({ id })) } },
  }));
  await batches("Instructors", Object.entries(instructors), ([id, instructor]) => upsert(prisma.instructor, {
    id, firstName: capitalize(instructor.firstName), lastName: capitalize(instructor.lastName),
    difficulty: instructor.difficulty, rating: instructor.rating, recommendedPct: instructor.recommendedPct,
    numRatings: instructor.numRatings, sectionsTaught: instructor.CoursesTaught,
  }));
  await batches("Instructor courses", Object.entries(instructors), ([id, instructor]) => prisma.instructor.update({
    where: { id }, data: { courses: { set: instructor.Courses.map((courseId) => ({ id: courseId })) } },
  }));
  await batches("Sections", Object.values(sections), (section) => upsert(prisma.section, {
    id: section.super_CRN, year: section.year, term: section.term, title: section.title,
    gpa: section.GPA, gradeData: section.Grades_Dist, enrollment: section.Enrollment, crn: section.CRN,
    instructorName: section.Instructor, credits: section.Credits, course_id: section.course_id,
  }));
}

async function main() {
  const { values } = parseArgs({ options: {
    "data-dir": { type: "string", default: defaultDataDir },
    "dry-run": { type: "boolean", default: false },
  } });
  const data = await loadData(values["data-dir"]);
  validateData(data);
  console.log("Validated input:", Object.fromEntries(Object.entries(data).map(([key, rows]) => [key, Object.keys(rows).length])));
  if (values["dry-run"]) return;
  const { default: prisma } = await import("../src/db.ts");
  try {
    await importData(prisma, data);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Import failed. Completed batches can safely be rerun:", error);
    process.exitCode = 1;
  });
}
