import { PrismaClient } from "@prisma/client";
import courses from "../../data/raw-data/class.json" with { type: "json" };
import groups from "../../data/raw-data/group.json" with { type: "json" };
import sections from "../../data/raw-data/section.json" with { type: "json" };
import instructors from "../../data/raw-data/instructors.json" with { type: "json" };

const prisma = new PrismaClient();

async function createGroups() {
  // null group
  for (const key in groups) {
    const group = groups[key];
    try {
      await prisma.group.create({
        data: {
          id: group.id,
          type: group.type ? true : false,
          coreqs: group.coreqs,
          hash: group.hash,
        },
      });
    } catch (error) {
      console.error(
        `Error inserting group ${group.hash}:`,
        error,
      );
    }
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
      coreqs: classData.coreqs,
    };
    if (classData.groupId != -1) {
      data.group = { connect: { id: classData.groupId } };
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
        },
      });
    } catch (error) {
      console.error(
        `Error inserting/updating class ${course.crosslist}:`,
        error,
      );
    }
  }
}

async function insertInstructors(instructors) {
  for (const key in instructors) {
    const instructorData = instructors[key];
    try {
      await prisma.instructor.create({
        data: {
          id: key,
          difficulty: instructorData.difficulty,
          rating: instructorData.rating,
          recommendedPct: instructorData.recommendedPct,
          numRatings: instructorData.numRatings,
          sectionsTaught: instructorData.CoursesTaught,
          firstName: instructorData.firstName.split("-").map((s) =>
            s.charAt(0).toUpperCase() + s.slice(1)
          ).join(" "),
          lastName: instructorData.lastName.split("-").map((s) =>
            s.charAt(0).toUpperCase() + s.slice(1)
          ).join(" "),
        },
      });
    } catch (error) {
      console.error(`Error inserting instructor ${instructorData.id}:`, error);
    }
  }
}

async function updateInstructorCourseRelations(instructors) {
  for (const key in instructors) {
    const instructorData = instructors[key];
    try {
      await prisma.instructor.update({
        where: { id: key },
        data: {
          courses: {
            connect: instructorData.Courses.map((id) => ({ id })),
          },
        },
      });
    } catch (error) {
      console.error(`Error updating instructor ${instructorData.id} with Courses: ${instructorData.Courses}`, error);
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
          enrollment: sectionData.Enrollment,
          crn: sectionData.CRN,
          instructor: { connect: { id: sectionData.Instructor } },
          credits: sectionData.Credits,
          course: { connect: { id: sectionData.course_id } },
        },
      });
    } catch (error) {
      console.error(
        `Error inserting/updating class ${sectionData.super_CRN} with instructor ${sectionData.Instructor}:`,
        error,
      );
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
    await insertInstructors(instructors);
    console.log("All instructors inserted");
    await updateInstructorCourseRelations(instructors);
    console.log("All instructors/course relations inserted");
    await insertSections(sections);
    console.log("All sections inserted");
  } catch (error) {
    console.error("Error importing data:", error);
  }
}

importData();

/*** const capitalizeAndJoin = (name) => name.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

  const fullName = `${capitalizeAndJoin(instructorData.firstName)} ${capitalizeAndJoin(instructorData.lastName)}`;

 */
