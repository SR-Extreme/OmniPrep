import type { ProblemSpec } from "./types.js";

export const BATCH_02_SPECS: ProblemSpec[] = [
    {
        num: 26,
        slug: "pascals-triangle",
        title: "Pascal's Triangle",
        difficulty: "EASY",
        topics: [
            "dynamic-programming",
            "arrays",
        ],
        inputFormat: "{ numRows: number }",
        outputFormat: "number[][]",
        constraints: "1 <= numRows <= 30",
        hints: [
            "Each interior cell is the sum of two cells above.",
            "Build row by row from the previous row.",
        ],
        visibleCases: [
            {
                input: { numRows: 5 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]],
                explanation: "Row 5 is [1,4,6,4,1].",
            },
            {
                input: { numRows: 1 },
                output: [[1]],
                explanation: "Single row is [1].",
            }
        ],
        hiddenCases: [
            {
                input: { numRows: 3 },
                output: [[1], [1, 1], [1, 2, 1]],
            },
            {
                input: { numRows: 4 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]],
            },
            {
                input: { numRows: 6 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1]],
            },
            {
                input: { numRows: 7 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1]],
            },
            {
                input: { numRows: 2 },
                output: [[1], [1, 1]],
            },
            {
                input: { numRows: 8 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1], [1, 7, 21, 35, 35, 21, 7, 1]],
            },
            {
                input: { numRows: 10 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1], [1, 7, 21, 35, 35, 21, 7, 1], [1, 8, 28, 56, 70, 56, 28, 8, 1], [1, 9, 36, 84, 126, 126, 84, 36, 9, 1]],
            },
            {
                input: { numRows: 12 },
                output: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1], [1, 7, 21, 35, 35, 21, 7, 1], [1, 8, 28, 56, 70, 56, 28, 8, 1], [1, 9, 36, 84, 126, 126, 84, 36, 9, 1], [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1], [1, 11, 55, 165, 330, 462, 462, 330, 165, 55, 11, 1]],
            }
        ],
    },
    {
        num: 27,
        slug: "flood-fill",
        title: "Flood Fill",
        difficulty: "EASY",
        topics: [
            "graphs",
            "dfs",
            "bfs",
        ],
        inputFormat: "{ image: number[][], sr: number, sc: number, color: number }",
        outputFormat: "number[][]",
        constraints: "1 <= m,n <= 50; 0 <= image[i][j], color <= 65535",
        hints: [
            "DFS or BFS from the starting pixel.",
            "Only flood pixels matching the original color.",
        ],
        visibleCases: [
            {
                input: {
                image: [[1, 1, 1], [1, 1, 0], [1, 0, 1]],
                sr: 1,
                sc: 1,
                color: 2
            },
                output: [[2, 2, 2], [2, 2, 0], [2, 0, 1]],
                explanation: "Connected region of 1s becomes 2.",
            },
            {
                input: {
                image: [[0, 0, 0], [0, 0, 0]],
                sr: 0,
                sc: 0,
                color: 0
            },
                output: [[0, 0, 0], [0, 0, 0]],
                explanation: "Already uniform color stays unchanged.",
            }
        ],
        hiddenCases: [
            {
                input: {
                image: [[2, 2, 2], [2, 1, 2], [2, 2, 2]],
                sr: 1,
                sc: 1,
                color: 3
            },
                output: [[2, 2, 2], [2, 3, 2], [2, 2, 2]],
            },
            {
                input: {
                image: [[0]],
                sr: 0,
                sc: 0,
                color: 1
            },
                output: [[1]],
            },
            {
                input: {
                image: [[1, 0], [0, 1]],
                sr: 0,
                sc: 0,
                color: 2
            },
                output: [[2, 0], [0, 1]],
            },
            {
                input: {
                image: [[5, 5], [5, 5]],
                sr: 0,
                sc: 1,
                color: 5
            },
                output: [[5, 5], [5, 5]],
            },
            {
                input: {
                image: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                sr: 2,
                sc: 2,
                color: 9
            },
                output: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
            },
            {
                input: {
                image: [[3, 3, 3, 3], [3, 2, 2, 3], [3, 2, 2, 3], [3, 3, 3, 3]],
                sr: 1,
                sc: 1,
                color: 4
            },
                output: [[3, 3, 3, 3], [3, 4, 4, 3], [3, 4, 4, 3], [3, 3, 3, 3]],
            },
            {
                input: {
                image: [[1, 1], [1, 0]],
                sr: 0,
                sc: 0,
                color: 2
            },
                output: [[2, 2], [2, 0]],
            },
            {
                input: {
                image: [[7, 7, 7], [7, 7, 0], [7, 0, 7]],
                sr: 0,
                sc: 0,
                color: 8
            },
                output: [[8, 8, 8], [8, 8, 0], [8, 0, 7]],
            }
        ],
    },
    {
        num: 28,
        slug: "same-tree",
        title: "Same Tree",
        difficulty: "EASY",
        topics: [
            "trees",
            "dfs",
        ],
        inputFormat: "{ p: (number|null)[], q: (number|null)[] }",
        outputFormat: "boolean",
        constraints: "0 <= nodes <= 100; -10^4 <= val <= 10^4",
        hints: [
            "Recursively compare node values and subtrees.",
            "Two null nodes are equal.",
        ],
        visibleCases: [
            {
                input: {
                p: [1, 2, 3],
                q: [1, 2, 3]
            },
                output: true,
                explanation: "Identical structure and values.",
            },
            {
                input: {
                p: [1, 2],
                q: [1, null, 2]
            },
                output: false,
                explanation: "Different structure.",
            }
        ],
        hiddenCases: [
            {
                input: {
                p: [],
                q: []
            },
                output: true,
            },
            {
                input: {
                p: [1],
                q: [1]
            },
                output: true,
            },
            {
                input: {
                p: [1],
                q: [2]
            },
                output: false,
            },
            {
                input: {
                p: [1, null, 2],
                q: [1, null, 2]
            },
                output: true,
            },
            {
                input: {
                p: [1, 2, null, 3],
                q: [1, 2, null, 3]
            },
                output: true,
            },
            {
                input: {
                p: [1, 2, 1],
                q: [1, 1, 2]
            },
                output: false,
            },
            {
                input: {
                p: [null, 1],
                q: [1]
            },
                output: false,
            },
            {
                input: {
                p: [1, 2, 3, 4, 5],
                q: [1, 2, 3, 4, 5]
            },
                output: true,
            }
        ],
    },
    {
        num: 29,
        slug: "symmetric-tree",
        title: "Symmetric Tree",
        difficulty: "EASY",
        topics: [
            "trees",
            "dfs",
        ],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "boolean",
        constraints: "0 <= nodes <= 1000; -10^4 <= val <= 10^4",
        hints: [
            "Compare left and right subtrees as mirrors.",
            "Outer pairs and inner pairs must match.",
        ],
        visibleCases: [
            {
                input: { root: [1, 2, 2, 3, 4, 4, 3] },
                output: true,
                explanation: "Mirror subtrees match.",
            },
            {
                input: { root: [1, 2, 2, null, 3, null, 3] },
                output: false,
                explanation: "Not symmetric.",
            }
        ],
        hiddenCases: [
            {
                input: { root: [] },
                output: true,
            },
            {
                input: { root: [1] },
                output: true,
            },
            {
                input: { root: [1, 2, 2] },
                output: true,
            },
            {
                input: { root: [1, 2, 3, 2, 2] },
                output: false,
            },
            {
                input: { root: [1, 2, 2, 2, null, null, 2] },
                output: true,
            },
            {
                input: { root: [1, null, 2] },
                output: false,
            },
            {
                input: { root: [5, 3, 3, null, 4, 4, null] },
                output: true,
            },
            {
                input: { root: [1, 2, 2, 3, 3, 3, 3] },
                output: true,
            }
        ],
    },
    {
        num: 30,
        slug: "maximum-depth-of-binary-tree",
        title: "Maximum Depth of Binary Tree",
        difficulty: "EASY",
        topics: [
            "trees",
            "dfs",
        ],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "number",
        constraints: "0 <= nodes <= 10^4; -100 <= val <= 100",
        hints: [
            "Depth is 1 plus max of child depths.",
            "Empty tree has depth 0.",
        ],
        visibleCases: [
            {
                input: { root: [3, 9, 20, null, null, 15, 7] },
                output: 3,
                explanation: "Longest path has 3 nodes.",
            },
            {
                input: { root: [1, null, 2] },
                output: 2,
                explanation: "Skewed tree depth 2.",
            }
        ],
        hiddenCases: [
            {
                input: { root: [] },
                output: 0,
            },
            {
                input: { root: [0] },
                output: 1,
            },
            {
                input: { root: [1, 2, 3, 4, 5] },
                output: 3,
            },
            {
                input: { root: [1, 2, 3, 4, null, null, 5] },
                output: 3,
            },
            {
                input: { root: [1, 2, null, 3, null, 4] },
                output: 3,
            },
            {
                input: { root: [1, null, 2, null, 3] },
                output: 2,
            },
            {
                input: { root: [1, 2, 3] },
                output: 2,
            },
            {
                input: { root: [1, 2, null, 3, 4] },
                output: 3,
            }
        ],
    },
    {
        num: 31,
        slug: "diameter-of-binary-tree",
        title: "Diameter of Binary Tree",
        difficulty: "EASY",
        topics: [
            "trees",
            "dfs",
        ],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "number",
        constraints: "1 <= nodes <= 10^4; -100 <= val <= 100",
        hints: [
            "Track max left+right depth at each node.",
            "Path length is counted in edges.",
        ],
        visibleCases: [
            {
                input: { root: [1, 2, 3, 4, 5] },
                output: 3,
                explanation: "Diameter path uses 3 edges.",
            },
            {
                input: { root: [1, 2] },
                output: 1,
                explanation: "Two nodes give diameter 1.",
            }
        ],
        hiddenCases: [
            {
                input: { root: [1] },
                output: 0,
            },
            {
                input: { root: [1, 2, 3, 4, 5, null, 6] },
                output: 4,
            },
            {
                input: { root: [1, null, 2, null, 3] },
                output: 1,
            },
            {
                input: { root: [1, 2, 3, null, 4] },
                output: 3,
            },
            {
                input: { root: [1, 2, null, 3, 4, 5] },
                output: 2,
            },
            {
                input: { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1] },
                output: 6,
            },
            {
                input: { root: [1, 2, 3, 4] },
                output: 3,
            },
            {
                input: { root: [2, 3, 4, 5] },
                output: 3,
            }
        ],
    },
    {
        num: 32,
        slug: "linked-list-cycle",
        title: "Linked List Cycle",
        difficulty: "EASY",
        topics: [
            "linked-list",
            "two-pointers",
        ],
        inputFormat: "{ head: number[], pos: number }",
        outputFormat: "boolean",
        constraints: "0 <= head.length <= 10^4; pos is -1 or a valid index",
        hints: [
            "Use Floyd's tortoise and hare.",
            "pos = -1 means no cycle.",
        ],
        visibleCases: [
            {
                input: {
                head: [3, 2, 0, -4],
                pos: 1
            },
                output: true,
                explanation: "Tail connects to node index 1.",
            },
            {
                input: {
                head: [1],
                pos: -1
            },
                output: false,
                explanation: "Single node without cycle.",
            }
        ],
        hiddenCases: [
            {
                input: {
                head: [1, 2],
                pos: 0
            },
                output: true,
            },
            {
                input: {
                head: [],
                pos: -1
            },
                output: false,
            },
            {
                input: {
                head: [1, 2, 3, 4, 5],
                pos: -1
            },
                output: false,
            },
            {
                input: {
                head: [1, 2, 3, 4, 5],
                pos: 2
            },
                output: true,
            },
            {
                input: {
                head: [1, 2],
                pos: -1
            },
                output: false,
            },
            {
                input: {
                head: [1, 1, 1],
                pos: 0
            },
                output: true,
            },
            {
                input: {
                head: [5, 4, 3, 2, 1],
                pos: 4
            },
                output: true,
            },
            {
                input: {
                head: [1, 2, 3],
                pos: -1
            },
                output: false,
            }
        ],
    },
    {
        num: 33,
        slug: "palindrome-linked-list",
        title: "Palindrome Linked List",
        difficulty: "EASY",
        topics: [
            "linked-list",
            "two-pointers",
        ],
        inputFormat: "{ head: number[] }",
        outputFormat: "boolean",
        constraints: "0 <= head.length <= 10^5; 0 <= val <= 9",
        hints: [
            "Compare values from both ends.",
            "Or reverse the second half in-place.",
        ],
        visibleCases: [
            {
                input: { head: [1, 2, 2, 1] },
                output: true,
                explanation: "Reads same forward and backward.",
            },
            {
                input: { head: [1, 2] },
                output: false,
                explanation: "Not a palindrome.",
            }
        ],
        hiddenCases: [
            {
                input: { head: [1] },
                output: true,
            },
            {
                input: { head: [] },
                output: true,
            },
            {
                input: { head: [1, 2, 3, 2, 1] },
                output: true,
            },
            {
                input: { head: [1, 1] },
                output: true,
            },
            {
                input: { head: [1, 2, 3] },
                output: false,
            },
            {
                input: { head: [1, 2, 2, 2, 1] },
                output: true,
            },
            {
                input: { head: [9, 9, 9, 9] },
                output: true,
            },
            {
                input: { head: [1, 0, 1] },
                output: true,
            }
        ],
    },
    {
        num: 34,
        slug: "min-stack",
        title: "Min Stack",
        difficulty: "MEDIUM",
        topics: [
            "stack",
            "design",
        ],
        inputFormat: "{ ops: string[], args: unknown[][] }",
        outputFormat: "unknown[]",
        constraints: "Up to 3*10^4 ops; -2^31 <= val <= 2^31-1",
        hints: [
            "Track current minimum alongside each push.",
            "Pop both stacks together.",
        ],
        visibleCases: [
            {
                input: {
                ops: ["push", "push", "push", "getMin", "pop", "top", "getMin"],
                args: [[-2], [0], [-3], [], [], [], []]
            },
                output: [null, null, null, -3, null, 0, -2],
                explanation: "getMin stays O(1).",
            },
            {
                input: {
                ops: ["push", "top", "getMin"],
                args: [[1], [], []]
            },
                output: [null, 1, 1],
                explanation: "Single element stack.",
            }
        ],
        hiddenCases: [
            {
                input: {
                ops: ["push", "push", "pop", "getMin"],
                args: [[2], [1], [], []]
            },
                output: [null, null, null, 2],
            },
            {
                input: {
                ops: ["push", "push", "push", "top", "pop", "top", "getMin"],
                args: [[5], [3], [7], [], [], [], []]
            },
                output: [null, null, null, 7, null, 3, 3],
            },
            {
                input: {
                ops: ["push", "pop", "push", "getMin"],
                args: [[0], [], [0], []]
            },
                output: [null, null, null, 0],
            },
            {
                input: {
                ops: ["push", "push", "getMin", "pop", "getMin"],
                args: [[2], [1], [], [], []]
            },
                output: [null, null, 1, null, 2],
            },
            {
                input: {
                ops: ["push", "push", "push", "pop", "pop", "top", "getMin"],
                args: [[1], [2], [3], [], [], [], []]
            },
                output: [null, null, null, null, null, 1, 1],
            },
            {
                input: {
                ops: ["push", "push", "pop", "pop", "push", "top"],
                args: [[10], [20], [], [], [30], []]
            },
                output: [null, null, null, null, null, 30],
            },
            {
                input: {
                ops: ["push", "getMin", "push", "getMin"],
                args: [[5], [], [3], []]
            },
                output: [null, 5, null, 3],
            },
            {
                input: {
                ops: ["push", "push", "push", "getMin", "pop", "getMin"],
                args: [[1], [2], [3], [], [], []]
            },
                output: [null, null, null, 1, null, 1],
            }
        ],
    },
    {
        num: 35,
        slug: "implement-queue-using-stacks",
        title: "Implement Queue using Stacks",
        difficulty: "EASY",
        topics: [
            "stack",
            "queue",
            "design",
        ],
        inputFormat: "{ ops: string[], args: unknown[][] }",
        outputFormat: "unknown[]",
        constraints: "1 <= ops.length <= 100; push/pop/peek on non-empty queue",
        hints: [
            "Use an input stack and output stack.",
            "Pour input into output when output is empty.",
        ],
        visibleCases: [
            {
                input: {
                ops: ["push", "push", "peek", "pop", "empty"],
                args: [[1], [2], [], [], []]
            },
                output: [null, null, 1, 1, false],
                explanation: "FIFO order preserved.",
            },
            {
                input: {
                ops: ["push", "pop", "push", "peek", "pop", "empty"],
                args: [[1], [], [2], [], [], []]
            },
                output: [null, 1, null, 2, 2, true],
                explanation: "Queue empty after pops.",
            }
        ],
        hiddenCases: [
            {
                input: {
                ops: ["empty"],
                args: [[]]
            },
                output: [true],
            },
            {
                input: {
                ops: ["push", "push", "push", "pop", "pop", "pop", "empty"],
                args: [[1], [2], [3], [], [], [], []]
            },
                output: [null, null, null, 1, 2, 3, true],
            },
            {
                input: {
                ops: ["push", "peek", "pop", "push", "peek"],
                args: [[5], [], [], [2], []]
            },
                output: [null, 5, 5, null, 2],
            },
            {
                input: {
                ops: ["push", "push", "pop", "push", "pop", "pop"],
                args: [[1], [2], [], [3], [], []]
            },
                output: [null, null, 1, null, 2, 3],
            },
            {
                input: {
                ops: ["push", "push", "peek", "peek", "pop", "pop", "empty"],
                args: [[4], [5], [], [], [], [], []]
            },
                output: [null, null, 4, 4, 4, 5, true],
            },
            {
                input: {
                ops: ["push", "pop", "empty", "push", "peek"],
                args: [[9], [], [], [1], []]
            },
                output: [null, 9, true, null, 1],
            },
            {
                input: {
                ops: ["push", "push", "push", "pop", "peek", "pop"],
                args: [[1], [2], [3], [], [], []]
            },
                output: [null, null, null, 1, 2, 2],
            },
            {
                input: {
                ops: ["push", "push", "pop", "peek"],
                args: [[1], [2], [], []]
            },
                output: [null, null, 1, 2],
            }
        ],
    },
    {
        num: 36,
        slug: "3sum",
        title: "3Sum",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "two-pointers",
            "sorting",
        ],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[][]",
        constraints: "3 <= nums.length <= 3000; -10^5 <= nums[i] <= 10^5",
        hints: [
            "Sort the array first.",
            "Skip duplicate values for i, l, and r.",
        ],
        visibleCases: [
            {
                input: { nums: [-1, 0, 1, 2, -1, -4] },
                output: [[-1, -1, 2], [-1, 0, 1]],
                explanation: "Triplets sum to zero.",
            },
            {
                input: { nums: [0, 1, 1] },
                output: [],
                explanation: "No valid triplet.",
            }
        ],
        hiddenCases: [
            {
                input: { nums: [0, 0, 0] },
                output: [[0, 0, 0]],
            },
            {
                input: { nums: [-2, 0, 1, 1, 2] },
                output: [[-2, 0, 2], [-2, 1, 1]],
            },
            {
                input: { nums: [-1, -1, 2] },
                output: [[-1, -1, 2]],
            },
            {
                input: { nums: [1, 2, -2, -1] },
                output: [],
            },
            {
                input: { nums: [-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6] },
                output: [[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]],
            },
            {
                input: { nums: [3, 0, -2, -1, 1, 2] },
                output: [[-2, -1, 3], [-2, 0, 2], [-1, 0, 1]],
            },
            {
                input: { nums: [-1, 0, 1] },
                output: [[-1, 0, 1]],
            },
            {
                input: { nums: [1, -1, -1, 0] },
                output: [[-1, 0, 1]],
            }
        ],
    },
    {
        num: 37,
        slug: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "MEDIUM",
        topics: [
            "strings",
            "sliding-window",
            "hash-table",
        ],
        inputFormat: "{ s: string }",
        outputFormat: "number",
        constraints: "0 <= s.length <= 5*10^4; s consists of English letters, digits, symbols",
        hints: [
            "Use a sliding window.",
            "Jump left past the previous index of a duplicate.",
        ],
        visibleCases: [
            {
                input: { s: "abcabcbb" },
                output: 3,
                explanation: "Longest is abc with length 3.",
            },
            {
                input: { s: "bbbbb" },
                output: 1,
                explanation: "All same character.",
            }
        ],
        hiddenCases: [
            {
                input: { s: "pwwkew" },
                output: 3,
            },
            {
                input: { s: "" },
                output: 0,
            },
            {
                input: { s: " " },
                output: 1,
            },
            {
                input: { s: "au" },
                output: 2,
            },
            {
                input: { s: "dvdf" },
                output: 3,
            },
            {
                input: { s: "tmmzuxt" },
                output: 5,
            },
            {
                input: { s: "abba" },
                output: 2,
            },
            {
                input: { s: "abcdef" },
                output: 6,
            }
        ],
    },
    {
        num: 38,
        slug: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "two-pointers",
        ],
        inputFormat: "{ height: number[] }",
        outputFormat: "number",
        constraints: "2 <= height.length <= 10^5; 0 <= height[i] <= 10^4",
        hints: [
            "Two pointers at both ends.",
            "Move the shorter line inward.",
        ],
        visibleCases: [
            {
                input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
                output: 49,
                explanation: "Max area is 49.",
            },
            {
                input: { height: [1, 1] },
                output: 1,
                explanation: "Minimum two lines.",
            }
        ],
        hiddenCases: [
            {
                input: { height: [4, 3, 2, 1, 4] },
                output: 16,
            },
            {
                input: { height: [1, 2, 1] },
                output: 2,
            },
            {
                input: { height: [2, 3, 4, 5, 18, 17, 6] },
                output: 17,
            },
            {
                input: { height: [1, 3, 2, 5, 25, 24, 5] },
                output: 24,
            },
            {
                input: { height: [5, 5, 5, 5] },
                output: 15,
            },
            {
                input: { height: [1, 2, 4, 3] },
                output: 4,
            },
            {
                input: { height: [2, 3, 10, 5, 7, 8, 9] },
                output: 36,
            },
            {
                input: { height: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
                output: 25,
            }
        ],
    },
    {
        num: 39,
        slug: "number-of-islands",
        title: "Number of Islands",
        difficulty: "MEDIUM",
        topics: [
            "graphs",
            "dfs",
            "bfs",
        ],
        inputFormat: "{ grid: string[][] }",
        outputFormat: "number",
        constraints: "1 <= m,n <= 300; grid[i][j] is '0' or '1'",
        hints: [
            "DFS or BFS from each unvisited land cell.",
            "Mark visited cells.",
        ],
        visibleCases: [
            {
                input: { grid: [["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]] },
                output: 1,
                explanation: "One connected island.",
            },
            {
                input: { grid: [["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]] },
                output: 3,
                explanation: "Three islands.",
            }
        ],
        hiddenCases: [
            {
                input: { grid: [] },
                output: 0,
            },
            {
                input: { grid: [["0"]] },
                output: 0,
            },
            {
                input: { grid: [["1"]] },
                output: 1,
            },
            {
                input: { grid: [["1", "0", "1", "0", "1"]] },
                output: 3,
            },
            {
                input: { grid: [["1", "1"], ["1", "1"]] },
                output: 1,
            },
            {
                input: { grid: [["1", "0"], ["0", "1"]] },
                output: 2,
            },
            {
                input: { grid: [["0", "0"], ["0", "0"]] },
                output: 0,
            },
            {
                input: { grid: [["1", "1", "0"], ["0", "1", "0"], ["1", "0", "1"]] },
                output: 3,
            }
        ],
    },
    {
        num: 40,
        slug: "coin-change",
        title: "Coin Change",
        difficulty: "MEDIUM",
        topics: [
            "dynamic-programming",
            "arrays",
        ],
        inputFormat: "{ coins: number[], amount: number }",
        outputFormat: "number",
        constraints: "1 <= coins.length <= 12; 0 <= amount <= 10^4",
        hints: [
            "Unbounded knapsack DP.",
            "Return -1 if amount stays unreachable.",
        ],
        visibleCases: [
            {
                input: {
                coins: [1, 2, 5],
                amount: 11
            },
                output: 3,
                explanation: "5+5+1 uses 3 coins.",
            },
            {
                input: {
                coins: [2],
                amount: 3
            },
                output: -1,
                explanation: "Impossible amount.",
            }
        ],
        hiddenCases: [
            {
                input: {
                coins: [1],
                amount: 0
            },
                output: 0,
            },
            {
                input: {
                coins: [1],
                amount: 1
            },
                output: 1,
            },
            {
                input: {
                coins: [1, 2, 5],
                amount: 100
            },
                output: 20,
            },
            {
                input: {
                coins: [2, 5, 10, 1],
                amount: 27
            },
                output: 4,
            },
            {
                input: {
                coins: [186, 419, 83, 408],
                amount: 6249
            },
                output: 20,
            },
            {
                input: {
                coins: [1, 3, 4],
                amount: 6
            },
                output: 2,
            },
            {
                input: {
                coins: [5, 7, 8],
                amount: 11
            },
                output: -1,
            },
            {
                input: {
                coins: [3, 7],
                amount: 5
            },
                output: -1,
            }
        ],
    },
    {
        num: 41,
        slug: "top-k-frequent-elements",
        title: "Top K Frequent Elements",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "hash-table",
            "heap",
        ],
        inputFormat: "{ nums: number[], k: number }",
        outputFormat: "number[]",
        constraints: "1 <= nums.length <= 10^5; k in [1, distinct count]",
        hints: [
            "Count frequencies with a hash map.",
            "Return k most common values.",
        ],
        visibleCases: [
            {
                input: {
                nums: [1, 1, 1, 2, 2, 3],
                k: 2
            },
                output: [1, 2],
                explanation: "1 and 2 are most frequent.",
            },
            {
                input: {
                nums: [1],
                k: 1
            },
                output: [1],
                explanation: "Single element.",
            }
        ],
        hiddenCases: [
            {
                input: {
                nums: [1, 2],
                k: 2
            },
                output: [1, 2],
            },
            {
                input: {
                nums: [4, 1, -1, 2, -1, 2, 3],
                k: 2
            },
                output: [-1, 2],
            },
            {
                input: {
                nums: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                k: 1
            },
                output: [5],
            },
            {
                input: {
                nums: [3, 0, 1, 0],
                k: 1
            },
                output: [0],
            },
            {
                input: {
                nums: [1, 1, 1, 2, 2, 3, 3, 3],
                k: 2
            },
                output: [1, 3],
            },
            {
                input: {
                nums: [-1, -1],
                k: 1
            },
                output: [-1],
            },
            {
                input: {
                nums: [2, 2, 1, 1, 1, 3],
                k: 2
            },
                output: [1, 2],
            },
            {
                input: {
                nums: [5, 3, 1, 1, 1, 3, 73, 1],
                k: 3
            },
                output: [1, 3, 5],
            }
        ],
    },
    {
        num: 42,
        slug: "kth-largest-element-in-an-array",
        title: "Kth Largest Element in an Array",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "heap",
            "quickselect",
        ],
        inputFormat: "{ nums: number[], k: number }",
        outputFormat: "number",
        constraints: "1 <= k <= nums.length <= 10^5",
        hints: [
            "Sort descending and pick index k-1.",
            "Or use a size-k min heap.",
        ],
        visibleCases: [
            {
                input: {
                nums: [3, 2, 1, 5, 6, 4],
                k: 2
            },
                output: 5,
                explanation: "Second largest is 5.",
            },
            {
                input: {
                nums: [3, 2, 3, 1, 2, 4, 5, 5, 6],
                k: 4
            },
                output: 4,
                explanation: "Fourth largest is 4.",
            }
        ],
        hiddenCases: [
            {
                input: {
                nums: [1],
                k: 1
            },
                output: 1,
            },
            {
                input: {
                nums: [7, 10, 4, 3, 20, 15],
                k: 3
            },
                output: 10,
            },
            {
                input: {
                nums: [2, 1],
                k: 1
            },
                output: 2,
            },
            {
                input: {
                nums: [2, 1],
                k: 2
            },
                output: 1,
            },
            {
                input: {
                nums: [5, 5, 5, 5],
                k: 2
            },
                output: 5,
            },
            {
                input: {
                nums: [-1, 2, 0],
                k: 2
            },
                output: 0,
            },
            {
                input: {
                nums: [99, 99, 98, 97, 96],
                k: 3
            },
                output: 98,
            },
            {
                input: {
                nums: [3, 1, 4, 1, 5, 9, 2, 6],
                k: 5
            },
                output: 3,
            }
        ],
    },
    {
        num: 43,
        slug: "product-of-array-except-self",
        title: "Product of Array Except Self",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "prefix-sum",
        ],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[]",
        constraints: "2 <= nums.length <= 10^5; product fits 32-bit int",
        hints: [
            "Prefix products left to right, then suffix right to left.",
            "No division needed.",
        ],
        visibleCases: [
            {
                input: { nums: [1, 2, 3, 4] },
                output: [24, 12, 8, 6],
                explanation: "Output is [24,12,8,6].",
            },
            {
                input: { nums: [-1, 1, 0, -3, 3] },
                output: [0, 0, 9, 0, 0],
                explanation: "Zero in array.",
            }
        ],
        hiddenCases: [
            {
                input: { nums: [2, 3] },
                output: [3, 2],
            },
            {
                input: { nums: [0, 0] },
                output: [0, 0],
            },
            {
                input: { nums: [1, 0] },
                output: [0, 1],
            },
            {
                input: { nums: [4, 5, 6, 7] },
                output: [210, 168, 140, 120],
            },
            {
                input: { nums: [10, 3, 5, 6, 2] },
                output: [180, 600, 360, 300, 900],
            },
            {
                input: { nums: [-1, -1, -1] },
                output: [1, 1, 1],
            },
            {
                input: { nums: [1, 2, 3] },
                output: [6, 3, 2],
            },
            {
                input: { nums: [2, 2, 2, 2] },
                output: [8, 8, 8, 8],
            }
        ],
    },
    {
        num: 44,
        slug: "set-matrix-zeroes",
        title: "Set Matrix Zeroes",
        difficulty: "MEDIUM",
        topics: [
            "arrays",
            "matrix",
        ],
        inputFormat: "{ matrix: number[][] }",
        outputFormat: "number[][]",
        constraints: "1 <= m,n <= 200; -2^31 <= matrix[i][j] <= 2^31-1",
        hints: [
            "Use first row/column as markers.",
            "Handle row0/col0 zero flags separately.",
        ],
        visibleCases: [
            {
                input: { matrix: [[1, 1, 1], [1, 0, 1], [1, 1, 1]] },
                output: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
                explanation: "Middle zero zeroes row and column.",
            },
            {
                input: { matrix: [[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]] },
                output: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]],
                explanation: "Multiple zeros.",
            }
        ],
        hiddenCases: [
            {
                input: { matrix: [[1]] },
                output: [[1]],
            },
            {
                input: { matrix: [[0]] },
                output: [[0]],
            },
            {
                input: { matrix: [[1, 0], [3, 4]] },
                output: [[0, 0], [3, 0]],
            },
            {
                input: { matrix: [[1, 2, 3], [4, 0, 6], [7, 8, 9]] },
                output: [[1, 0, 3], [0, 0, 0], [7, 0, 9]],
            },
            {
                input: { matrix: [[0, 0], [0, 0]] },
                output: [[0, 0], [0, 0]],
            },
            {
                input: { matrix: [[1, 2], [3, 4], [5, 6]] },
                output: [[1, 2], [3, 4], [5, 6]],
            },
            {
                input: { matrix: [[1, 0, 3], [4, 5, 6], [7, 8, 0]] },
                output: [[0, 0, 0], [4, 0, 0], [0, 0, 0]],
            },
            {
                input: { matrix: [[-1, 0, 1], [2, 3, 4], [5, 6, 7]] },
                output: [[0, 0, 0], [2, 0, 4], [5, 0, 7]],
            }
        ],
    },
    {
        num: 45,
        slug: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "MEDIUM",
        topics: [
            "strings",
            "hash-table",
            "sorting",
        ],
        inputFormat: "{ strs: string[] }",
        outputFormat: "string[][]",
        constraints: "1 <= strs.length <= 10^4; 0 <= strs[i].length <= 100",
        hints: [
            "Use sorted letters as a group key.",
            "Collect strings sharing the same key.",
        ],
        visibleCases: [
            {
                input: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] },
                output: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]],
                explanation: "Three anagram groups.",
            },
            {
                input: { strs: [""] },
                output: [[""]],
                explanation: "Empty string group.",
            }
        ],
        hiddenCases: [
            {
                input: { strs: ["a"] },
                output: [["a"]],
            },
            {
                input: { strs: ["abc", "bca", "cab", "xyz"] },
                output: [["abc", "bca", "cab"], ["xyz"]],
            },
            {
                input: { strs: ["aab", "aba", "baa", "abb", "bab", "bba"] },
                output: [["aab", "aba", "baa"], ["abb", "bab", "bba"]],
            },
            {
                input: { strs: ["listen", "silent", "enlist"] },
                output: [["enlist", "listen", "silent"]],
            },
            {
                input: { strs: ["a", "b", "c"] },
                output: [["a"], ["b"], ["c"]],
            },
            {
                input: { strs: ["aaa", "aaa", "aaa"] },
                output: [["aaa", "aaa", "aaa"]],
            },
            {
                input: { strs: ["ab", "ba", "cd", "dc"] },
                output: [["ab", "ba"], ["cd", "dc"]],
            },
            {
                input: { strs: ["rat", "tar", "art", "cat", "act", "tac"] },
                output: [["act", "cat", "tac"], ["art", "rat", "tar"]],
            }
        ],
    },
    {
        num: 46,
        slug: "permutations",
        title: "Permutations",
        difficulty: "MEDIUM",
        topics: [
            "backtracking",
            "arrays",
        ],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[][]",
        constraints: "1 <= nums.length <= 6; all nums are distinct",
        hints: [
            "Swap or backtrack to build permutations.",
            "Track used elements.",
        ],
        visibleCases: [
            {
                input: { nums: [1, 2, 3] },
                output: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]],
                explanation: "Six permutations of three elements.",
            },
            {
                input: { nums: [0, 1] },
                output: [[0, 1], [1, 0]],
                explanation: "Two permutations.",
            }
        ],
        hiddenCases: [
            {
                input: { nums: [1] },
                output: [[1]],
            },
            {
                input: { nums: [1, 2] },
                output: [[1, 2], [2, 1]],
            },
            {
                input: { nums: [1, 2, 3, 4] },
                output: [[1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]],
            },
            {
                input: { nums: [4, 3, 2, 1] },
                output: [[1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]],
            },
            {
                input: { nums: [0, 1, 2] },
                output: [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]],
            },
            {
                input: { nums: [5, 4, 6] },
                output: [[4, 5, 6], [4, 6, 5], [5, 4, 6], [5, 6, 4], [6, 4, 5], [6, 5, 4]],
            },
            {
                input: { nums: [1, 3, 2] },
                output: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]],
            },
            {
                input: { nums: [9, 8, 7, 6] },
                output: [[6, 7, 8, 9], [6, 7, 9, 8], [6, 8, 7, 9], [6, 8, 9, 7], [6, 9, 7, 8], [6, 9, 8, 7], [7, 6, 8, 9], [7, 6, 9, 8], [7, 8, 6, 9], [7, 8, 9, 6], [7, 9, 6, 8], [7, 9, 8, 6], [8, 6, 7, 9], [8, 6, 9, 7], [8, 7, 6, 9], [8, 7, 9, 6], [8, 9, 6, 7], [8, 9, 7, 6], [9, 6, 7, 8], [9, 6, 8, 7], [9, 7, 6, 8], [9, 7, 8, 6], [9, 8, 6, 7], [9, 8, 7, 6]],
            }
        ],
    },
    {
        num: 47,
        slug: "combination-sum",
        title: "Combination Sum",
        difficulty: "MEDIUM",
        topics: [
            "backtracking",
            "arrays",
        ],
        inputFormat: "{ candidates: number[], target: number }",
        outputFormat: "number[][]",
        constraints: "1 <= candidates.length <= 30; 2 <= target <= 40; candidates distinct",
        hints: [
            "Sort candidates and backtrack.",
            "Reuse same candidate index when recursing.",
        ],
        visibleCases: [
            {
                input: {
                candidates: [2, 3, 6, 7],
                target: 7
            },
                output: [[2, 2, 3], [7]],
                explanation: "Combinations [2,2,3] and [7].",
            },
            {
                input: {
                candidates: [2, 3, 5],
                target: 8
            },
                output: [[2, 2, 2, 2], [2, 3, 3], [3, 5]],
                explanation: "Multiple reuse combinations.",
            }
        ],
        hiddenCases: [
            {
                input: {
                candidates: [2],
                target: 1
            },
                output: [],
            },
            {
                input: {
                candidates: [1],
                target: 1
            },
                output: [[1]],
            },
            {
                input: {
                candidates: [1],
                target: 2
            },
                output: [[1, 1]],
            },
            {
                input: {
                candidates: [2, 3, 5],
                target: 7
            },
                output: [[2, 2, 3], [2, 5]],
            },
            {
                input: {
                candidates: [3, 5, 7],
                target: 12
            },
                output: [[3, 3, 3, 3], [5, 7]],
            },
            {
                input: {
                candidates: [7, 3, 2],
                target: 18
            },
                output: [[2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 7], [2, 2, 2, 3, 3, 3, 3], [2, 2, 7, 7], [2, 3, 3, 3, 7], [3, 3, 3, 3, 3, 3]],
            },
            {
                input: {
                candidates: [2, 4, 6, 8],
                target: 10
            },
                output: [[2, 2, 2, 2, 2], [2, 2, 2, 4], [2, 2, 6], [2, 4, 4], [2, 8], [4, 6]],
            },
            {
                input: {
                candidates: [10, 1, 2, 7, 6, 1, 5],
                target: 8
            },
                output: [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 1, 1, 2], [1, 1, 1, 1, 2, 2], [1, 1, 1, 1, 2, 2], [1, 1, 1, 1, 2, 2], [1, 1, 1, 1, 2, 2], [1, 1, 1, 1, 2, 2], [1, 1, 1, 5], [1, 1, 1, 5], [1, 1, 1, 5], [1, 1, 1, 5], [1, 1, 2, 2, 2], [1, 1, 2, 2, 2], [1, 1, 2, 2, 2], [1, 1, 6], [1, 1, 6], [1, 1, 6], [1, 2, 5], [1, 2, 5], [1, 7], [1, 7], [2, 2, 2, 2], [2, 6]],
            }
        ],
    },
    {
        num: 48,
        slug: "subsets",
        title: "Subsets",
        difficulty: "MEDIUM",
        topics: [
            "backtracking",
            "arrays",
            "bit-manipulation",
        ],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[][]",
        constraints: "1 <= nums.length <= 10; -10 <= nums[i] <= 10; all distinct",
        hints: [
            "Include or exclude each element.",
            "Iterative build doubles subset count.",
        ],
        visibleCases: [
            {
                input: { nums: [1, 2, 3] },
                output: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
                explanation: "Eight subsets including empty.",
            },
            {
                input: { nums: [0] },
                output: [[], [0]],
                explanation: "Two subsets.",
            }
        ],
        hiddenCases: [
            {
                input: { nums: [1] },
                output: [[], [1]],
            },
            {
                input: { nums: [1, 2] },
                output: [[], [1], [1, 2], [2]],
            },
            {
                input: { nums: [4, 5, 6] },
                output: [[], [4], [4, 5], [4, 5, 6], [4, 6], [5], [5, 6], [6]],
            },
            {
                input: { nums: [3, 2, 1] },
                output: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]],
            },
            {
                input: { nums: [1, 2, 3, 4] },
                output: [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 4], [1, 3], [1, 3, 4], [1, 4], [2], [2, 3], [2, 3, 4], [2, 4], [3], [3, 4], [4]],
            },
            {
                input: { nums: [-1, 0] },
                output: [[], [-1], [-1, 0], [0]],
            },
            {
                input: { nums: [7, 8] },
                output: [[], [7], [7, 8], [8]],
            },
            {
                input: { nums: [2, 4, 6, 8] },
                output: [[], [2], [2, 4], [2, 4, 6], [2, 4, 6, 8], [2, 4, 8], [2, 6], [2, 6, 8], [2, 8], [4], [4, 6], [4, 6, 8], [4, 8], [6], [6, 8], [8]],
            }
        ],
    },
    {
        num: 49,
        slug: "word-search",
        title: "Word Search",
        difficulty: "MEDIUM",
        topics: [
            "backtracking",
            "matrix",
            "dfs",
        ],
        inputFormat: "{ board: string[][], word: string }",
        outputFormat: "boolean",
        constraints: "1 <= m,n <= 6; 1 <= word.length <= 15",
        hints: [
            "DFS from each cell.",
            "Backtrack by restoring visited cells.",
        ],
        visibleCases: [
            {
                input: {
                board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
                word: "ABCCED"
            },
                output: true,
                explanation: "Word found on board.",
            },
            {
                input: {
                board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
                word: "ABCB"
            },
                output: false,
                explanation: "Cannot reuse cell.",
            }
        ],
        hiddenCases: [
            {
                input: {
                board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
                word: "SEE"
            },
                output: true,
            },
            {
                input: {
                board: [["A"]],
                word: "A"
            },
                output: true,
            },
            {
                input: {
                board: [["A"]],
                word: "B"
            },
                output: false,
            },
            {
                input: {
                board: [["A", "B"], ["C", "D"]],
                word: "ACDB"
            },
                output: true,
            },
            {
                input: {
                board: [["A", "B"], ["C", "D"]],
                word: "ABCD"
            },
                output: false,
            },
            {
                input: {
                board: [["C", "A", "A"], ["A", "A", "A"], ["B", "C", "D"]],
                word: "AAB"
            },
                output: true,
            },
            {
                input: {
                board: [["A", "A", "A"], ["A", "A", "A"], ["A", "A", "A"]],
                word: "AAAAAAAA"
            },
                output: true,
            },
            {
                input: {
                board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]],
                word: "SFCS"
            },
                output: true,
            }
        ],
    },
    {
        num: 50,
        slug: "decode-ways",
        title: "Decode Ways",
        difficulty: "MEDIUM",
        topics: [
            "dynamic-programming",
            "strings",
        ],
        inputFormat: "{ s: string }",
        outputFormat: "number",
        constraints: "1 <= s.length <= 100; s contains only digits",
        hints: [
            "DP: ways[i] = ways from valid one-digit + two-digit decodes.",
            "Leading zero makes decoding invalid.",
        ],
        visibleCases: [
            {
                input: { s: "12" },
                output: 2,
                explanation: "1,2 or 12.",
            },
            {
                input: { s: "226" },
                output: 3,
                explanation: "Three decodings.",
            }
        ],
        hiddenCases: [
            {
                input: { s: "06" },
                output: 0,
            },
            {
                input: { s: "11106" },
                output: 2,
            },
            {
                input: { s: "1" },
                output: 1,
            },
            {
                input: { s: "10" },
                output: 1,
            },
            {
                input: { s: "27" },
                output: 1,
            },
            {
                input: { s: "2101" },
                output: 1,
            },
            {
                input: { s: "1234567890" },
                output: 0,
            },
            {
                input: { s: "011" },
                output: 0,
            }
        ],
    },
];
