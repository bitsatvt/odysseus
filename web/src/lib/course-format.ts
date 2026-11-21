/** Formatting shared by course summaries and prerequisite cards. */
export function courseTitle(title: string | null | undefined) {
  return (title || "Title unavailable").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}
export function courseLabel(id: string) { return id.replace(/-([0-9])/, " $1"); }
const subjects: Record<string, string> = {
  ACIS: "Accounting and Information Systems", AOE: "Aerospace and Ocean Engineering", ARCH: "Architecture", ART: "Art",
  BCHM: "Biochemistry", BIOL: "Biological Sciences", BIT: "Business Information Technology", BSE: "Biological Systems Engineering",
  CEE: "Civil and Environmental Engineering", CHE: "Chemical Engineering", CHEM: "Chemistry", COMM: "Communication",
  CS: "Computer Science", ECON: "Economics", ECE: "Electrical and Computer Engineering", ENGE: "Engineering Education",
  ENGL: "English", FIN: "Finance", GEOG: "Geography", GEOS: "Geosciences", HIST: "History", HNFE: "Human Nutrition, Foods, and Exercise",
  ISE: "Industrial and Systems Engineering", MATH: "Mathematics", ME: "Mechanical Engineering", MGT: "Management",
  MKTG: "Marketing", MSE: "Materials Science and Engineering", MUS: "Music", PHIL: "Philosophy", PHYS: "Physics",
  PSCI: "Political Science", PSYC: "Psychology", SOC: "Sociology", STAT: "Statistics",
};
export function subjectName(subject: string) { return subjects[subject] || null; }
