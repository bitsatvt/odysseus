
import { notFound } from "next/navigation";
import prisma from "@/db";
import { getCourseIds } from "../../courses/server/page";

export default async function Page({ params }: { params: { slug: string } }) {
    console.log(params.slug)
    const instructor = await prisma.instructor.findUnique({
        where: { id: decodeURIComponent(params.slug) },
        include: {
            courses: {
                include: {
                    sections: {
                        where: { instructorName: decodeURIComponent(params.slug) }
                    }
                }
            },
        },

    });
    if (!instructor) {
        notFound();
    }
    getCourseIds;
    const formatname = (id: string) => {
        let [lastName, firstName] = id.split("-");

        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        return firstName + " " + lastName;
    }

    // const [search, setSearch] = useState('');

    // const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearch(event.target.value)
    // };

    // const filteredCourses = instructor.courses.filter(course => 
    //     course.title?.toLowerCase().includes(search.toLowerCase()) ||
    //     course.id.toLowerCase().includes(search.toLowerCase())
    // );

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>{formatname(instructor?.id)}</h1>
            <div style={{ display: "flex", justifyContent: "space-evenly", fontWeight: "bold" }}>
                <div>
                    Difficulty: {instructor?.difficulty}/10
                </div>
                <div>
                    Rating: {instructor?.rating}/10
                </div>
                <div>
                    Would Recommend: {instructor?.recommendedPct}%
                </div>
                <div>
                    Courses Taught: {instructor?.coursesTaught}
                </div>
            </div>
            <hr style={{ border: "2px solid #cf4420", width: "1100px" }} />
            <div style={{ display: "flex", justifyContent: "space-evenly", textAlign: "center", marginBottom: "5px" }}>
                <div style={{ fontWeight: "bolder", fontSize: "24px" }}>Courses</div>
                <div>
                    <div style={{ display: "flex", textAlign: "center" }}>
                        <input placeholder="Enter a Course Name" style={{ borderRadius: "20px", padding: "5px 15px" }} />
                    </div>
                </div>
            </div>
            <div style={{
                backgroundColor: "#fae0cc",
                width: "1050px",
                height: "500px",
                borderRadius: "20px",
                border: "6px solid #cf4420",
                margin: "auto",
                overflowY: "auto",
                overflowX: "hidden",
            }}>
                <div style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    backgroundColor: "#fae0cc" // Ensure background matches
                }}>
                    <div style={{ position: "sticky", top: "0" }}>
                        <div style={{
                            fontWeight: "bolder",
                            fontSize: "20px",
                            display: "grid", // Use grid for layout
                            gridTemplateColumns: "200px 400px 200px 100px", // Set column widths 
                            padding: "10px"
                        }}>
                            <div style={{ width: "200px" }}>ID</div>
                            <div>Title</div>
                            <div>GPA</div>
                            <div>#Sections</div>
                        </div>
                        <hr style={{ border: "1px solid #630031", margin: "0" }} />
                    </div>
                </div>
                <div style={{ paddingTop: "10px" }}>
                    {instructor.courses.map((course) => {
                        // Calculate the average GPA for each course
                        const totalGpa = course.sections.reduce((sum, section) => sum + section.gpa, 0);
                        const averageGpa = course.sections.length > 0 ? (totalGpa / course.sections.length).toFixed(2) : 'N/A';
                        const sectionCount = course.sections.length;

                        return (
                            <div key={course.id}>
                                <div style={{
                                    display: "grid", // Use grid for layout
                                    gridTemplateColumns: "200px 400px 200px 100px", // Set column widths 
                                    padding: "10px",
                                }}>
                                    <div>
                                        <a href={`/vt/courses/${course.id}`} style={{ color: '#cf4420', textDecoration: 'underline' }}>
                                            {course.id}
                                        </a>
                                    </div>
                                    <div>{course.title}</div>
                                    <div>{averageGpa}</div>
                                    <div>{sectionCount}</div>
                                </div>
                                <div>
                                    <hr style={{ border: "1px solid #630031", margin: "0" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

}