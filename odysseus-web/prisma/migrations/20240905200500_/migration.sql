-- CreateTable
CREATE TABLE "Group" (
    "id" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "type" BOOLEAN,
    "coreqs" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT,
    "repeatability" TEXT,
    "description" TEXT,
    "pathways" TEXT,
    "hours" TEXT,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "semester" TEXT,
    "gradeData" TEXT,
    "courseId" TEXT NOT NULL,
    "instructorId" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instructor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rating" TEXT,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupReqs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_Crosslist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_hash_key" ON "Group"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Course_groupId_key" ON "Course"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupReqs_AB_unique" ON "_GroupReqs"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupReqs_B_index" ON "_GroupReqs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Crosslist_AB_unique" ON "_Crosslist"("A", "B");

-- CreateIndex
CREATE INDEX "_Crosslist_B_index" ON "_Crosslist"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupReqs" ADD CONSTRAINT "_GroupReqs_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupReqs" ADD CONSTRAINT "_GroupReqs_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Crosslist" ADD CONSTRAINT "_Crosslist_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Crosslist" ADD CONSTRAINT "_Crosslist_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
