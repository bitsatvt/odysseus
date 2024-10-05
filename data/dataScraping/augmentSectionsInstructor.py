import json

with open("rawData/rawSection.json", "r") as jsonFile:
    sections = json.loads(jsonFile.read())
    
instructors = dict()
with open("rawData/superCrnToProfessor.txt", "r") as instructorFile:
    for line in instructorFile.readlines():
        superCrn, instructor = line.split(":")
        instructors[superCrn] = instructor
        
instructorLib = dict()
errors = dict()
with open("rawData/sectionInstructorErrors.txt", 'w') as file:
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
        if lastname.lower() == newLastName.lower():
            sections[section]["Instructor"] = fullName.lower()
            key = newLastName.lower()
            if key not in instructorLib:
                instructorLib[key] = dict()
                nextKey = fullName[fullName.rfind(",") + 2:].lower()
                instructorLib[key][nextKey] = dict()
                instructorLib[key][nextKey]["CoursesTaught"] = 1
                instructorLib[key][nextKey]["Courses"] = {sections[section]["course_id"]}
            else:
                nextKey = fullName[fullName.rfind(",") + 2:].lower()
                if nextKey in instructorLib[key]:
                    instructorLib[key][nextKey]["CoursesTaught"] += 1
                    instructorLib[key][nextKey]["Courses"].add(sections[section]["course_id"])
                else:
                    instructorLib[key][nextKey] = dict()
                    instructorLib[key][nextKey]["CoursesTaught"] = 1
                    instructorLib[key][nextKey]["Courses"] = {sections[section]["course_id"]}
                    
            instructorLib[key][nextKey]["difficulty"] = -1
            instructorLib[key][nextKey]["rating"] = -1
            instructorLib[key][nextKey]["recommendedPct"] = -1
            instructorLib[key][nextKey]["numRatings"] = 0
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
    key = errors[section]["Instructor"].lower()
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
                
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}, {instructors}".strip("\n").lower()
        instructorLib[key][instructors]["CoursesTaught"] += 1
        instructorLib[key][instructors]["Courses"].add(errors[section]["CourseID"])
        instructorLib[key][instructors]["difficulty"] = -1
        instructorLib[key][instructors]["rating"] = -1
        instructorLib[key][instructors]["recommendedPct"] = -1
        instructorLib[key][instructors]["numRatings"] = 0
    else:
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}, Staff".strip("\n").lower()
        instructorLib[key] = dict()
        instructorLib[key]["staff"] = dict()
        instructorLib[key]["staff"]["CoursesTaught"] = 1
        instructorLib[key]["staff"]["Courses"] = {sections[section]["course_id"]}
        instructorLib[key]["staff"]["difficulty"] = -1
        instructorLib[key]["staff"]["rating"] = -1
        instructorLib[key]["staff"]["recommendedPct"] = -1
        instructorLib[key]["staff"]["numRatings"] = 0
    
with open('rawData/section.json', 'w') as file:
    json.dump(sections, file, indent=4)
    

        
with open("rawData/professors.json", "r") as jsonFile:
    professorRatings = json.loads(jsonFile.read())
success = 0

for professor in professorRatings:
    professorRatings[professor]['lastName'] = professorRatings[professor]['lastName'].lower() 
    professorRatings[professor]['firstName'] = professorRatings[professor]['firstName'].lower() 
    success-=1
    if professorRatings[professor]['lastName'] not in instructorLib:
        print(professorRatings[professor]['firstName'] + " " + professorRatings[professor]['lastName'] + " " + str(professorRatings[professor]['numRatings']))
        continue
    possibleInstructors = instructorLib[professorRatings[professor]['lastName']]
    matchingProfs = []
    if len(possibleInstructors) == 1:
        for instructor in possibleInstructors:
            matchingProfs.append(instructor)
    else:
        for instructor in possibleInstructors:
            if professorRatings[professor]['firstName'] in instructor or instructor in professorRatings[professor]['firstName'] :
                matchingProfs.append(instructor)
    if not matchingProfs:
        print(professorRatings[professor]['firstName'] + " " + professorRatings[professor]['lastName'] + " " + str(professorRatings[professor]['numRatings']))
        continue
    maxProf = ""
    maxCoursesTaught = -1
    for possibleInstructor in matchingProfs:
        if instructorLib[professorRatings[professor]['lastName']][possibleInstructor]["CoursesTaught"] > maxCoursesTaught:
            maxCoursesTaught = instructorLib[professorRatings[professor]['lastName']][possibleInstructor]["CoursesTaught"]
            maxProf = possibleInstructor
    instructorLib[professorRatings[professor]['lastName']][maxProf]["difficulty"] = professorRatings[professor]['difficulty']
    instructorLib[professorRatings[professor]['lastName']][maxProf]["rating"] = professorRatings[professor]['rating']
    instructorLib[professorRatings[professor]['lastName']][maxProf]["recommendedPct"] = professorRatings[professor]['recommendedPct']
    instructorLib[professorRatings[professor]['lastName']][maxProf]["numRatings"] = professorRatings[professor]['numRatings']
    success += 1
print(success)
        
        
    
flattenedInstruct = dict()
for lastName in instructorLib:
    for firstName in instructorLib[lastName]:
        flattenedInstruct[f'{lastName};{firstName}'] = instructorLib[lastName][firstName]
        flattenedInstruct[f'{lastName};{firstName}']['Courses'] = list(flattenedInstruct[f'{lastName};{firstName}']['Courses'])
        flattenedInstruct[f'{lastName};{firstName}']['lastName'] = lastName
        flattenedInstruct[f'{lastName};{firstName}']['firstName'] = firstName

with open('rawData/instructors.json', 'w') as file:
    json.dump(flattenedInstruct, file, indent=4)

        
    