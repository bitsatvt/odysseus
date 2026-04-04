import json
import requests
from bs4 import BeautifulSoup

sections = {}
with open("../raw-data/newSection.json") as f:
    sections = json.load(f)


def crn_term_map(super_crn):
    crn_parts = super_crn.split(";")
    if crn_parts[1] == "01":
        crn_parts[0] = str(int(crn_parts[0]) + 1)
    return crn_parts


def fetch(session, super_crn, file):
    try:
        request_vars = crn_term_map(super_crn)
        with session.get(
            url=f"https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcComments?CRN={request_vars[2]}&TERM={request_vars[1]}&YEAR={request_vars[0]}",
        ) as res:
            if res.status_code != 200:
                file.write(f"{super_crn}:N/A\n")
                print(f"An error occurred for section {super_crn}: {res.status_code}")
                return
            
            html = res.text
            soup = BeautifulSoup(html, "html.parser")
            instructor_label = soup.find("td", class_="mplabel", string="Instructor")
            
            instructor = "N/A"
            if instructor_label:
                instructor_name_row = instructor_label.find_next("tr")
                if instructor_name_row:
                    instructor_name_cell = instructor_name_row.find("td", class_="mpdefault")
                    if instructor_name_cell:
                        instructor = instructor_name_cell.text.strip()
            
            file.write(f"{super_crn}:{instructor}\n")
        
    except Exception as e:
        print(f"An error occurred for section {super_crn}: {e}")
        file.write(f"{super_crn}:N/A\n")


def main():
    with open("../raw-data/superCrnToProfessor.txt", "w") as f:
        with requests.Session() as session:
            for i, section in enumerate(sections, 1):
                fetch(session, sections[section]["super_CRN"], f)
                if i % 100 == 0:
                    print(f"Scraped {i} sections")
                    f.flush()



if __name__ == "__main__":
    main()
