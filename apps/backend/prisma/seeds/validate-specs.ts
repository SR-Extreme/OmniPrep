import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ALL_PROBLEM_SPECS } from "./specs/index.js";
import { buildPythonSolution } from "./specs/solution-builders.js";
import { jsonIn, jsonOut } from "./types.js";

let failures = 0;

for (const spec of ALL_PROBLEM_SPECS) {
    const code = buildPythonSolution(spec);
    const dir = mkdtempSync(join(tmpdir(), "omniprep-"));
    const script = join(dir, "solve.py");
    writeFileSync(script, code, "utf8");

    const cases = [...spec.visibleCases, ...spec.hiddenCases];
    for (let i = 0; i < cases.length; i++) {
        const tc = cases[i];
        try {
            const stdout = execFileSync("python", [script], {
                input: jsonIn(tc.input),
                encoding: "utf8",
                timeout: 5000,
            }).trim();
            const got = JSON.parse(stdout);
            const expected = tc.output;
            if (JSON.stringify(got) !== JSON.stringify(expected)) {
                failures++;
                console.log(
                    `FAIL ${spec.slug} case ${i}: expected ${jsonOut(expected)} got ${jsonOut(got)}`,
                );
            }
        } catch (err) {
            failures++;
            console.log(`ERROR ${spec.slug} case ${i}:`, err);
        }
    }

    rmSync(dir, { recursive: true, force: true });
}

if (failures > 0) {
    console.error(`\n${failures} test case failures`);
    process.exit(1);
}

console.log(`All ${ALL_PROBLEM_SPECS.length * 10} Python test cases passed.`);
