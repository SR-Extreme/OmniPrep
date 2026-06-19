export type SeedDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface SeedExample {
    input: string;
    output: string;
    explanation?: string;
}

export interface SeedStarterCode {
    cpp: string;
    java: string;
    python: string;
}

export interface SeedSolutionCode {
    cpp?: string;
    java?: string;
    python?: string;
}

export interface SeedTestCase {
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden: boolean;
    order: number;
}

export interface ProblemSeedFile {
    slug: string;
    title: string;
    description: string;
    inputFormat: string;
    outputFormat: string;
    constraints: string;
    examples: SeedExample[];
    difficulty: SeedDifficulty;
    topics: string[];
    timeLimitMs: number;
    memoryLimitKb: number;
    starterCode: SeedStarterCode;
    solutionCode: SeedSolutionCode;
    hints: string[];
    isPublished: boolean;
    testCases: SeedTestCase[];
}

/** @deprecated Test cases still use JSON stdin; users see readable examples only. */
export const SEED_IO_NOTE =
    "Implement the function below. Input/output follows the examples.";

export const PYTHON_STARTER = `import json
import sys

def solve(data):
    # Write your solution here
    raise NotImplementedError

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    result = solve(data)
    print(json.dumps(result, separators=(",", ":")))
`;

export const JAVA_STARTER = `import java.io.*;
import java.util.*;
import com.google.gson.*;

public class Main {
    static Object solve(JsonObject data) {
        // Write your solution here
        throw new UnsupportedOperationException();
    }

    public static void main(String[] args) throws Exception {
        JsonObject data = JsonParser.parseString(new String(System.in.readAllBytes())).getAsJsonObject();
        Object result = solve(data);
        System.out.println(new Gson().toJson(result));
    }
}
`;

export const CPP_STARTER = `#include <iostream>
#include <string>
#include "json.hpp"
using json = nlohmann::json;

json solve(const json& data) {
    // Write your solution here
    throw std::runtime_error("Not implemented");
}

int main() {
    json data;
    std::cin >> data;
    json result = solve(data);
    std::cout << result.dump();
    return 0;
}
`;

export function defaultStarterCode(): SeedStarterCode {
    return {
        python: PYTHON_STARTER,
        java: JAVA_STARTER,
        cpp: CPP_STARTER,
    };
}

export function jsonIn(value: unknown): string {
    return JSON.stringify(value);
}

export function jsonOut(value: unknown): string {
    return JSON.stringify(value);
}
