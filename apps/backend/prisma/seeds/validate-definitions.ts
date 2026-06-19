import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PROBLEM_DEFINITIONS } from "./problem-definitions.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function detectIssue(slug: string, py: string): string | null {
    if (py.includes("nums[mid] == target")) {
        const allowed = new Set([
            "binary-search",
            "search-insert-position",
            "find-minimum-in-rotated-sorted-array",
            "search-in-rotated-sorted-array",
            "find-first-and-last-position-of-element-in-sorted-array",
        ]);
        if (!allowed.has(slug)) return "binary-search copy";
    }
    if (py.includes("last[ch]") && slug !== "longest-substring-without-repeating-characters") {
        return "sliding-window copy";
    }
    if (py.includes("grid[nx][ny] == '1'") && slug !== "number-of-islands") {
        return "islands copy";
    }
    if (py.includes("dp[a - c]") && slug !== "coin-change") {
        return "coin-change copy";
    }
    if (py.includes("pricesArr") || py.includes('data.get("prices"')) {
        if (slug !== "best-time-to-buy-and-sell-stock") return "stock copy?";
    }
    return null;
}

const expectedInputKeys: Record<string, string[]> = {
    "ransom-note": ["ransomNote", "magazine"],
    "first-bad-version": ["bad"],
    "sqrtx": ["x"],
    "longest-common-prefix": ["strs"],
    "implement-strstr": ["haystack", "needle"],
    "flood-fill": ["image"],
    "same-tree": ["p", "q"],
    "decode-ways": ['"s"'],
    "daily-temperatures": ["temperatures"],
    "evaluate-reverse-polish-notation": ["tokens"],
    "course-schedule": ["numCourses", "prerequisites"],
    "word-ladder": ["beginWord", "endWord", "wordList"],
    "edit-distance": ["word1", "word2"],
};

console.log(`Checking ${PROBLEM_DEFINITIONS.length} definitions...\n`);

let issueCount = 0;
for (const def of PROBLEM_DEFINITIONS) {
    const issues: string[] = [];
    const copyIssue = detectIssue(def.slug, def.pythonSolution);
    if (copyIssue) issues.push(copyIssue);

    const keys = expectedInputKeys[def.slug];
    if (keys) {
        for (const key of keys) {
            if (!def.pythonSolution.includes(key)) {
                issues.push(`missing ${key} in python`);
            }
        }
    }

    if (issues.length > 0) {
        issueCount++;
        console.log(`${def.num.toString().padStart(3)} ${def.slug}: ${issues.join(", ")} [${def.inputFormat}]`);
    }
}

console.log(`\nProblems with issues: ${issueCount}/${PROBLEM_DEFINITIONS.length}`);
