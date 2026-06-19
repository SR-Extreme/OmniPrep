import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PROBLEM_DESCRIPTIONS } from "./problem-descriptions.ts";
import { PROBLEM_DEFINITIONS } from "./problem-definitions.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_PATH = join(__dirname, "problem-definitions.ts");

function escapeForJsonString(value: string): string {
    return JSON.stringify(value);
}

function main(): void {
    let source = readFileSync(DEFINITIONS_PATH, "utf8");
    let updated = 0;

    for (const def of PROBLEM_DEFINITIONS) {
        const description = PROBLEM_DESCRIPTIONS[def.slug];
        if (!description) {
            throw new Error(`Missing description for slug: ${def.slug}`);
        }

        const slugPattern = `"slug": "${def.slug}"`;
        const slugIndex = source.indexOf(slugPattern);
        if (slugIndex === -1) {
            throw new Error(`Could not find slug in definitions: ${def.slug}`);
        }

        const descKey = '"description": ';
        const descIndex = source.indexOf(descKey, slugIndex);
        if (descIndex === -1) {
            throw new Error(`Could not find description field for: ${def.slug}`);
        }

        const valueStart = descIndex + descKey.length;
        if (source[valueStart] !== '"') {
            throw new Error(`Unexpected description format for: ${def.slug}`);
        }

        let valueEnd = valueStart + 1;
        while (valueEnd < source.length) {
            if (source[valueEnd] === "\\") {
                valueEnd += 2;
                continue;
            }
            if (source[valueEnd] === '"') {
                break;
            }
            valueEnd += 1;
        }

        const replacement = escapeForJsonString(description);
        source = source.slice(0, valueStart) + replacement + source.slice(valueEnd + 1);
        updated += 1;
    }

    writeFileSync(DEFINITIONS_PATH, source, "utf8");
    console.log(`Updated ${updated} problem descriptions in ${DEFINITIONS_PATH}`);
}

main();
