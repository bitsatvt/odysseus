/*
  Warnings:

  - You are about to drop the column `code` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "code",
DROP COLUMN "subject";
