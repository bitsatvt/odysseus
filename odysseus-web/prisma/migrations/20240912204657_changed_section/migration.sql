/*
  Warnings:

  - The primary key for the `Section` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `courseId` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `instructorId` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `Section` table. All the data in the column will be lost.
  - The `gradeData` column on the `Section` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Instructor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `code` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `crn` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollment` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gpa` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withdrawals` to the `Section` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_instructorId_fkey";

-- AlterTable
ALTER TABLE "Section" DROP CONSTRAINT "Section_pkey",
DROP COLUMN "courseId",
DROP COLUMN "instructorId",
DROP COLUMN "semester",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "course_id" TEXT NOT NULL,
ADD COLUMN     "credits" TEXT NOT NULL,
ADD COLUMN     "crn" INTEGER NOT NULL,
ADD COLUMN     "enrollment" INTEGER NOT NULL,
ADD COLUMN     "gpa" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "term" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "withdrawals" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "gradeData",
ADD COLUMN     "gradeData" DOUBLE PRECISION[],
ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Section_id_seq";

-- DropTable
DROP TABLE "Instructor";

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
