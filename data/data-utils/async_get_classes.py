import asyncio
import aiohttp
import os
import json
import signal
import sys
# Create a global list to store the class data
inProgess = True
newClasses = []

def handle_sigint(signum, frame):
    global inProgess
    global newClasses
    print("\nCtrl+C detected! Pausing for now...")
    inProgess = False
    with open("../raw-data/pausedClasses.json", "w") as f:
        json.dump(newClasses, f, indent=4)
    raise KeyboardInterrupt


async def fetch(session, i, rawClasses):
    global inProgess
    global newClasses
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
    global inProgess
    global newClasses
    rawClasses = []
    currIndex = 1
    if os.path.exists("../raw-data/rawClasses.json"):
        with open("../raw-data/rawClasses.json", "r") as jsonFile:
            rawClasses = json.loads(jsonFile.read())

    if os.path.exists("../raw-data/pausedClasses.json"):
        with open("../raw-data/pausedClasses.json", "r") as jsonFile:
            newClasses = json.loads(jsonFile.read())
            print("---------Resuming Progress---------")
            maxKey = max([int(item['key']) for item in newClasses], default=0)
            newClasses = [item for item in newClasses if int(item['key']) < (maxKey - 100 // 10)]
            currIndex = max(1, (maxKey - 100 // 10))
            print(currIndex)
        os.remove("../raw-data/pausedClasses.json")
   
    async with aiohttp.ClientSession() as session:
        step = 10
        while (inProgess):
            await asyncio.gather(
                *[fetch(session, currIndex + j, rawClasses) for j in range(step)]
            )
            currIndex += 10
            if (currIndex-1) % 100 == 0: 
                print(f"----------{currIndex-1} requests sent----------")
            await asyncio.sleep(1)

    nextKey = max([int(item['key']) for item in newClasses]) + 1
    for entry in rawClasses:
        entry["key"] = str(-nextKey)
        entry["allInGroup"][0]['key'] =  str(-nextKey)
        nextKey += 1
        newClasses.append(entry)
    
    with open("../raw-data/rawClasses.json", "w") as f:
        json.dump(newClasses, f, indent=4)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, handle_sigint)
    asyncio.run(main())
