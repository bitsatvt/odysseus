/*
  Warnings:

  - Added the required column `instructorId` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "instructorId" INTEGER NOT NULL;
