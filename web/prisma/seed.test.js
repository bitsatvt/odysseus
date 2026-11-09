import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { importData, validateData } from "./seed.js";

function fixture() {
  return {
    groups: { 0: { id: 0, hash: "CS-2114:", type: null, requires: [] } },
    courses: { "CS-2114": { id: "CS-2114", subject: "CS", code: "2114", level: 2,
      title: "Software Design", groupId: 0, crosslist: [] } },
    instructors: { "emebo-onyeka": { firstName: "onyeka", lastName: "emebo", rating: 8,
      difficulty: 3, recommendedPct: 90, numRatings: 4, CoursesTaught: 1, Courses: ["CS-2114"] } },
    sections: { "2024;09;12345": { super_CRN: "2024;09;12345", year: 2024, term: "Fall", title: "Software Design",
      GPA: 3.2, Grades_Dist: [100, ...Array(12).fill(0)], Enrollment: 10, CRN: 12345,
      Instructor: "emebo-onyeka", Credits: "3", course_id: "CS-2114" } },
  };
}

test("invalid references are rejected before any database access", async () => {
  const data = fixture();
  delete data.instructors["emebo-onyeka"];
  assert.throws(() => validateData(data), /missing instructor/);
  await assert.rejects(importData({}, data), /missing instructor/);
});

test("database errors propagate instead of reporting a successful seed", async () => {
  await assert.rejects(importData({
    group: { upsert: () => { throw new Error("database unavailable"); } },
    $transaction: async (operations) => Promise.all(operations),
  }, fixture()), /database unavailable/);
});

test("real PostgreSQL import inserts, updates, preserves history, and can be repeated", {
  skip: !process.env.TEST_DATABASE_URL,
}, async () => {
  const [{ default: pg }, { PrismaPg }, { PrismaClient }] = await Promise.all([
    import("pg"), import("@prisma/adapter-pg"), import("./generated/prisma/client.ts"),
  ]);
  const connectionString = process.env.TEST_DATABASE_URL;
  const schema = `odysseus_import_test_${randomUUID().replaceAll("-", "")}`;
  const admin = new pg.Client({ connectionString });
  await admin.connect();
  let prisma;
  try {
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.query(`SET search_path TO "${schema}"`);
    const root = new URL("./migrations/", import.meta.url);
    const migrations = (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory());
    for (const migration of migrations.sort((a, b) => a.name.localeCompare(b.name))) {
      await admin.query(await readFile(new URL(`${migration.name}/migration.sql`, root), "utf8"));
    }
    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }, { schema }) });
    const initial = fixture();
    await importData(prisma, initial, { batchSize: 2 });
    const update = fixture();
    update.sections["2024;09;12345"].GPA = 3.7;
    update.sections["2026;06;60883"] = { ...update.sections["2024;09;12345"],
      super_CRN: "2026;06;60883", year: 2026, term: "Summer I", CRN: 60883 };
    update.instructors["emebo-onyeka"].CoursesTaught = 2;
    await importData(prisma, update, { batchSize: 2 });
    const first = await prisma.section.findMany({ orderBy: { id: "asc" } });
    await importData(prisma, update, { batchSize: 2 });
    assert.deepEqual(await prisma.section.findMany({ orderBy: { id: "asc" } }), first);
    assert.equal(first.length, 2);
    assert.equal(first[0].gpa, 3.7);
    assert.equal(await prisma.course.count(), 1);
    const instructor = await prisma.instructor.findUnique({ where: { id: "emebo-onyeka" }, include: { courses: true } });
    assert.equal(instructor.sectionsTaught, 2);
    assert.equal(instructor.courses.length, 1);
    delete update.sections["2024;09;12345"];
    await importData(prisma, update, { batchSize: 2 });
    assert.equal(await prisma.section.count(), 2, "Rows outside the import are preserved");
  } finally {
    if (prisma) await prisma.$disconnect();
    await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.end();
  }
});
