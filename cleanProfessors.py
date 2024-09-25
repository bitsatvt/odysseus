import json
import random
def adjustRatings(rating):
    rating = rating * 2.25 - 1.25 + (random.random()/5 - 0.1)
    rating = round(rating, 1)
    rating = min(rating, 10.0)
    rating = max(rating, 1.0)
    return rating
with open("data/rawProfessors.json", "r") as jsonFile:
    rawProfessors = json.loads(jsonFile.read())
professors = {}
departments = set()
for professor in rawProfessors:
    currProf = {}
    currProf['difficulty'] = adjustRatings(professor['node']['avgDifficulty'])
    currProf['rating'] = adjustRatings(professor['node']['avgRating'])
    currProf['department'] = professor['node']['department']
    departments.add(currProf['department'])
    currProf['recommendedPct'] = round(professor['node']['wouldTakeAgainPercent'], 2)
    currProf['firstName'] = professor['node']['firstName'].strip()
    currProf['lastName'] = professor['node']['lastName'].strip()
    currProf['numRatings'] = professor['node']['numRatings']
    key = f"{currProf['firstName']};{currProf['lastName']};{currProf['department']}"
    if key in professors and professors[key] != currProf:
        raise NameError("name and subject hash already found once.")
    else:
        professors[key] = currProf
with open('data/professors.json', 'w') as file:
    json.dump(professors, file, indent=4)
print(departments)
    
