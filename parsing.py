class Group:
    currGroupID = 0
    
    def __init__(self, perm = False):
        self.groupID = -1
        self.preReqType = None
        self.prereqs = []
        self.coreqs = ""
        self.postreqs = []
        self.courseID = None
        self.hash = None
        if perm:
            self.groupID = Group.currGroupID
            Group.currGroupID += 1
        
    def setPermanent(self):
        self.groupID = Group.currGroupID
        Group.currGroupID += 1
        
    def lockPrereqs(self):
        self.prereqs = sorted(self.prereqs)
        self.prereqs = tuple(self.prereqs)
        self.hash = str(self.courseID) + ":" + ";".join(self.prereqs)
        
    def unlockPrereqs(self):
        self.prereqs = list(self.prereqs)

    def lockCoreqs(self):
        self.coreqs = sorted(self.coreqs)
        self.coreqs = tuple(self.coreqs)
        
    def lockPostreqs(self):
        self.postreqs = sorted(self.postreqs)
        self.postreqs = tuple(self.postreqs)
        
    def __str__(self):
        retStr = f"{'O' if self.preReqType == 1 else 'A'}: "
        retStr += "["
        for prereq in self.prereqs:
            retStr += f" {prereq},"
        if self.prereqs:
            retStr = retStr[:-1] + " ]"
        else:
            retStr = retStr + " ]"
            
        return retStr
    
    def __repr__(self):
        return self.__str__()

    def __eq__(self, value: object) -> bool:
        if isinstance(value, Group):
            if self.courseID != None:
                return self.courseID == value.courseID
            else:
                return set(self.prereqs) == set(self.prereqs)
        else:
            return False
        
    def __hash__(self) -> int:
        if isinstance(self.prereqs, tuple):
            # print(";".join(self.prereqs))
            # print(str(self.courseID) + ":" + ";".join(self.prereqs) + ":" + ";".join(self.coreqs))
            return hash(str(self.courseID) + ":" + ";".join(self.prereqs))
        else:
            raise Exception("Hashing is only allowed after prereqs and coreqs have been locked")
    
    def to_dict(self):
        return {
            'id': self.groupID,
            'type': self.preReqType,
            'requires': self.prereqs,
            'coreqs': self.coreqs,
            'requiredBy': self.postreqs,
            'courseID': self.courseID,
            'hash': self.hash
        }
        
class Course:
    def __init__(self, courseID, groupID, courseCode, courseName, crossList, repeatability, description, pathways, creditHours):
        self.courseID = courseID
        self.groupID = groupID
        self.courseCode = courseCode
        self.courseName = courseName
        self.crossList = crossList
        self.repeatability = repeatability
        self.description = description
        self.pathways = pathways
        self.creditHours = creditHours
    
    def __str__(self):
        return (f"Course ID: {self.courseID}\n"
                f"Course Code: {self.courseCode}\n"
                f"Course Name: {self.courseName}\n"
                f"Cross-Listed: {self.crossList}\n"
                f"Repeatability: {self.repeatability}\n"
                f"Description: {self.description}\n"
                f"Pathways: {self.pathways}\n"
                f"Credit Hours: {self.creditHours}")
    def to_dict(self):
        code = self.courseCode[self.courseCode.find(" ")+ 1:]
        level = int(code[0]) if code[0].isnumeric() else 9
        return {
            'id':self.courseCode.replace(" ", "-"),
            'subject': self.courseCode[:self.courseCode.find(" ")],
            'code': code,
            'level': level,
            'title': self.courseName,
            'repeatability': self.repeatability,
            'description': self.description,
            'pathways': self.pathways,
            'hours': self.creditHours,
            'crosslist': self.crossList
        }
def close(relationsList):
    paren = 0
    for token in relationsList:
        if token == "(":
            paren += 1
        elif token == ")":
            paren -= 1
    if paren != 0:
        print("Unexpected behavior, investigate further")
    while paren > 0:
        paren -= 1
        relationsList.append(")")
    while paren < 0:
        paren += 1
        relationsList.insert(0,"(")

def simplifyList(listData:list[str]) -> list[str]:
    newList = ["("]
    classToken = ""
    for iter in range(len(listData)):
        if listData[iter] == "and" or listData[iter] == "or":
            newList.append(listData[iter])
        else:
            if listData[iter][0] == "(":
                while listData[iter][0] == "(":
                    newList.append("(")
                    listData[iter] = listData[iter][1:]
                classToken = listData[iter]
                
            elif listData[iter][0].isalpha():
                classToken = listData[iter]
                
            elif listData[iter][-1] == ")":
                classNum = listData[iter][:listData[iter].find(")")]
                newList.append(classToken + classNum)
                listData[iter] = listData[iter][listData[iter].find(")"):]
                while len(listData[iter]) > 0:
                    newList.append(")")
                    listData[iter] = listData[iter][1:]
                classToken = "" # Unneed but added for clarity
                
            elif listData[iter][-1].isalnum:
                newList.append(classToken + listData[iter])
                classToken = "" # Unneed but added for clarity
                
            else:
                raise Exception("Unexpected input, investigate further")
    newList.append(")")
    return newList

            
# (CS 1044 or CS 1705 or CS 1114 or CS 1124) 
# and
# ( MATH2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) 
# and 
# (MATH 2204 or MATH 2204H)

def processParenthesis(relationsList:list[str], start):
    stack = list()
    stack.append(start)
    iter = start + 1
    
    while stack and iter < len(relationsList):
        if relationsList[iter] == ")":
            if len(stack) == 1:
                iter = addParenthesis(relationsList,stack.pop() + 1)
                break
            else:
                stack.pop()
        elif relationsList[iter] == "(" :
            stack.append(iter)
        iter += 1
    return iter


def addParenthesis(relationsList:list[str], start) -> None:
    typeList = None
    iter = start 
    # print(relationsList)
    while iter < len(relationsList):
        if relationsList[iter] == "and":
            if typeList == 1:
                print("Unexpected behavior, investigate further")
                newIter = iter
                # 3
                # Reverse back to first registered command
                paren = 0
                while newIter >= 0 and ( paren or relationsList[newIter] != "or"):
                    if relationsList[newIter] == ")":
                        paren += 1
                    elif relationsList[newIter] == "(":
                        paren -=1
                    newIter -= 1
                # Insert a parenthesis
                relationsList.insert(newIter + 1,"(")
                # Move forward until next correct command or end
                newIter = iter + 1
                while newIter < len(relationsList) and relationsList[newIter] != "or":
                    if relationsList[newIter] == "(":
                        newIter = processParenthesis(relationsList, newIter) + 1
                        continue
                    if relationsList[newIter] == ")":
                        break
                    newIter += 1
                relationsList.insert(newIter,")")
                iter = newIter
            else:
                typeList = 0
            
        elif relationsList[iter] == "or":
            if typeList == 0:
                # breakpoint()
                print("Unexpected behavior, investigate further")
                newIter = iter
                
                # Reverse back to first registered command
                paren = 0
                while newIter >= 0 and ( paren or relationsList[newIter] != "and"):
                    if relationsList[newIter] == ")":
                        paren += 1
                    elif relationsList[newIter] == "(":
                        paren -=1
                    newIter -= 1
                # Insert a parenthesis
                relationsList.insert(newIter + 1,"(")
                # Move forward until next correct command or end
                newIter = iter + 1
                while newIter <= len(relationsList) and relationsList[newIter] != "and":
                    if relationsList[newIter] == "(":
                        newIter = processParenthesis(relationsList, newIter) + 1
                        continue
                    if relationsList[newIter] == ")":
                        break
                    newIter += 1
                relationsList.insert(newIter,")")
                iter = newIter
            else:
                typeList = 1
        
        elif relationsList[iter] == "(":
            iter = processParenthesis(relationsList, iter)
        elif relationsList[iter] == ")":
            return iter
        elif not relationsList[iter].isalnum():
            # breakpoint()
            raise Exception("Unexpected behavior, investigate further")
        
        iter += 1

    
    
def graphParenthesis(relationsList:list[str], start, retNode):
    stack = list()
    stack.append(start)
    iter = start + 1
    
    while stack:
        if relationsList[iter] == ")":
            if len(stack) == 1:
                retNode.prereqs.append(graphingHelper(relationsList[stack.pop(): iter + 1]))
                break
            else: 
                stack.pop()
        elif relationsList[iter] == "(" :
            stack.append(iter)
        iter += 1
    return iter



def graphingHelper(relationsList:list) -> Group:
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
            iter = graphParenthesis(relationsList, iter, retNode)
        else:
            raise Exception("Unexpected behavior, investigate further")
        iter += 1
    retNode.typeList = typeList
    return retNode
    
    
    
    
    
def parseBinaryTest(stringData:str) -> tuple:
    relationsList = stringData.split()
    relationsList = simplifyList(relationsList)
    addParenthesis(relationsList,1)
    close(relationsList)
    return parsingHelper(relationsList)



def parseBinary(stringData):
    relationsList = stringData.split()
    relationsList = simplifyList(relationsList)
    addParenthesis(relationsList,0)
    close(relationsList)
    return graphingHelper(relationsList)


def parseParenthesis(relationsList:list[str], start, retList):
    stack = list()
    stack.append(start)
    iter = start + 1
    
    while stack:
        if relationsList[iter] == ")":
            if len(stack) == 1:
                retList.append(parsingHelper(relationsList[stack.pop(): iter + 1]))
                break
            else: 
                stack.pop()
        elif relationsList[iter] == "(" :
            stack.append(iter)
        iter += 1
    return iter



def parsingHelper(relationsList:list) -> tuple:
    retList = []
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
            retList.append(relationsList[iter])
        elif relationsList[iter] == "(":
            iter = parseParenthesis(relationsList, iter, retList)
        else:
            raise Exception("Unexpected behavior, investigate further")
        iter += 1
    return (typeList, retList)
    