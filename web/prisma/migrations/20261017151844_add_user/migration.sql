-- AlterTable
ALTER TABLE "_Crosslist" ADD CONSTRAINT "_Crosslist_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Crosslist_AB_unique";

-- AlterTable
ALTER TABLE "_GroupReqs" ADD CONSTRAINT "_GroupReqs_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_GroupReqs_AB_unique";

-- AlterTable
ALTER TABLE "_InstructorCourses" ADD CONSTRAINT "_InstructorCourses_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_InstructorCourses_AB_unique";

-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
