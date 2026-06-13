/** Wrap Java solve() body with Gson JSON stdin/stdout (matches starter template). */
export function javaSolution(solveBody: string): string {
    return `import java.io.*;
import java.util.*;
import com.google.gson.*;

public class Main {
    static Object solve(JsonObject data) {
${indent(solveBody, 8)}
    }

    public static void main(String[] args) throws Exception {
        JsonObject data = JsonParser.parseString(new String(System.in.readAllBytes())).getAsJsonObject();
        Object result = solve(data);
        System.out.println(new Gson().toJson(result));
    }
}
`;
}

/** Wrap C++ solve() body with nlohmann/json (matches starter template). */
export function cppSolution(solveBody: string): string {
    return `#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <algorithm>
#include <climits>
#include "json.hpp"
using json = nlohmann::json;

json solve(const json& data) {
${indent(solveBody, 4)}
}

int main() {
    json data;
    std::cin >> data;
    json result = solve(data);
    std::cout << result.dump();
    return 0;
}
`;
}

function indent(code: string, spaces: number): string {
    const pad = " ".repeat(spaces);
    return code
        .trim()
        .split("\n")
        .map((line) => `${pad}${line}`)
        .join("\n");
}

export interface MultiLangSolution {
    java: string;
    cpp: string;
}

export type MultiLangSolutionMap = Record<string, MultiLangSolution>;
