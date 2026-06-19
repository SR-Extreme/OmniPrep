function formatExampleValue(value: unknown): string {
    if (typeof value === "string") {
        return `"${value}"`;
    }
    return JSON.stringify(value);
}

/** Convert JSON test I/O into readable example text (e.g. nums = [1,2], target = 3). */
export function formatExampleDisplay(
    inputJson: string,
    outputJson: string,
): { input: string; output: string } {
    const data = JSON.parse(inputJson) as Record<string, unknown>;
    const output = JSON.parse(outputJson) as unknown;

    const inputLines = Object.entries(data).map(
        ([key, value]) => `${key} = ${formatExampleValue(value)}`,
    );

    return {
        input: inputLines.join("\n"),
        output: formatExampleValue(output),
    };
}

/** Format raw JSON object examples (seed visible cases). */
export function formatExampleDisplayFromObjects(
    input: unknown,
    output: unknown,
): { input: string; output: string } {
    return formatExampleDisplay(JSON.stringify(input), JSON.stringify(output));
}
