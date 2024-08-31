-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "names" TEXT[],

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "repeatability" TEXT,
    "description" TEXT,
    "pathways" TEXT,
    "hours" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "semester" TEXT,
    "gradeData" TEXT,
    "courseId" INTEGER NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "_GroupReqs_AB_unique" ON "_GroupReqs"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupReqs_B_index" ON "_GroupReqs"("B");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupReqs" ADD CONSTRAINT "_GroupReqs_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupReqs" ADD CONSTRAINT "_GroupReqs_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
