import json
with open("data/rawSection.json") as f:
    sections = json.load(f)
for section in sections:
    del sections[section]["title"]
    del sections[section]["super_CRN"]
with open('data/rawSection.json', 'w') as file:
    json.dump(sections, file, indent=4)
    
    
import json
with open("data/section.json") as f:
    sections = json.load(f)
for section in sections:
    del sections[section]["title"]
    del sections[section]["super_CRN"]
with open('data/section.json', 'w') as file:
    json.dump(sections, file, indent=4)