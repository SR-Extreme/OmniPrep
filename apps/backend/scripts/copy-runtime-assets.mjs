import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const harnessSrc = join(
    backendRoot,
    "src",
    "services",
    "problem-runner",
    "harness",
    "MiniJson.java",
);
const harnessDestDir = join(
    backendRoot,
    "dist",
    "services",
    "problem-runner",
    "harness",
);

mkdirSync(harnessDestDir, { recursive: true });
copyFileSync(harnessSrc, join(harnessDestDir, "MiniJson.java"));
console.log("Copied MiniJson.java into dist/services/problem-runner/harness/");
