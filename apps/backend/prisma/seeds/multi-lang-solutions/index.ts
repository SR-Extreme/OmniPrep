import type { MultiLangSolutionMap } from "../solution-wrappers.js";
import { BATCH_01 } from "./batch-01.js";
import { BATCH_02 } from "./batch-02.js";
import { BATCH_03 } from "./batch-03.js";
import { BATCH_04 } from "./batch-04.js";

export const MULTI_LANG_SOLUTIONS: MultiLangSolutionMap = {
    ...BATCH_01,
    ...BATCH_02,
    ...BATCH_03,
    ...BATCH_04,
};
