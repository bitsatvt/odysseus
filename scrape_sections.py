import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup

sections = {}
scrapeCounter = 0
with open("data/rawSection.json") as f:
    sections = json.load(f)


def crn_term_map(super_crn):
    crn_parts = super_crn.split(";")
    if crn_parts[1] == "01":
        crn_parts[0] = str(int(crn_parts[0]) + 1)
    return crn_parts


async def fetch(session, super_crn, file):
    global scrapeCounter
    try:
        request_vars = crn_term_map(super_crn)
        async with session.get(
            url=f"https://apps.es.vt.edu/ssb/HZSKVTSC.P_ProcComments?CRN={request_vars[2]}&TERM={request_vars[1]}&YEAR={request_vars[0]}",
        ) as res:
            if res.status != 200:
                file.write(f"{super_crn}:{res.status}\n")
                print(f"An error occurred for section {super_crn}: {res.status}")
                scrapeCounter += 1
                return
            html = await res.text()
            soup = BeautifulSoup(html, "html.parser")
            instructor_label = soup.find("td", class_="mplabel", string="Instructor")
            instructor_name_cell = instructor_label.find_next("tr").find(
                "td", class_="mpdefault"
            )
            instructor = instructor_name_cell.text.strip()
            file.write(f"{super_crn}:{instructor}\n")
            scrapeCounter += 1
            # print("Instructor:", instructor)

    except Exception as e:
        print(f"An error occurred for section {super_crn}: {e}")
        file.write(f"{super_crn}:null\n")
        scrapeCounter += 1


async def main():
    with open("data/superCrnToProfessor.txt", "w") as f:
        async with aiohttp.ClientSession() as session:
            for i, section in enumerate(sections):
                asyncio.create_task(fetch(session, sections[section]["super_CRN"], f))
                await asyncio.sleep(0.01)
                if i % 100 == 0:
                    print(f"sent {i} requests, scraped {scrapeCounter} sections")
                if i % 5000 == 0:
                    while scrapeCounter < i - i/5:
                        print(f"sent {i} requests, scraped {scrapeCounter} sections")
                        await asyncio.sleep(1)
            while scrapeCounter < i :
                print(f"sent {i} requests, scraped {scrapeCounter} sections")
                await asyncio.sleep(1)
            print(f"sent {i} requests, scraped {scrapeCounter} sections")


if __name__ == "__main__":
    asyncio.run(main())
