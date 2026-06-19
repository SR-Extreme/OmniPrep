import type { Example } from "../../types/dsa.types.js";
import { formatExampleDisplay } from "./exampleFormat.js";

function looksLikeJsonObject(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith("{") && trimmed.endsWith("}");
}

/** Convert legacy JSON examples to readable display text. */
export function normalizeExamplesForDisplay(examples: Example[]): Example[] {
    return examples.map((example) => {
        if (!looksLikeJsonObject(example.input)) {
            return example;
        }

        try {
            const formatted = formatExampleDisplay(example.input, example.output);
            return {
                ...example,
                input: formatted.input,
                output: formatted.output,
            };
        } catch {
            return example;
        }
    });
}
