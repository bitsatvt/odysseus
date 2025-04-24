import asyncio
import aiohttp
import os
import json

# Create a global list to store the class data
inProgess = True

async def fetch(session, i, rawClasses, newClasses):
    global inProgess
    try:
        async with session.post(
            url="https://catalog.vt.edu/course-search/api/?page=fose&route=details",
            data=f'{{"group":"key:{i}"}}',
        ) as res:
            data = await res.json()
            if data == []:
                inProgess = False;
                raise Exception("No data")
            prevEntry = None
            prevIndex = -1
            for index, entry in enumerate(rawClasses):
                if entry["code"] == data['code']:
                    prevEntry = entry
                    prevIndex = index
                    break

            if not prevEntry:
                newClasses.append(data)
                print(f"New class data {data['code']}")
            else: 
                dict1_compare = {k: v for k, v in prevEntry.items() if k != 'key' and k != 'allInGroup'}
                dict2_compare = {k: v for k, v in data.items() if k != 'key' and k != 'allInGroup'}
                
                if dict1_compare != dict2_compare:
                    print(f"Updated class data {data['code']}")
                newClasses.append(data)
                rawClasses.pop(prevIndex)
                

    except Exception as e:
        print(f"An error occurred for i={i}: {e}")


async def main():
    rawClasses = []
    if os.path.exists("../raw-data/rawClasses.json"):
        with open("../raw-data/rawClasses.json", "r") as jsonFile:
            rawClasses = json.loads(jsonFile.read())

    newClasses = []
    async with aiohttp.ClientSession() as session:
        step = 10
        i = 1
        while (inProgess):
            await asyncio.gather(
                *[fetch(session, i + j, rawClasses, newClasses) for j in range(step)]
            )
            i += 10
            if (i-1) % 100 == 0: 
                print(f"----------{i-1} requests sent.----------")
            await asyncio.sleep(1)

    nextKey = max(newClasses, key='key')
    for entry in rawClasses:
        entry["key"] = -nextKey
        entry["allInGroup"]['key'] = -nextKey
        newClasses.append(entry)
    
    with open("../raw-data/rawClasses.json", "w") as f:
        json.dump(newClasses, f, indent=4)

if __name__ == "__main__":
    asyncio.run(main())
