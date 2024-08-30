class Node:
    def __init__(self):
        self.type = 1
        self.prereqs = None

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
                
            elif listData[iter][-1].isnumeric:
                newList.append(classToken + listData[iter])
                classToken = "" # Unneed but added for clarity
                
            else:
                raise Exception("Unexpected input, investigate further")
    newList.append(")")
    return newList

def parseBinaryTest(stringData:str) -> tuple:
    relationsList = stringData.split()
    relationsList = simplifyList(relationsList)
    addParenthesis(relationsList,1,len(relationsList) - 1)
    return parsingHelper(relationsList)
            
# (CS 1044 or CS 1705 or CS 1114 or CS 1124) 
# and
# ( MATH2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) 
# and 
# (MATH 2204 or MATH 2204H)

def processParenthesis(relationsList:list[str], start, end):
    stack = list()
    stack.append(start)
    iter = start + 1
    
    while stack and iter < end:
        if relationsList[iter] == ")":
            if len(stack) == 1:
                addParenthesis(relationsList,stack.pop() + 1, iter)
                break
            else:
                stack.pop()
        elif relationsList[iter] == "(" :
            stack.append(iter)
        iter += 1
    return iter


def addParenthesis(relationsList:list[str], start, end) -> None:
    typeList = None
    iter = start
    while iter < end:
        if relationsList[iter] == "and":
            if typeList == 1:
                print("Unexpected behavior, investigate further")
                newIter = iter
                
                # Reverse back to first registered command
                while relationsList[newIter - 1] != "or":
                    newIter -= 1
                # Insert a parenthesis
                relationsList.insert(newIter,"(")
                # Move forward until next correct command or end
                newIter += 1
                while newIter < end and relationsList[newIter] != "or":
                    if relationsList[newIter] == "(":
                        newIter = processParenthesis(relationsList, newIter, end)
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
                while relationsList[newIter - 1] != "and":
                    newIter -= 1
                # Insert a parenthesis
                relationsList.insert(newIter,"(")
                # Move forward until next correct command or end
                newIter += 1
                while newIter < end and relationsList[newIter] != "and":
                    if relationsList[newIter] == "(":
                        newIter = processParenthesis(relationsList, newIter, end)
                    newIter += 1
                relationsList.insert(newIter,")")
                iter = newIter
            else:
                typeList = 1
        
        elif relationsList[iter] == "(":
            iter = processParenthesis(relationsList, iter, end)
            
        elif not relationsList[iter].isalnum():
            raise Exception("Unexpected behavior, investigate further")
        
        iter += 1


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
    
# # MATH 3134 -> Simple and group
# # MATH 1226 and (MATH 2534 or MATH 3034)
assert(parseBinaryTest("MATH 1226 and (MATH 2534 or MATH 3034)") == (0, ["MATH1226", (1,["MATH2534", "MATH3034"])]))

# # CS 3214 -> simple or group
# # (CS 2506 and CS 2114) or (ECE 2564 and ECE 3574)
assert(parseBinaryTest("(CS 2506 and CS 2114) or (ECE 2564 and ECE 3574)") == (1, [(0,["CS2506", "CS2114"]), (0,["ECE2564", "ECE3574"])]))


# # ISE 3414 -> More complicated and group
# # ISE 2004 and ISE 2024 and (MATH 2204 or MATH 2204H or MATH 2406H) and (MATH 2214 or MATH 2214H) and (CS 1044 or CS 1064 or CS 1114 or ECE 1574)
assert(parseBinaryTest("ISE 2004 and ISE 2024 and (MATH 2204 or MATH 2204H or MATH 2406H) and (MATH 2214 or MATH 2214H) and (CS 1044 or CS 1064 or CS 1114 or ECE 1574)") == (0, ["ISE2004", "ISE2024",(1,["MATH2204","MATH2204H","MATH2406H"]),(1,["MATH2214","MATH2214H"]), (1,["CS1044","CS1064","CS1114","ECE1574"])]))


# # CS 4824 -> simple and group
# # (ECE 3514 or CS 2114) and (STAT 3704 or STAT 4105 or STAT 4604 or STAT 4705 or STAT 4714 or CMDA 2006)
assert(parseBinaryTest("(ECE 3514 or CS 2114) and (STAT 3704 or STAT 4105 or STAT 4604 or STAT 4705 or STAT 4714 or CMDA 2006)") == (0,[(1,["ECE3514","CS2114"]),(1,["STAT3704","STAT4105","STAT4604","STAT4705","STAT4714","CMDA2006"])]))


# MATH 3414 -> what the fuck is this
# (CS 1044 or CS 1705 or CS 1114 or CS 1124) and
# MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and 
# (MATH 2204 or MATH 2204H)
# print(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and (MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H)) and (MATH 2204 or MATH 2204H)"))
# print("")
assert(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and (MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H)) and (MATH 2204 or MATH 2204H)") == (0,[(1,["CS1044","CS1705","CS1114","CS1124"]),(1,["MATH2406H",(0,["CMDA2005","CMDA2006"]),(1,["MATH2214","MATH2214H"])]),(1,["MATH2204","MATH2204H"])]))
# print(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)"))
assert(parseBinaryTest("(CS 1044 or CS 1705 or CS 1114 or CS 1124) and MATH 2406H or (CMDA 2005 and CMDA 2006) or (MATH 2214 or MATH 2214H) and (MATH 2204 or MATH 2204H)") == (0,[(1,["CS1044","CS1705","CS1114","CS1124"]),(1,["MATH2406H",(0,["CMDA2005","CMDA2006"]),(1,["MATH2214","MATH2214H"])]),(1,["MATH2204","MATH2204H"])]))
