import json
import asyncio
import aiohttp
from bs4 import BeautifulSoup

sections = {}

with open("section.json") as f:
    sections = json.load(f)


def crn_term_map(super_crn):
    crn_parts = super_crn.split(";")
    year = crn_parts[0]
    term = crn_parts[1]

    if term == "0":
        return "09"
    elif term == "1":
        if year > "2019":
            return "12"
        return "09"
    elif term == "2":
        return "01"
    elif term == "3":
        return "06"
    elif term == "4":
        return "07"


async def fetch(session, super_crn, file):
    try:
        crn_parts = super_crn.split(";")
        async with session.get(
            url=f"https://apps.es.vt.edu/ssb/HZSKVTSC.P_ProcComments?CRN={crn_parts[2]}&TERM={crn_term_map(super_crn)}&YEAR={crn_parts[0]}",
        ) as res:
            if res.status == 503:
                file.write(f"{super_crn} 503\n")
                return
            html = await res.text()
            soup = BeautifulSoup(html, "html.parser")
            instructor_label = soup.find("td", class_="mplabel", text="Instructor")
            instructor_name_cell = instructor_label.find_next("tr").find(
                "td", class_="mpdefault"
            )
            instructor = instructor_name_cell.text.strip()
            file.write(f"{super_crn} {instructor}\n")
            print("Instructor:", instructor)

    except Exception as e:
        print(f"An error occurred for section {super_crn}: {e}")
        file.write(f"{super_crn} null\n")


async def main():
    with open("superCrnToProfessor.txt", "a") as f:
        async with aiohttp.ClientSession() as session:
            for i, section in enumerate(sections):
                if i < 55377:
                    continue
                asyncio.create_task(fetch(session, sections[section]["super_CRN"], f))
                f.flush()
                await asyncio.sleep(0.01)


if __name__ == "__main__":
    asyncio.run(main())
