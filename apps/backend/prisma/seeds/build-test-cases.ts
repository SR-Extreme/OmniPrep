import { jsonIn, jsonOut, type SeedTestCase } from "./types.js";

type CasePair = { input: unknown; output: unknown; explanation?: string };

/**
 * Build 10 test cases: orders 0-1 visible, 2-9 hidden.
 */
export function buildTenCases(
    visible: [CasePair, CasePair],
    hidden: CasePair[],
    hiddenExplanations?: (string | undefined)[],
): SeedTestCase[] {
    if (hidden.length !== 8) {
        throw new Error("Expected exactly 8 hidden test cases");
    }

    const all: CasePair[] = [visible[0], visible[1], ...hidden];

    return all.map((tc, order) => ({
        input: jsonIn(tc.input),
        expectedOutput: jsonOut(tc.output),
        explanation: order < 2 ? tc.explanation : hiddenExplanations?.[order - 2],
        isHidden: order >= 2,
        order,
    }));
}
