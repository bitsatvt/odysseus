import csv
import json


csvJson = dict()
with open('Grade-Distribution.csv', newline='') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    iter = 0
    for row in spamreader:
        if iter == 0:
            iter += 1
            continue
        rowJson = dict()
        rowJson["year"] = row[0][:row[0].find("-")]
        rowJson["term"] = row[1]
        # rowJson["course_subject"] = row[2]
        # rowJson["course_code"] = row[3]
        rowJson["course_id"] = row[2] + "-" + row[3]
        rowJson["title"] = row[4]
        rowJson["Instructor"] = row[5]
        rowJson["GPA"] = row[6]
        rowJson["Grades_Dist"] = [row[i] for i in range(7,19)]   
        rowJson["W_rate"] = row[19]
        rowJson["Enrollment"] = row[20]          # Updated index for Enrollment
        rowJson["CRN"] = row[21]                 # Updated index for CRN
        rowJson["Credits"] = row[22]             # Updated index for Credits
        termNum = "0"
        if rowJson["term"].endswith("l"):
            termNum = "1"
        if rowJson["term"].endswith("II"):
            termNum = "3"
        if rowJson["term"].endswith("I"):
            termNum = "2"
        rowJson["super_CRN"] = rowJson["year"] +";" + termNum + ";" + rowJson["CRN"]
        csvJson[rowJson["super_CRN"]] = rowJson
with open('section.json', 'w') as file:
    json.dump(csvJson, file, indent=4)