import json
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from bs4 import BeautifulSoup
from parsing import simplifyList, addParenthesis, close

with open("../raw-data/rawClasses.json", "r") as jsonFile:
    rawClasses = json.loads(jsonFile.read())
fucked = {}
lengthTracker = {}
for rawClass in rawClasses:
    temp = rawClass['prereq']
    rawClass['prereq'] = BeautifulSoup(rawClass['prereq'], "html.parser").text
    rawClass['prereq'] = rawClass['prereq'][rawClass['prereq'].find(":") + 2:]    
    rawClass['prereq'] = rawClass['prereq'].split()
    rawClass['prereq'] = simplifyList(rawClass['prereq'])
    addParenthesis(rawClass['prereq'],1)
    close(rawClass['prereq'])
    if len(rawClass['prereq']) == 37:
        print(rawClass['prereq'])
        print(rawClass['code'])
    if len(rawClass['prereq']) > 50:
        fucked[rawClass["code"]] = len(rawClass['prereq'])
    elif len(rawClass['prereq']) > 13:
        lengthTracker[len(rawClass['prereq'])] = lengthTracker.get(len(rawClass['prereq']), 0) + 1
    
# Prepare data for plotting
lengths = list(lengthTracker.keys())
counts = list(lengthTracker.values())
print(fucked)
# Create the bar chart
plt.figure(figsize=(10, 6))
plt.bar(lengths, counts, color='skyblue', edgecolor='black')

# Set the y-axis to logarithmic scale if you want that
# plt.yscale('log')  # Remove this line if you want a linear scale
plt.xlabel('Number of Prerequisites')
plt.ylabel('Number of Classes (log scale)')  # Adjust label if not log scale
plt.title('Number of Classes by Number of Prerequisites')
plt.xticks(lengths)  # Ensure x-ticks match the lengths
plt.grid(axis='y')

# Show the plot
plt.show()