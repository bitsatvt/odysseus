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


def fetch(session, super_crn, file, cookie):
    try:
        request_vars = crn_term_map(super_crn)
        with session.get(
            url=f"https://apps.es.vt.edu/ssb/HZSKVTSC.P_ProcComments?CRN={request_vars[2]}&TERM={request_vars[1]}&YEAR={request_vars[0]}",
            cookies = cookie
        ) as res:
            if res.status_code != 200:
                file.write(f"{super_crn}:{res.status}\n")
                print(f"An error occurred for section {super_crn}: {res.status}")
                return
            html = res.text
            soup = BeautifulSoup(html, "html.parser")
            instructor_label = soup.find("td", class_="mplabel", string="Instructor")
            instructor_name_cell = instructor_label.find_next("tr").find(
                "td", class_="mpdefault"
            )
            instructor = instructor_name_cell.text.strip()
            file.write(f"{super_crn}:{instructor}\n")
            return res.cookies.get_dict()['SESSID']
        
    except Exception as e:
        print(f"An error occurred for section {super_crn}: {e}")
        file.write(f"{super_crn}:null\n")


def main():
    yourCookie = input("Go to the class timetable and click a class, and then copy your SESSID cookie here: ")
    with open("../raw-data/superCrnToProfessor.txt", "w") as f:
        cookie =  {"SESSID": yourCookie}
        with requests.Session() as session:
            for i, section in enumerate(sections, 1):
                cookie["SESSID"] = fetch(session, sections[section]["super_CRN"], f, cookie)
                if i % 100 == 0:
                    print(f"Scraped {i} sections")
                    f.flush()



if __name__ == "__main__":
    main()
