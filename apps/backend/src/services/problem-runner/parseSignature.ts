import { methodNameForSlug } from "./methodNames.js";
import type { ParamSpec, ProblemSignature, ValueType } from "./types.js";

/** Collapse whitespace so equivalent formats match regardless of spacing. */
function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}

/** Split on a separator only at top level (not inside brackets, parens, or quotes). */
function splitTopLevel(value: string, separator: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let inQuotes = false;
    let current = "";

    for (let i = 0; i < value.length; i++) {
        const ch = value[i];

        if (ch === '"' && value[i - 1] !== "\\") {
            inQuotes = !inQuotes;
            current += ch;
            continue;
        }

        if (!inQuotes) {
            if (ch === "(" || ch === "[" || ch === "{") depth++;
            else if (ch === ")" || ch === "]" || ch === "}") depth--;
            else if (ch === separator && depth === 0) {
                const trimmed = current.trim();
                if (trimmed) parts.push(trimmed);
                current = "";
                continue;
            }
        }

        current += ch;
    }

    const trimmed = current.trim();
    if (trimmed) parts.push(trimmed);
    return parts;
}

/** Compact a type string for pattern matching (e.g. "(number | null)[]" -> "(number|null)[]"). */
function compactType(typeStr: string): string {
    return typeStr.replace(/\s+/g, "");
}

function parseType(typeStr: string): ValueType {
    const normalized = normalizeWhitespace(typeStr);
    const compact = compactType(normalized);
    const lower = normalized.toLowerCase();

    // String-literal union arrays: ("book")[], ("put"|"get")[]
    if (/^\([^)]+\)\[\]$/.test(compact) && compact.includes('"')) {
        return "string[]";
    }

    // Nullable numeric arrays used for trees/lists: (number|null)[]
    if (/^\(number(\|null)+\)\[\]$/.test(compact)) {
        return "int[]";
    }

    // Tuple-array shapes used in design-problem args
    if (/^\[number,number\]\[\]$/.test(compact)) return "int[][]";
    if (/^\[string\[\]\]$/.test(compact)) return "string[][]";

    // Standard scalar and array primitives
    if (lower === "number[][]") return "int[][]";
    if (lower === "number[]") return "int[]";
    if (lower === "string[][]") return "string[][]";
    if (lower === "string[]") return "string[]";
    if (lower === "number") return "int";
    if (lower === "string") return "string";
    if (lower === "boolean") return "boolean";

    // Mixed-type JSON payloads (e.g. stack/queue design problems)
    if (lower === "unknown[][]") return "string[][]";
    if (lower === "unknown[]") return "string[]";

    throw new Error(`Unsupported type: ${typeStr}`);
}

function parseInputFormat(inputFormat: string): ParamSpec[] {
    const normalized = normalizeWhitespace(inputFormat);
    if (!normalized.startsWith("{") || !normalized.endsWith("}")) {
        throw new Error(`inputFormat must be an object type, got: ${inputFormat}`);
    }

    const inner = normalized.slice(1, -1).trim();
    if (!inner) return [];

    return splitTopLevel(inner, ",").map((pair) => {
        const colonIdx = pair.indexOf(":");
        if (colonIdx === -1) {
            throw new Error(`Invalid parameter declaration: ${pair}`);
        }

        const name = pair.slice(0, colonIdx).trim();
        const typeStr = pair.slice(colonIdx + 1).trim();
        if (!name) {
            throw new Error(`Missing parameter name in: ${pair}`);
        }

        return {
            name,
            type: parseType(typeStr),
            jsonKey: name,
        };
    });
}

function parseReturnType(outputFormat: string): ValueType {
    const fmt = outputFormat.toLowerCase();

    if (fmt.startsWith("boolean")) return "boolean";
    if (fmt.includes("number[][]")) return "int[][]";
    if (fmt.includes("number[2]") || fmt.includes("number[]")) return "int[]";
    if (fmt.startsWith("number")) return "int";
    if (fmt.startsWith("string[][]")) return "string[][]";
    if (fmt.startsWith("string[]")) return "string[]";
    if (fmt.startsWith("string")) return "string";
    if (fmt.includes("unknown[]")) return "int[]";

    return "int";
}

export function buildProblemSignature(
    slug: string,
    inputFormat: string,
    outputFormat: string,
): ProblemSignature {
    return {
        slug,
        methodName: methodNameForSlug(slug),
        params: parseInputFormat(inputFormat),
        returnType: parseReturnType(outputFormat),
    };
}
