import requests
import re
from bs4 import BeautifulSoup
import time

def get_all_subjects(session):
    """Fetch the list of all subject codes from the VT Timetable page."""
    print("Discovering all subjects...")
    # Use the historical page to ensure we see all subjects relevant to Winter/Spring
    url = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcRequest?history=Y"
    with session.get(url) as res:
        soup = BeautifulSoup(res.text, "html.parser")
        select = soup.find("select", {"name": "SUBJ_CODE"})
        if select:
            subjects = [opt.get("value") for opt in select.find_all("option") if opt.get("value") and opt.get("value") != "%"]
            print(f"Found {len(subjects)} subjects.")
            return subjects
    return []

def discover_crns(session, year, term_code, subject, history='Y'):
    """Search for all CRNs for a given subject and term."""
    url = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcRequest"
    payload = {
        "CAMPUS": "0",
        "TERMYEAR": f"{year}{term_code}",
        "CORE_CODE": "AR%",
        "SUBJ_CODE": subject,
        "SCHDTYPE": "%",
        "CRSE_NUMBER": "",
        "crn": "",
        "open_only": "",
        "history": history,
        "BTN_PRESSED": "FIND class sections",
        "inst_name": ""
    }
    
    try:
        with session.post(url, data=payload) as res:
            if res.status_code != 200:
                print(f"  Error searching subject {subject}: {res.status_code}")
                return []
            
            # Extract CRNs from the JavaScript links in the results table
            crns = re.findall(r"CRN=(\d+)", res.text)
            unique_crns = sorted(list(set(crns)))
            return unique_crns
    except Exception as e:
        print(f"  Exception during discovery for {subject}: {e}")
        return []

def fetch(session, super_crn, file, history='Y'):
    """Fetch the full instructor name for a specific section."""
    try:
        # super_crn format: YEAR;TERM;CRN
        parts = super_crn.split(";")
        year, term, crn = parts[0], parts[1], parts[2]
        
        url = f"https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcComments?CRN={crn}&TERM={term}&YEAR={year}&history={history}"
        with session.get(url) as res:
            if res.status_code != 200:
                file.write(f"{super_crn}:N/A\n")
                return
            
            soup = BeautifulSoup(res.text, "html.parser")
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
        file.write(f"{super_crn}:N/A\n")

def main():
    # Target Term: Winter 2024-2025 (Year 2024, Term 12)
    year = "2024"
    term_code = "12"
    
    output_path = "../raw-data/superCrnToProfessor.txt"
    print(f"Starting full scrape for Winter {year}-{int(year)+1}...")
    
    with open(output_path, "w") as f:
        with requests.Session() as session:
            subjects = get_all_subjects(session)
            total_crns_scraped = 0
            
            for subject in subjects:
                print(f"Processing Subject: {subject}...")
                crns = discover_crns(session, year, term_code, subject)
                
                if crns:
                    print(f"  Discovered {len(crns)} CRNs.")
                    for crn in crns:
                        super_crn = f"{year};{term_code};{crn}"
                        fetch(session, super_crn, f)
                        total_crns_scraped += 1
                    
                    f.flush() # Save results regularly
                    print(f"  Total sections scraped: {total_crns_scraped}")
                
                # Small sleep to be polite to the server
                time.sleep(0.1)

if __name__ == "__main__":
    main()
