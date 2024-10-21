import json
import random
def adjustRatings(rating):
    rating = rating * 2.25 - 1.25 + (random.random()/5 - 0.1)
    rating = round(rating, 1)
    rating = min(rating, 10.0)
    rating = max(rating, 1.0)
    return rating
with open("../raw-data/rawProfessors.json", "r") as jsonFile:
    rawProfessors = json.loads(jsonFile.read())
professors = {}
departments = set()
for professor in rawProfessors:
    if professor['node']['numRatings'] != 0:
        currProf = {}
        currProf['difficulty'] = adjustRatings(professor['node']['avgDifficulty'])
        currProf['rating'] = adjustRatings(professor['node']['avgRating'])
        currProf['department'] = professor['node']['department']
        departments.add(currProf['department'])
        currProf['recommendedPct'] = round(professor['node']['wouldTakeAgainPercent'], 2)
        currProf['firstName'] = professor['node']['firstName'].strip()
        currProf['lastName'] = professor['node']['lastName'].strip()
        currProf['numRatings'] = professor['node']['numRatings']
        key = f"{currProf['lastName']};{currProf['firstName']}"
        if key in professors and professors[key] != currProf:
            if currProf['numRatings'] > professors[key]['numRatings']:
                professors[key]['department'] = currProf['department']
            professors[key]['difficulty'] = professors[key]['numRatings'] * professors[key]['difficulty'] + currProf['numRatings'] * currProf['difficulty']
            professors[key]['rating'] = professors[key]['numRatings'] * professors[key]['rating'] + currProf['numRatings'] * currProf['rating']
            if professors[key]['recommendedPct'] != -1 and currProf['recommendedPct'] != -1:
                professors[key]['recommendedPct'] = professors[key]['numRatings'] * professors[key]['recommendedPct'] + currProf['numRatings'] * currProf['recommendedPct']
                professors[key]['recommendedPct'] /= (professors[key]['numRatings'] + currProf['numRatings'])
            elif currProf['recommendedPct'] != -1:
                professors[key]['recommendedPct'] = currProf['recommendedPct']               
            professors[key]['numRatings'] += currProf['numRatings']
            professors[key]['difficulty'] /= professors[key]['numRatings']
            professors[key]['rating'] /= professors[key]['numRatings']
        else:
            professors[key] = currProf
with open('../raw-data/professors.json', 'w') as file:
    json.dump(professors, file, indent=4)
print(departments)
    
