export type ValueType =
    | "int"
    | "int[]"
    | "int[][]"
    | "string"
    | "string[]"
    | "string[][]"
    | "boolean";

//This describes one function parameter
export interface ParamSpec {
    name: string;
    type: ValueType;
    jsonKey: string;
}

//This describes an entire coding problem
export interface ProblemSignature {
    slug: string;
    methodName: string;
    params: ParamSpec[];
    returnType: ValueType;
}
