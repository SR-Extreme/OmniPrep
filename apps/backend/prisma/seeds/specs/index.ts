import { BATCH_01_SPECS } from "./batch-01.js";
import { BATCH_02_SPECS } from "./batch-02.js";
import { BATCH_03_SPECS } from "./batch-03.js";
import { BATCH_04_SPECS } from "./batch-04.js";
import type { ProblemSpec } from "./types.js";

export const ALL_PROBLEM_SPECS: ProblemSpec[] = [
    ...BATCH_01_SPECS,
    ...BATCH_02_SPECS,
    ...BATCH_03_SPECS,
    ...BATCH_04_SPECS,
];

export function specBySlug(slug: string): ProblemSpec {
    const spec = ALL_PROBLEM_SPECS.find((p) => p.slug === slug);
    if (!spec) {
        throw new Error(`Unknown problem slug: ${slug}`);
    }
    return spec;
}
