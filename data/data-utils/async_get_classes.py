import asyncio
import aiohttp
import os
import json

# Create a global list to store the class data
classes = []


async def fetch(session, i):
    try:
        async with session.post(
            url="https://catalog.vt.edu/course-search/api/?page=fose&route=details",
            data=f'{{"group":"key:{i}"}}',
        ) as res:
            data = await res.json()
            classes.append(data)
            print(len(classes))
    except Exception as e:
        print(f"An error occurred for i={i}: {e}")


async def main():
    if os.path.exists("../raw-data/classes.json"):
        os.remove("../raw-data/classes.json")

    async with aiohttp.ClientSession() as session:
        step = 10
        max = 8223
        for i in range(1, max, step):
            await asyncio.gather(
                *[fetch(session, i + j) for j in range(step) if i + j < max]
            )
            print("sleeping")
            await asyncio.sleep(1)
    with open("../raw-data/classes.json", "w") as f:
        f.write(json.dumps(classes))


if __name__ == "__main__":
    asyncio.run(main())
