/*
  Warnings:

  - You are about to drop the column `coreqs` on the `Group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "coreqs" TEXT;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "coreqs";
