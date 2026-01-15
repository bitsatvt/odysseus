import Typesense from "typesense";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "..", "data", "search");

const client = new Typesense.Client({
    nodes: [
        {
            host: process.env.TYPESENSE_HOST || "localhost",
            port: parseInt(process.env.TYPESENSE_PORT || "8108"),
            protocol: process.env.TYPESENSE_PROTOCOL || "http",
        },
    ],
    apiKey: process.env.TYPESENSE_API_KEY || "default",
});

const courseSchema = {
    name: "courses",
    fields: [
        { name: "code", type: "string", token_separators: ["-"] },
        { name: "title", type: "string" },
        { name: "desc", type: "string" },
    ],
};

const instructorSchema = {
    name: "instructors",
    fields: [
        { name: "firstName", type: "string" },
        { name: "lastName", type: "string" },
    ],
};

async function ensureCollection(schema) {
    try {
        await client.collections().create(schema);
        console.log(`Created '${schema.name}' collection`);
    } catch (e) {
        if (e.httpStatus === 409) {
            console.log(`'${schema.name}' collection already exists`);
        } else {
            throw e;
        }
    }
}

async function importDocuments() {
    const classesData = fs.readFileSync(path.join(dataDir, "classes.jsonl"), "utf-8");
    await client.collections("courses").documents().import(classesData, { action: "upsert" });
    const courseCount = classesData.trim().split("\n").length;
    console.log(`Imported ${courseCount} courses`);

    const instructorsData = fs.readFileSync(path.join(dataDir, "instructors.jsonl"), "utf-8");
    await client.collections("instructors").documents().import(instructorsData, { action: "upsert" });
    const instructorCount = instructorsData.trim().split("\n").length;
    console.log(`Imported ${instructorCount} instructors`);
}

async function createSearchOnlyKey() {
    try {
        const searchOnlyKey = await client.keys().create({
            description: "Search-only key for courses and instructors",
            actions: ["documents:search"],
            collections: ["courses", "instructors"],
            value: "search-only",
            limit_hints: 20,
        });
        console.log("Created search-only API key:", searchOnlyKey.value);
        return searchOnlyKey;
    } catch (e) {
        if (e.message.includes("API key generation conflict")) {
            console.log("Search-only key already generated")
        } else {
            console.error("Failed to create search-only key:", e.message);
            throw e;
        }
    }
}

async function main() {
    console.log("Initializing Typesense search...");

    await ensureCollection(courseSchema);
    await ensureCollection(instructorSchema);
    await importDocuments();
    await createSearchOnlyKey();

    console.log("Search initialization complete!");
}

main().catch(() => {
    console.error("Error initializing search");
    process.exit(1);
});
