import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ProgrammingLanguage } from "../../types/dsa.types.js";
import type { ParamSpec, ProblemSignature, ValueType } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JAVA_MINI_JSON = readFileSync(join(__dirname, "harness", "MiniJson.java"), "utf8");

function pythonArg(param: ParamSpec): string {
    return `_data["${param.jsonKey}"]`;
}

function javaExtract(param: ParamSpec): string {
    switch (param.type) {
        case "int":
            return `MiniJson.getInt(_data, "${param.jsonKey}")`;
        case "int[]":
            return `MiniJson.getIntArray(_data, "${param.jsonKey}")`;
        case "int[][]":
            return `MiniJson.getIntMatrix(_data, "${param.jsonKey}")`;
        case "string":
            return `MiniJson.getString(_data, "${param.jsonKey}")`;
        case "string[]":
            return `MiniJson.getStringArray(_data, "${param.jsonKey}")`;
        case "string[][]":
            return `MiniJson.getStringMatrix(_data, "${param.jsonKey}")`;
        case "boolean":
            return `MiniJson.getBoolean(_data, "${param.jsonKey}")`;
    }
}

function cppExtract(param: ParamSpec): string {
    switch (param.type) {
        case "int":
            return `_data["${param.jsonKey}"].get<int>()`;
        case "int[]":
            return `_data["${param.jsonKey}"].get<std::vector<int>>()`;
        case "int[][]":
            return `_data["${param.jsonKey}"].get<std::vector<std::vector<int>>>()`;
        case "string":
            return `_data["${param.jsonKey}"].get<std::string>()`;
        case "string[]":
            return `_data["${param.jsonKey}"].get<std::vector<std::string>>()`;
        case "string[][]":
            return `_data["${param.jsonKey}"].get<std::vector<std::vector<std::string>>>()`;
        case "boolean":
            return `_data["${param.jsonKey}"].get<bool>()`;
    }
}

function javaSerialize(returnType: ValueType): string {
    void returnType;
    return "MiniJson.toJson(result)";
}

function wrapPython(userCode: string, sig: ProblemSignature): string {
    const args = sig.params.map(pythonArg).join(", ");
    // Judge0 uses Python 3.8; defer annotation evaluation so list[int] hints work.
    return `from __future__ import annotations

${userCode.trim()}

if __name__ == "__main__":
    import json
    import sys
    _data = json.loads(sys.stdin.read() or "{}")
    _result = Solution().${sig.methodName}(${args})
    print(json.dumps(_result, separators=(",", ":")))
`;
}

function wrapJava(userCode: string, sig: ProblemSignature): string {
    const args = sig.params.map(javaExtract).join(", ");
    const serialize = javaSerialize(sig.returnType);
    return `${JAVA_MINI_JSON}

${userCode.trim()}

class Main {
    public static void main(String[] args) throws Exception {
        String raw = new String(System.in.readAllBytes()).trim();
        Object _data = MiniJson.parse(raw);
        Solution _sol = new Solution();
        Object result = _sol.${sig.methodName}(${args});
        System.out.println(${serialize});
    }
}
`;
}

function wrapCpp(userCode: string, sig: ProblemSignature): string {
    const args = sig.params.map(cppExtract).join(", ");
    return `#include <bits/stdc++.h>
#include "json.hpp"
using json = nlohmann::json;
using namespace std;

${userCode.trim()}

int main() {
    json _data;
    std::cin >> _data;
    Solution _sol;
    auto result = _sol.${sig.methodName}(${args});
    json out = result;
    std::cout << out.dump();
    return 0;
}
`;
}

export interface WrappedSubmissionCode {
    sourceCode: string;
    /** Base64-encoded zip with json.hpp for C++ submissions. */
    additionalFiles?: string;
}

function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

/** Minimal zip (store) for Judge0 additional_files. */
function createJsonHppZip(): string {
    const jsonHpp = readFileSync(
        join(__dirname, "..", "..", "..", "assets", "json.hpp"),
        "utf8",
    );
    const filename = "json.hpp";
    const content = Buffer.from(jsonHpp, "utf8");
    const crc = crc32(content);

    const localHeader = Buffer.alloc(30 + filename.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt32LE(filename.length, 26);
    localHeader.write(filename, 30);

    const centralHeader = Buffer.alloc(46 + filename.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt32LE(filename.length, 28);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(0, 42);
    centralHeader.write(filename, 46);

    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(centralHeader.length, 12);
    end.writeUInt32LE(localHeader.length + content.length, 16);
    end.writeUInt16LE(0, 20);

    return Buffer.concat([localHeader, content, centralHeader, end]).toString("base64");
}

let cachedJsonHppZip: string | null = null;

export function getJsonHppZipBase64(): string {
    if (cachedJsonHppZip == null) {
        cachedJsonHppZip = createJsonHppZip();
    }
    return cachedJsonHppZip;
}

export function wrapSubmissionCode(
    userCode: string,
    language: ProgrammingLanguage,
    sig: ProblemSignature,
): WrappedSubmissionCode {
    switch (language) {
        case "PYTHON":
            return { sourceCode: wrapPython(userCode, sig) };
        case "JAVA":
            return { sourceCode: wrapJava(userCode, sig) };
        case "CPP":
            return {
                sourceCode: wrapCpp(userCode, sig),
                additionalFiles: getJsonHppZipBase64(),
            };
    }
}
