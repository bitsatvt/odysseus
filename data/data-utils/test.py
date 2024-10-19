import json

with open("../rawData/class.json") as f:
    data = json.load(f)

with open("../rawData/class.json", "w") as f:
    json.dump(list(data.values()), f)
