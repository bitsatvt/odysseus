import json

with open("data/rawSection.json", "r") as jsonFile:
    sections = json.loads(jsonFile.read())
    
instructors = dict()
with open("data/superCrnToProfessor.txt", "r") as instructorFile:
    for line in instructorFile.readlines():
        superCrn, instructor = line.split(":")
        instructors[superCrn] = instructor
        
instructorLib = dict()
errors = dict()
with open("data/sectionInstructorErrors.txt", 'w') as file:
    for section in sections:
        lastname = sections[section]["Instructor"].strip("\n")
        if section not in instructors:
            errors[section] = dict()
            errors[section]["Error"] = "Missing"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = sections[section]["Instructor"]
            continue
        fullName = instructors[section].strip("\n")
        if fullName == "Staff":
            errors[section] = dict()
            errors[section]["Error"] = "Staff"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = sections[section]["Instructor"]
            continue
        newLastName = fullName[:fullName.rfind(",")]
        if lastname == newLastName:
            sections[section]["Instructor"] = fullName
            key = f'{sections[section]["course_id"][:sections[section]["course_id"].find("-")]};{newLastName}'            
            if key not in instructorLib:
                instructorLib[key] = dict()
                nextKey = fullName[fullName.rfind(",") + 2:]
                instructorLib[key][nextKey] = dict()
                instructorLib[key][nextKey]["CoursesTaught"] = 0
                instructorLib[key][nextKey]["Courses"] = {sections[section]["course_id"]}
            else:
                nextKey = fullName[fullName.rfind(",") + 2:]
                if nextKey in instructorLib[key]:
                    instructorLib[key][nextKey]["CoursesTaught"] += 1
                    instructorLib[key][nextKey]["Courses"].add(sections[section]["course_id"])
                else:
                    instructorLib[key][nextKey] = dict()
                    instructorLib[key][nextKey]["CoursesTaught"] = 0
                    instructorLib[key][nextKey]["Courses"] = {sections[section]["course_id"]}
        else:
            errors[section] = dict()
            errors[section]["Error"] = "Mismatch"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = sections[section]["Instructor"]

success = 0
for section in errors:
    key = f'{errors[section]["Subject"]};{errors[section]["Instructor"]}'
    success += 1
    if key in instructorLib:
        possibleInstructors = instructorLib[key]
        filteredList = []
        for instructors in possibleInstructors:
            if errors[section]["CourseID"] in possibleInstructors[instructors]["Courses"]:
                filteredList.append(instructors)
        if not filteredList:        
            for instructors in possibleInstructors:
                    filteredList.append(instructors)
        maxCoursesTaught = -1
        maxProf = ""
        for instructors in filteredList:
            if possibleInstructors[instructors]["CoursesTaught"] > maxCoursesTaught:
                maxCoursesTaught = possibleInstructors[instructors]["CoursesTaught"]
                maxProf = instructors
                
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}, {instructor}"
        instructorLib[key][instructors]["CoursesTaught"] += 1
        instructorLib[key][instructors]["Courses"].add(errors[section]["CourseID"])
    else:
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}, Staff"
        instructorLib[key] = dict()
        instructorLib[key]["Staff"] = dict()
        instructorLib[key]["Staff"]["CoursesTaught"] = 0
        instructorLib[key]["Staff"]["Courses"] = {sections[section]["course_id"]}
    print(success)
    
with open('data/section.json', 'w') as file:
    json.dump(sections, file, indent=4)
    
flattenedInstruct = dict()
for lastName in instructorLib:
    for firstName in instructorLib[lastName]:
        flattenedInstruct[f'{lastName};{firstName}'] = instructorLib[lastName][firstName]
        flattenedInstruct[f'{lastName};{firstName}']['Courses'] = list(flattenedInstruct[f'{lastName};{firstName}']['Courses'])
        
with open('data/instructors.json', 'w') as file:
    json.dump(flattenedInstruct, file, indent=4)

        
    