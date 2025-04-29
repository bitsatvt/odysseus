import json

with open("../raw-data/newSection.json", "r") as jsonFile:
    sections = json.loads(jsonFile.read())
    
instructors = dict()
with open("../raw-data/superCrnToProfessor.txt", "r") as instructorFile:
    for line in instructorFile.readlines():
        superCrn, instructor = line.split(":")
        instructors[superCrn] = instructor

# Unpackage the flattened instructor json 
instructorLib = {}
with open("../raw-data/instructors.json", "r") as jsonFile:
    flattenedInstructors = json.loads(jsonFile.read())
    for entry in flattenedInstructors:
        lastName = flattenedInstructors[entry]['lastName']
        firstName = flattenedInstructors[entry]['firstName']
        instructorLib[lastName] = instructorLib.get(flattenedInstructors[entry]['lastName'], {})
        instructorLib[lastName][firstName] = {}
        instructorLib[lastName][firstName]['difficulty'] = flattenedInstructors[entry]['difficulty']
        instructorLib[lastName][firstName]['rating'] = flattenedInstructors[entry]['rating']
        instructorLib[lastName][firstName]['recommendedPct'] = flattenedInstructors[entry]['recommendedPct']
        instructorLib[lastName][firstName]['numRatings'] = flattenedInstructors[entry]['numRatings']
        instructorLib[lastName][firstName]['Courses'] = set(flattenedInstructors[entry]['Courses'])
        instructorLib[lastName][firstName]['CoursesTaught'] = flattenedInstructors[entry]['CoursesTaught']
        instructorLib[lastName][firstName]['FrozenCourses'] = set(flattenedInstructors[entry]['Courses'])
        instructorLib[lastName][firstName]['FrozenCoursesTaught'] = flattenedInstructors[entry]['CoursesTaught']
        instructorLib[lastName][firstName]['lastName'] = flattenedInstructors[entry]['lastName']
        instructorLib[lastName][firstName]['firstName'] = flattenedInstructors[entry]['firstName']
        
errors = dict()
with open("../raw-data/sectionInstructorErrors.txt", 'w') as file:
    for section in sections:
        lastname = sections[section]["Instructor"].strip("\n").replace(" ", "-").lower().replace(".","")
        if section not in instructors:
            errors[section] = dict()
            errors[section]["Error"] = "Missing"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = lastname
            continue
        fullName = instructors[section].strip("\n").lower().replace(".","")
        if fullName == "staff":
            errors[section] = dict()
            errors[section]["Error"] = "Staff"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = lastname
            continue
        newLastName = fullName[:fullName.rfind(",")].replace(" ", "-")
        if lastname == newLastName:
            newFirstName = fullName[fullName.rfind(",") + 2:].replace(" ", "-")
            sections[section]["Instructor"] = f'{newLastName}-{newFirstName}'.strip("\n")
            if newLastName not in instructorLib:
                instructorLib[newLastName] = dict()
                instructorLib[newLastName][newFirstName] = dict()
                instructorLib[newLastName][newFirstName]["CoursesTaught"] = 1
                instructorLib[newLastName][newFirstName]["FrozenCoursesTaught"] = 1
                instructorLib[newLastName][newFirstName]["FrozenCourses"] = {sections[section]["course_id"]}
                instructorLib[newLastName][newFirstName]["Courses"] = {sections[section]["course_id"]}
            else:
                if newFirstName in instructorLib[newLastName]:
                    instructorLib[newLastName][newFirstName]["CoursesTaught"] += 1
                    instructorLib[newLastName][newFirstName]["FrozenCoursesTaught"] += 1
                    instructorLib[newLastName][newFirstName]["FrozenCourses"].add(sections[section]["course_id"])
                    instructorLib[newLastName][newFirstName]["Courses"].add(sections[section]["course_id"])
                else:
                    instructorLib[newLastName][newFirstName] = dict()
                    instructorLib[newLastName][newFirstName]["CoursesTaught"] = 1
                    instructorLib[newLastName][newFirstName]["FrozenCoursesTaught"] = 1
                    instructorLib[newLastName][newFirstName]["FrozenCourses"] = {sections[section]["course_id"]}
                    instructorLib[newLastName][newFirstName]["Courses"] = {sections[section]["course_id"]}
                    
            instructorLib[newLastName][newFirstName]["difficulty"] = -1
            instructorLib[newLastName][newFirstName]["rating"] = -1
            instructorLib[newLastName][newFirstName]["recommendedPct"] = -1
            instructorLib[newLastName][newFirstName]["numRatings"] = 0
        else:
            errors[section] = dict()
            errors[section]["Error"] = "Mismatch"
            errors[section]["Subject"] = sections[section]["course_id"][:sections[section]["course_id"].find("-")]
            errors[section]["Code"] = sections[section]["course_id"][sections[section]["course_id"].find("-")+1:]
            errors[section]["CourseID"] = sections[section]["course_id"]
            errors[section]["SuperCRN"] = section
            errors[section]["Year"] = sections[section]["year"]
            errors[section]["Term"] = sections[section]["term"]
            errors[section]["Instructor"] = lastname

success = 0
for section in errors:
    lastname = errors[section]["Instructor"]
    success += 1
    if lastname in instructorLib:
        possibleFirstNames = instructorLib[lastname]
        filteredFirstNames = []

        for currFirstName in possibleFirstNames:
            if errors[section]["CourseID"] in possibleFirstNames[currFirstName]["FrozenCourses"]:
                filteredFirstNames.append(currFirstName)

        if not filteredFirstNames:       
            for currFirstName in possibleFirstNames:
                courseSubject = set()
                for subject in possibleFirstNames[currFirstName]["FrozenCourses"]:
                    courseSubject.add(subject[0:subject.index('-')])

                if errors[section]["CourseID"][0:errors[section]["CourseID"].index('-')] in courseSubject:
                    filteredFirstNames.append(currFirstName)

        if not filteredFirstNames:        
            for currFirstName in possibleFirstNames:
                    filteredFirstNames.append(currFirstName)
        maxCoursesTaught = -1
        maxProf = ""
        for currFirstName in filteredFirstNames:
            if possibleFirstNames[currFirstName]["FrozenCoursesTaught"] > maxCoursesTaught:
                maxCoursesTaught = possibleFirstNames[currFirstName]["FrozenCoursesTaught"]
                maxFirstName = currFirstName
                
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}-{maxFirstName}".strip("\n")
        instructorLib[lastname][maxFirstName]["CoursesTaught"] += 1
        instructorLib[lastname][maxFirstName]["Courses"].add(errors[section]["CourseID"])
        if maxFirstName == "staff":
            instructorLib[lastname][maxFirstName]["FrozenCoursesTaught"] += 1
            instructorLib[lastname][maxFirstName]["FrozenCourses"].add(errors[section]["CourseID"])
        instructorLib[lastname][maxFirstName]["difficulty"] = -1
        instructorLib[lastname][maxFirstName]["rating"] = -1
        instructorLib[lastname][maxFirstName]["recommendedPct"] = -1
        instructorLib[lastname][maxFirstName]["numRatings"] = 0
    else:
        sections[section]["Instructor"] = f"{errors[section]['Instructor']}-staff".strip("\n")
        instructorLib[lastname] = dict()
        instructorLib[lastname]["staff"] = dict()
        instructorLib[lastname]["staff"]["CoursesTaught"] = 1
        instructorLib[lastname]["staff"]["Courses"] = {errors[section]["CourseID"]}
        instructorLib[lastname]["staff"]["FrozenCoursesTaught"] = 1
        instructorLib[lastname]["staff"]["FrozenCourses"] = {errors[section]["CourseID"]}
        instructorLib[lastname]["staff"]["difficulty"] = -1
        instructorLib[lastname]["staff"]["rating"] = -1
        instructorLib[lastname]["staff"]["recommendedPct"] = -1
        instructorLib[lastname]["staff"]["numRatings"] = 0


with open("../raw-data/section.json", "r") as jsonFile:
    currSections = json.loads(jsonFile.read())


assert len(sections.keys() & currSections.keys()) == 0
totalSections = sections | currSections

with open('../raw-data/section.json', 'w') as file:
    json.dump(totalSections, file, indent=4)

        
with open("../raw-data/professors.json", "r") as jsonFile:
    professorRatings = json.loads(jsonFile.read())
success = 0

for professor in professorRatings:
    professorRatings[professor]['lastName'] = professorRatings[professor]['lastName'].replace(" ", "-").lower() 
    professorRatings[professor]['firstName'] = professorRatings[professor]['firstName'].replace(" ", "-").lower()  
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
        if instructorLib[professorRatings[professor]['lastName']][possibleInstructor]["FrozenCoursesTaught"] > maxCoursesTaught:
            maxCoursesTaught = instructorLib[professorRatings[professor]['lastName']][possibleInstructor]["FrozenCoursesTaught"]
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
        flattenedInstruct[f'{lastName}-{firstName}'] = instructorLib[lastName][firstName]
        flattenedInstruct[f'{lastName}-{firstName}']['Courses'] = list(flattenedInstruct[f'{lastName}-{firstName}']['Courses'])
        flattenedInstruct[f'{lastName}-{firstName}']['FrozenCourses'] = list(flattenedInstruct[f'{lastName}-{firstName}']['FrozenCourses'])
        flattenedInstruct[f'{lastName}-{firstName}']['lastName'] = lastName
        flattenedInstruct[f'{lastName}-{firstName}']['firstName'] = firstName

with open('../raw-data/instructors.json', 'w') as file:
    json.dump(flattenedInstruct, file, indent=4)
