from parsing import Group, Course, simplifyList, addParenthesis, close, correctCoreq
from bs4 import BeautifulSoup
import json


def graphParenthesis(relationsList: list[str], start, retNode, groupStorage):
    stack = list()
    stack.append(start)
    iter = start + 1

    while stack:
        if relationsList[iter] == ")":
            if len(stack) == 1:
                newNode = graphingHelper(
                    relationsList[stack.pop() : iter + 1], groupStorage
                )
                newNode.lockPrereqs()
                if newNode in groupStorage[0]:
                    retNode.prereqs.append(str(groupStorage[0][newNode]))
                else:
                    newNode.setPermanent()
                    groupStorage[0][newNode] = str(newNode.groupID)
                    groupStorage[1][str(newNode.groupID)] = newNode
                    retNode.prereqs.append(str(newNode.groupID))
                break
            else:
                stack.pop()
        elif relationsList[iter] == "(":
            stack.append(iter)
        iter += 1
    return iter


def graphingHelper(relationsList: list, groupStorage) -> Group:
    retNode = Group()
    typeList = None
    iter = 0
    relationsList.pop(0)
    relationsList.pop(-1)
    while iter < len(relationsList):
        if relationsList[iter] == "and":
            if typeList == 1:
                raise Exception("Unexpected behavior, investigate further")
            typeList = 0
        elif relationsList[iter] == "or":
            if typeList == 0:
                raise Exception("Unexpected behavior, investigate further")
            typeList = 1
        elif relationsList[iter].replace("-", "").isalnum():
            retNode.prereqs.append(relationsList[iter])
        elif relationsList[iter] == "(":
            iter = graphParenthesis(relationsList, iter, retNode, groupStorage)
        else:
            raise Exception("Unexpected behavior, investigate further")
        iter += 1
    retNode.preReqType = typeList
    return retNode


with open("../raw-data/rawClasses.json", "r") as jsonFile:
    rawClasses = json.loads(jsonFile.read())

IDtoGroup = dict()
GrouptoID = dict()
groupStorage = (IDtoGroup, GrouptoID)
courseDict = dict()
courseDict[-1] = "MidNode"
classDict = dict()

for ID, rawClass in enumerate(rawClasses):
    crossList = []
    # Future work
    # Delete HTML tags in pathways, repeatability
    # Check HTML is not in any others
    # Parse Crosslist and delete HTML
    #
    rawClass["code"] = rawClass["code"].replace(" ", "-")
    rawClass["pathway"] = BeautifulSoup(rawClass["pathway"], "html.parser").text
    rawClass["pathway"] = rawClass["pathway"][rawClass["pathway"].find(":") + 2 :]

    rawClass["repeatability"] = BeautifulSoup(
        rawClass["repeatability"], "html.parser"
    ).text
    rawClass["repeatability"] = rawClass["repeatability"][rawClass["repeatability"].find(":") + 2 :]

    rawClass["cross_listed"] = BeautifulSoup(
        rawClass["cross_listed"], "html.parser"
    ).text
    rawClass["cross_listed"] = rawClass["cross_listed"][
        rawClass["cross_listed"].find(":") + 2 :
    ]
    rawClass["cross_listed"] = rawClass["cross_listed"].split(", ")
    rawClass["cross_listed"] = [
        rawClass.replace(" ", "-") for rawClass in rawClass["cross_listed"]
    ]
    rawClass["coreq"] = BeautifulSoup(rawClass["coreq"], "html.parser").text
    rawClass["coreq"] = rawClass["coreq"][rawClass["coreq"].find(":") + 2 :]
    rawClass["coreq"] = correctCoreq(rawClass["coreq"],rawClass["code"].split("-")[0])
    # currGroup.coreqs = rawClass["coreq"]
    
    rawClass["description"] = BeautifulSoup(rawClass["description"], "html.parser").text
    rawClass["title"] = BeautifulSoup(rawClass["title"], "html.parser").text
    
    currGroup = Group(perm=True)
    currGroup.courseID = rawClass["code"]
    cleanClass = Course(
        ID,
        currGroup.groupID,
        rawClass["code"],
        rawClass["title"],
        rawClass["cross_listed"] if rawClass["cross_listed"][0] != "" else [],
        rawClass["repeatability"],
        rawClass["description"],
        rawClass["pathway"],
        rawClass["hours_html"],
        rawClass["coreq"],
    )
    classDict[rawClass["code"]] = cleanClass
    try:
        temp = rawClass["prereq"]
        rawClass["prereq"] = BeautifulSoup(rawClass["prereq"], "html.parser").text
        rawClass["prereq"] = rawClass["prereq"][rawClass["prereq"].find(":") + 2 :]
        rawClass["prereq"] = rawClass["prereq"].split()
        rawClass["prereq"] = simplifyList(rawClass["prereq"])
        addParenthesis(rawClass["prereq"], 1)
        close(rawClass["prereq"])
        tempNode = (
            graphingHelper(rawClass["prereq"], groupStorage)
            if len(rawClass["prereq"]) > 0
            else None
        )
        if tempNode:
            currGroup.prereqs = tempNode.prereqs
            currGroup.preReqType = tempNode.preReqType
    except Exception:
        print(ID)
        print(temp)
        raise Exception
    # print(rawClass['coreq'])
    # rawClass['coreq'] = rawClass['coreq'].split()
    # rawClass['coreq'] = simplifyList(rawClass['coreq'])
    # addParenthesis(rawClass['coreq'],1,len(rawClass['coreq']) - 1)
    # tempNode = graphingHelper(rawClass['coreq'], groupStorage) if len(rawClass['coreq']) > 0 else []
    # if tempNode:
    #     currGroup.coreqs = tempNode.prereqs
    #     currGroup.coReqType = tempNode.preReqType

    # currGroup.lockCoreqs()
    currGroup.lockPrereqs()
    # print(currGroup.prereqs is tuple)
    # print(currGroup)
    groupStorage[0][currGroup] = str(currGroup.groupID)
    groupStorage[1][str(currGroup.groupID)] = currGroup
    courseDict[rawClass["code"]] = str(currGroup.groupID)
    # print(cleanClass)
    # print()


unlisted = set()
for groupID in groupStorage[1]:
    # print(groupID)
    if groupStorage[1][groupID].courseID != None:
        preStack = list()
        for prereq in groupStorage[1][groupID].prereqs:
            preStack.append(prereq)
        while preStack:
            currPrereq = preStack.pop()
            if currPrereq not in groupStorage[1]:
                if currPrereq not in courseDict:
                    unlisted.add(currPrereq)
                    continue
                currPrereq = courseDict[currPrereq]
            currPrereq = groupStorage[1][currPrereq]
            if currPrereq.courseID == None:
                for prereq in currPrereq.prereqs:
                    preStack.append(prereq)

print(len(unlisted))
for course in unlisted:
    course = course.replace(" ", "-")
    currGroup = Group(perm=True)
    currGroup.courseID = course
    cleanClass = Course(-1, currGroup.groupID, course, "", [], "", "", "", "", "")

    classDict[course] = cleanClass

    currGroup.prereqs = []
    currGroup.preReqType = None
    # currGroup.coreqs = ""

    currGroup.lockPrereqs()
    groupStorage[0][currGroup] = str(currGroup.groupID)
    groupStorage[1][str(currGroup.groupID)] = currGroup
    courseDict[course] = str(currGroup.groupID)

import csv
import json
from datetime import datetime

current_year = datetime.now().year
with open("../raw-data/Grade-Distribution.csv", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    iter = 0
    for row in spamreader:
        if iter == 0:
            iter += 1
            continue
        if int(row[0][: row[0].find("-")]) < current_year - 20:
            continue
        course = row[2] + "-" + row[3]
        if course not in courseDict:
            if int(row[0][: row[0].find("-")]) >= current_year - 5:
                currGroup = Group(perm=True)
                currGroup.courseID = course
                cleanClass = Course(-1, currGroup.groupID, course, row[4], [], "", "", "", row[22], "")
                classDict[course] = cleanClass

                currGroup.prereqs = []
                currGroup.preReqType = None

                currGroup.lockPrereqs()
                groupStorage[0][currGroup] = str(currGroup.groupID)
                groupStorage[1][str(currGroup.groupID)] = currGroup
                courseDict[course] = str(currGroup.groupID)

csvJson = dict()
with open("../raw-data/Grade-Distribution.csv", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    iter = 0
    for row in spamreader:
        if iter == 0:
            iter += 1
            continue
        if (
            int(row[0][: row[0].find("-")]) < current_year - 20
            or row[2] + "-" + row[3] not in classDict
        ):
            continue
        rowJson = dict()
        rowJson["year"] = int(row[0][: row[0].find("-")])
        rowJson["term"] = row[1]
        rowJson["course_id"] = row[2] + "-" + row[3]
        rowJson["title"] = row[4]
        rowJson["Instructor"] = row[5]
        rowJson["GPA"] = float(row[6])

        withdrawals = int(row[19])
        final_enrollment = int(row[20])
        rowJson["Enrollment"] = int(row[20]) + withdrawals  # Initial Enrollment

        adjustGrade = (
            lambda grade: (float(grade) * final_enrollment) / (rowJson["Enrollment"])
        )  # Need to factor in withdrawals
        rowJson["Grades_Dist"] = [
            adjustGrade(row[i]) for i in range(7, 19)
        ]  # Uses inline function
        rowJson["Grades_Dist"].append((withdrawals * 100) / (rowJson["Enrollment"]))

        rowJson["CRN"] = int(row[21])  # Updated index for CRN
        rowJson["Credits"] = row[22]  # Updated index for Credits
        if rowJson["term"] == "Fall":
            termNum = "09"
        elif rowJson["term"] == "Winter":
            termNum = "12"
        elif rowJson["term"] == "Spring":
            rowJson["year"] += 1
            termNum = "01"
        elif rowJson["term"] == "Summer I":
            termNum = "06"
        elif rowJson["term"] == "Summer II":
            termNum = "07"
        else:
            raise Exception(f"{rowJson['term']} is not currently accounted for")
        rowJson["super_CRN"] = (
            str(rowJson["year"]) + ";" + termNum + ";" + str(rowJson["CRN"])
        )
        csvJson[rowJson["super_CRN"]] = rowJson

with open("../raw-data/rawSection.json", "w") as file:
    json.dump(csvJson, file, indent=4)

for groupID in groupStorage[1]:
    # print(groupID)
    if groupStorage[1][groupID].courseID != None:
        preStack = list()
        for prereq in groupStorage[1][groupID].prereqs:
            preStack.append(prereq)
        while preStack:
            currPrereq = preStack.pop()
            if currPrereq not in groupStorage[1]:
                if currPrereq not in courseDict:
                    raise Exception(f"Course not listed: { currPrereq}")
                currPrereq = courseDict[currPrereq]
            currPrereq = groupStorage[1][currPrereq]
            if currPrereq.courseID == None:
                # currPrereq.postreqs.append(groupID)
                for prereq in currPrereq.prereqs:
                    preStack.append(prereq)
            else:
                currPrereq.postreqs.append(groupStorage[1][groupID].groupID)


visited = set()
for groupID in groupStorage[1]:
    visited.add(groupID)
    groupStorage[1][groupID].unlockPrereqs()
    prereqs = groupStorage[1][groupID].prereqs
    for currPrereq in range(len(prereqs)):
        if prereqs[currPrereq] not in groupStorage[1]:
            if prereqs[currPrereq] not in courseDict:
                raise Exception(f"Course not listed: { prereqs[currPrereq]}")
            else:
                prereqs[currPrereq] = int(courseDict[prereqs[currPrereq]])
        else:
            prereqs[currPrereq] = int(prereqs[currPrereq])


# breakpoint()
jsonGroup = dict()
for obj in groupStorage[1]:
    jsonGroup[obj] = groupStorage[1][obj].to_dict()
# Write the JSON string to a file
with open("../raw-data/group.json", "w") as file:
    json.dump(jsonGroup, file, indent=4)

jsonCourse = dict()
for obj in classDict:
    try:
        jsonCourse[obj] = classDict[obj].to_dict()
    except Exception:
        print(obj)
        raise Exception
# Write the JSON string to a file
with open("../raw-data/class.json", "w") as file:
    json.dump(jsonCourse, file, indent=4)
# print(groupStorage[1][str(prereqs[0])])
# print(groupStorage[1][prereqs[1]])
# print()
# print(groupStorage)
# Need to parse under assumption that group may not exist currently
