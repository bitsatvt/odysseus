/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Section` table. All the data in the column will be lost.
  - Added the required column `instructorName` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "instructorId",
ADD COLUMN     "instructorName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "recommendedPct" DOUBLE PRECISION NOT NULL,
    "numRatings" INTEGER NOT NULL,
    "coursesTaught" INTEGER NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_InstructorCourses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_InstructorCourses_AB_unique" ON "_InstructorCourses"("A", "B");

-- CreateIndex
CREATE INDEX "_InstructorCourses_B_index" ON "_InstructorCourses"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_instructorName_fkey" FOREIGN KEY ("instructorName") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorCourses" ADD CONSTRAINT "_InstructorCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorCourses" ADD CONSTRAINT "_InstructorCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
