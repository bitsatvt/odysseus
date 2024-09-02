from parsing import Group, Course, simplifyList, addParenthesis, close
from bs4 import BeautifulSoup
import json

def graphParenthesis(relationsList:list[str], start, retNode, groupStorage):
    stack = list()
    stack.append(start)
    iter = start + 1
    
    while stack:
        if relationsList[iter] == ")":
            if len(stack) == 1:
                newNode = graphingHelper(relationsList[stack.pop(): iter + 1], groupStorage)
                newNode.lockCoreqs()
                newNode.lockPrereqs()
                if newNode in groupStorage[0]:
                    retNode.prereqs.append(groupStorage[0][newNode])
                else:
                    newNode.setPermanent()
                    groupStorage[0][newNode] = str(newNode.groupID)
                    groupStorage[1][str(newNode.groupID)] = newNode
                    retNode.prereqs.append(str(newNode.groupID))
                break
            else: 
                stack.pop()
        elif relationsList[iter] == "(" :
            stack.append(iter)
        iter += 1
    return iter

def graphingHelper(relationsList:list, groupStorage) -> Group:
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
        elif relationsList[iter].isalnum():
            retNode.prereqs.append(relationsList[iter])
        elif relationsList[iter] == "(":
            iter = graphParenthesis(relationsList, iter, retNode, groupStorage)
        else:
            raise Exception("Unexpected behavior, investigate further")
        iter += 1
    retNode.preReqType = typeList
    return retNode

with open("classes.json", "r") as jsonFile:
    rawClasses = json.loads(jsonFile.read())
    
IDtoGroup = dict()
GrouptoID = dict()
groupStorage = (IDtoGroup, GrouptoID)
courseDict = dict()
courseDict[-1] = "MidNode"

import sys
import io

for ID, rawClass in enumerate(rawClasses):
    crossList = []
    # Future work
    # Delete HTML tags in pathways, repeatability
    # Check HTML is not in any others
    # Parse Crosslist and delete HTML
    #
    rawClass['pathway'] = BeautifulSoup(rawClass['pathway'], "html.parser").text
    rawClass['pathway'] = rawClass['pathway'][rawClass['pathway'].find(":") + 2:]  
     
    rawClass['repeatability'] = BeautifulSoup(rawClass['repeatability'], "html.parser").text
    
    rawClass['cross_listed'] = BeautifulSoup(rawClass['cross_listed'], "html.parser").text
    rawClass['cross_listed'] = rawClass['cross_listed'][rawClass['cross_listed'].find(":") + 2:]
    # cleanClass = Course(ID, rawClass['code'], rawClass['title'], rawClass['cross_listed'].split(", "), rawClass['repeatability'], rawClass['description'], rawClass['pathway'], rawClass['hours_html'])
    currGroup = Group(perm = True)
    currGroup.courseID = ID    
    try:
        temp = rawClass['prereq']
        rawClass['prereq'] = BeautifulSoup(rawClass['prereq'], "html.parser").text
        rawClass['prereq'] = rawClass['prereq'][rawClass['prereq'].find(":") + 2:]    
        rawClass['prereq'] = rawClass['prereq'].split()
        rawClass['prereq'] = simplifyList(rawClass['prereq'])
        addParenthesis(rawClass['prereq'],1)
        close(rawClass['prereq'])
        tempNode = graphingHelper(rawClass['prereq'], groupStorage) if len(rawClass['prereq']) > 0 else None
        if tempNode:
            currGroup.prereqs = tempNode.prereqs
            currGroup.preReqType = tempNode.preReqType
    except Exception:
        print(ID)
        print(temp)
        raise Exception
    # print(rawClass['coreq'])
    rawClass['coreq'] = BeautifulSoup(rawClass['coreq'], "html.parser").text
    rawClass['coreq'] = rawClass['coreq'][rawClass['coreq'].find(":") + 2:]
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
    groupStorage[0][currGroup] = currGroup.groupID
    groupStorage[1][currGroup.groupID] = currGroup
    courseDict[rawClass['code'].replace(" ","")] = currGroup.groupID   
    # print(cleanClass)
    # print()
    
# print(courseDict[groupStorage[1][188].courseID])
# print(courseDict[groupStorage[1][208].courseID])
# visitedGroups = set()
# print(courseDict)
for groupID in groupStorage[1]:
    # print(groupID)
    if groupStorage[1][groupID].courseID != -1:
        preStack = list()
        for prereq in groupStorage[1][groupID].prereqs:
            preStack.append(prereq)
        while preStack:
            currPrereq = preStack.pop()
            if currPrereq not in groupStorage[1]:
                if currPrereq not in courseDict:
                    if currPrereq[:-1] not in courseDict:
                        print(f"Course not listed: {currPrereq}")
                        continue
                    else:
                        currPrereq = courseDict[currPrereq[:-1]] 
                else:
                    currPrereq = courseDict[currPrereq]
            currPrereq = groupStorage[1][currPrereq]
            if currPrereq.courseID == -1:
                for prereq in currPrereq.prereqs:
                    preStack.append(prereq)
            else:
                currPrereq.postreqs.append(groupID)
            
        
            
            
        
# print(groupStorage)
# Need to parse under assumption that group may not exist currently