import { PrismaClient } from "@prisma/client";
import courses from "../../class.json" assert { type: "json" };
import groups from "../../group.json" assert { type: "json" };
import sections from "../../section.json" assert { type: "json" };

const prisma = new PrismaClient();

async function createGroups() {
  // null group
  for (const key in groups) {
    const group = groups[key];
    await prisma.group.create({
      data: {
        id: group.id,
        type: group.type ? true : false,
        coreqs: group.coreqs,
        hash: group.hash,
      },
    });
  }
}

async function updateGroupRelations(groups) {
  for (const key in groups) {
    const group = groups[key];
    await prisma.group.update({
      where: { id: group.id },
      data: {
        requires: {
          connect: group.requires.map((id) => ({ id })),
        },
        requiredBy: {
          connect: group.requiredBy.map((id) => ({ id })),
        },
      },
    });
  }
}

async function insertClasses(classes) {
  for (const key in classes) {
    const classData = classes[key];

    const data = {
      id: classData.id,
      subject: classData.subject,
      code: classData.code,
      level: classData.level,
      title: classData.title,
      repeatability: classData.repeatability,
      description: classData.description,
      pathways: classData.pathways,
      hours: classData.hours,
    }
    if (classData.groupId != -1) {
      data.group = { connect: { id: classData.groupId } }
    }
    await prisma.course.create({ data: data });
  }
}

async function updateCrosslistRelations(classes) {
  for (const key in classes) {
    const course = classes[key];
    try {
      await prisma.course.update({
        where: { id: course.id },
        data: {
          crosslist: {
            connect: course.crosslist.map((id) => ({ id })),
          },
          crosslistSymmetric: {
            connect: course.crosslist.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      console.error(`Error inserting/updating class ${course.crosslist}:`, error);
    }
  }
}

async function insertSections(sections) {
  for (const key in sections) {
    const sectionData = sections[key];
    try {
      await prisma.section.create({
        data: {
          id: sectionData.super_CRN,
          year: sectionData.year,
          term: sectionData.term,
          title: sectionData.title,
          gpa: sectionData.GPA,
          gradeData: sectionData.Grades_Dist,
          withdrawals: sectionData.W_rate,
          enrollment: sectionData.Enrollment,
          crn: sectionData.CRN,
          instructorId: -1,
          credits: sectionData.Credits,
          course: { connect: { id: sectionData.course_id } },
        },
      });
    } catch (error) {
      console.error(`Error inserting/updating class ${sectionData.id}:`, error);
    }
  }
}
async function importData() {
  try {
    await createGroups(groups);
    console.log("All groups created successfully");
    await updateGroupRelations(groups);
    console.log("All group relations updated successfully");
    await insertClasses(courses);
    console.log("All classes inserted");
    await updateCrosslistRelations(courses);
    console.log("All crosslists inserted");
    await insertSections(sections);
    console.log("All sections created");
  } catch (error) {
    console.error("Error importing groups:", error);
  }
}

importData();
