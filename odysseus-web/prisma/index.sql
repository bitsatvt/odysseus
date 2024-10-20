-- Enable the pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for the Course model
CREATE INDEX course_id_trgm_idx ON "Course" USING GIN ("id" gin_trgm_ops);
CREATE INDEX course_subject_trgm_idx ON "Course" USING GIN ("subject" gin_trgm_ops);
CREATE INDEX course_code_trgm_idx ON "Course" USING GIN ("code" gin_trgm_ops);
CREATE INDEX course_title_trgm_idx ON "Course" USING GIN ("title" gin_trgm_ops);
CREATE INDEX course_description_trgm_idx ON "Course" USING GIN ("description" gin_trgm_ops);

-- Create GIN indexes for the Instructor model
CREATE INDEX instructor_firstName_trgm_idx ON "Instructor" USING GIN ("firstName" gin_trgm_ops);
CREATE INDEX instructor_lastName_trgm_idx ON "Instructor" USING GIN ("lastName" gin_trgm_ops);
