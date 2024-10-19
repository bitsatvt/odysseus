import typesense
import json


def convert_class_to_jsonl():
    with open("../rawData/class.json", "r") as input:
        data = json.loads(input.read())
        with open("../search/classes.jsonl", "w") as out:
            for item in data:
                out.write(
                    json.dumps(
                        {
                            "name": item["id"] + ": " + item["title"],
                            "desc": item["description"],
                        }
                    )
                    + "\n"
                )


def convert_prof_to_jsonl():
    with open("../rawData/instructors.json", "r") as input:
        data = json.loads(input.read())
        with open("../search/instructors.jsonl", "w") as out:
            for item in dict.keys(data):
                out.write(json.dumps({"name": item}) + "\n")


client = typesense.Client(
    {
        "nodes": [
            {
                "host": "localhost",
                "port": 8108,
                "protocol": "http",
            },
        ],
        "api_key": "zijgRU2wXKE4gMJqm7Xk",
    }
)


def create_schemas():
    course_schema = {
        "name": "courses",
        "fields": [
            {"name": "name", "type": "string"},
            {"name": "desc", "type": "string"},
        ],
    }

    instructor_schema = {
        "name": "instructors",
        "fields": [
            {"name": "name", "type": "string"},
        ],
    }
    client.collections["courses"].delete()
    client.collections["instructors"].delete()

    client.collections.create(course_schema)
    client.collections.create(instructor_schema)


def import_documents():
    with open("../search/classes.jsonl", "r") as f:
        client.collections["courses"].documents.import_(f.read())
    with open("../search/instructors.jsonl", "r") as f:
        client.collections["instructors"].documents.import_(f.read())


def test_search():
    print(
        client.collections["instructors"].documents.search(
            {"q": "hernandez", "query_by": "name"}
        )
    )


convert_class_to_jsonl()
convert_prof_to_jsonl()
create_schemas()
import_documents()
test_search()
