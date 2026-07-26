import type { ProblemSpec } from "./types.js";
import { PY_TREE_HELPERS } from "./tree-helpers.js";

const JAVA_TREE_NODE = `
class TNode {
    int val;
    TNode left, right;
    TNode(int v) { val = v; }
}
TNode buildTree(JsonArray arr) {
    if (arr == null || arr.size() == 0 || arr.get(0).isJsonNull()) return null;
    List<TNode> nodes = new ArrayList<>();
    for (JsonElement el : arr) {
        nodes.add(el.isJsonNull() ? null : new TNode(el.getAsInt()));
    }
    for (int i = 0; i < nodes.size(); i++) {
        TNode node = nodes.get(i);
        if (node == null) continue;
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < nodes.size()) node.left = nodes.get(l);
        if (r < nodes.size()) node.right = nodes.get(r);
    }
    return nodes.get(0);
}
`;

const CPP_TREE_NODE = `
struct TNode {
    int val;
    TNode *left, *right;
    explicit TNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
TNode* buildTree(const json& arr) {
    if (!arr.is_array() || arr.empty() || arr[0].is_null()) return nullptr;
    std::vector<TNode*> nodes;
    nodes.reserve(arr.size());
    for (const auto& el : arr) {
        nodes.push_back(el.is_null() ? nullptr : new TNode(el.get<int>()));
    }
    for (size_t i = 0; i < nodes.size(); ++i) {
        if (!nodes[i]) continue;
        size_t l = 2 * i + 1, r = 2 * i + 2;
        if (l < nodes.size()) nodes[i]->left = nodes[l];
        if (r < nodes.size()) nodes[i]->right = nodes[r];
    }
    return nodes[0];
}
`;

export const BATCH_03_SPECS: ProblemSpec[] = [
    {
        num: 51,
        slug: "house-robber",
        title: "House Robber",
        difficulty: "MEDIUM",
        topics: ["dynamic-programming", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 100; 0 <= nums[i] <= 400",
        hints: [
            "Track the best total excluding the previous house.",
            "At each house choose max(skip, take).",
        ],
        visibleCases: [
            { input: { nums: [1, 2, 3, 1] }, output: 4 },
            { input: { nums: [2, 7, 9, 3, 1] }, output: 12 },
        ],
        hiddenCases: [
            { input: { nums: [5, 1, 1, 5] }, output: 10 },
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [2, 1] }, output: 2 },
            { input: { nums: [] }, output: 0 },
            { input: { nums: [100, 1, 1, 100] }, output: 200 },
            { input: { nums: [1, 2, 3, 4, 5] }, output: 9 },
            { input: { nums: [2, 1, 1, 2] }, output: 4 },
            { input: { nums: [5, 5, 10, 1, 1, 5] }, output: 20 },
        ],
    },
    {
        num: 52,
        slug: "jump-game",
        title: "Jump Game",
        difficulty: "MEDIUM",
        topics: ["greedy", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "boolean",
        constraints: "1 <= nums.length <= 10^4; 0 <= nums[i] <= 10^5",
        hints: [
            "Track the farthest index reachable so far.",
            "If current index exceeds reach, return false.",
        ],
        visibleCases: [
            { input: { nums: [2, 3, 1, 1, 4] }, output: true, explanation: "Jump 1 step to index 1, then 3 steps to the end." },
            { input: { nums: [3, 2, 1, 0, 4] }, output: false, explanation: "Cannot reach the last index." },
        ],
        hiddenCases: [
            { input: { nums: [0] }, output: true },
            { input: { nums: [1, 0] }, output: true },
            { input: { nums: [1, 1, 1, 1] }, output: true },
            { input: { nums: [0, 1] }, output: false },
            { input: { nums: [2, 0, 0] }, output: true },
            { input: { nums: [1, 2, 3] }, output: true },
            { input: { nums: [3, 0, 0, 0] }, output: true },
            { input: { nums: [5, 4, 3, 2, 1, 0] }, output: true },
        ],
    },
    {
        num: 53,
        slug: "partition-labels",
        title: "Partition Labels",
        difficulty: "MEDIUM",
        topics: ["greedy", "hash-table", "strings"],
        inputFormat: "{ s: string }",
        outputFormat: "number[]",
        constraints: "1 <= s.length <= 500; s consists of lowercase English letters",
        hints: [
            "Record the last index of each character.",
            "Extend the current partition end to cover all last indices seen.",
        ],
        visibleCases: [
            { input: { s: "ababcbacadefegdehijhklij" }, output: [9, 7, 8] },
            { input: { s: "eccbbbbdec" }, output: [10] },
        ],
        hiddenCases: [
            { input: { s: "a" }, output: [1] },
            { input: { s: "caedbdedda" }, output: [1, 9] },
            { input: { s: "abab" }, output: [4] },
            { input: { s: "abc" }, output: [1, 1, 1] },
            { input: { s: "leetcode" }, output: [1, 7] },
            { input: { s: "aa" }, output: [2] },
            { input: { s: "abacaba" }, output: [7] },
            { input: { s: "xyzxyz" }, output: [6] },
        ],
    },
    {
        num: 54,
        slug: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "MEDIUM",
        topics: ["stack", "arrays"],
        inputFormat: "{ temperatures: number[] }",
        outputFormat: "number[]",
        constraints: "1 <= temperatures.length <= 10^5; 30 <= temperatures[i] <= 100",
        hints: [
            "Use a monotonic decreasing stack of indices.",
            "When a warmer day appears, pop and record wait days.",
        ],
        visibleCases: [
            { input: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] }, output: [1, 1, 4, 2, 1, 1, 0, 0] },
            { input: { temperatures: [30, 40, 50, 60] }, output: [1, 1, 1, 0] },
        ],
        hiddenCases: [
            { input: { temperatures: [55] }, output: [0] },
            { input: { temperatures: [90, 80, 70, 60] }, output: [0, 0, 0, 0] },
            { input: { temperatures: [34, 80, 80, 34, 34, 80, 80, 80, 80] }, output: [1, 0, 0, 2, 1, 0, 0, 0, 0] },
            { input: { temperatures: [50, 55, 52, 58, 60] }, output: [1, 2, 1, 1, 0] },
            { input: { temperatures: [100, 99, 98, 97] }, output: [0, 0, 0, 0] },
            { input: { temperatures: [30, 31] }, output: [1, 0] },
            { input: { temperatures: [31, 30, 32] }, output: [2, 1, 0] },
            { input: { temperatures: [40, 41, 42, 43, 44] }, output: [1, 1, 1, 1, 0] },
        ],
    },
    {
        num: 55,
        slug: "evaluate-reverse-polish-notation",
        title: "Evaluate Reverse Polish Notation",
        difficulty: "MEDIUM",
        topics: ["stack", "math"],
        inputFormat: "{ tokens: string[] }",
        outputFormat: "number",
        constraints: "1 <= tokens.length <= 10^4; valid expression; division truncates toward zero",
        hints: [
            "Push numbers onto a stack.",
            "For operators, pop two operands and push the result.",
        ],
        visibleCases: [
            { input: { tokens: ["2", "1", "+", "3", "*"] }, output: 9, explanation: "((2 + 1) * 3) = 9" },
            { input: { tokens: ["4", "13", "5", "/", "+"] }, output: 6, explanation: "(4 + (13 / 5)) = 6" },
        ],
        hiddenCases: [
            { input: { tokens: ["18"] }, output: 18 },
            { input: { tokens: ["3", "4", "+"] }, output: 7 },
            { input: { tokens: ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"] }, output: 22 },
            { input: { tokens: ["5", "1", "2", "+", "4", "*", "+", "3", "-"] }, output: 14 },
            { input: { tokens: ["-1", "1", "+"] }, output: 0 },
            { input: { tokens: ["7", "-3", "-"] }, output: 10 },
            { input: { tokens: ["1", "2", "*", "3", "4", "*", "+"] }, output: 14 },
            { input: { tokens: ["6", "2", "/"] }, output: 3 },
        ],
    },
    {
        num: 56,
        slug: "binary-tree-level-order-traversal",
        title: "Binary Tree Level Order Traversal",
        difficulty: "MEDIUM",
        topics: ["trees", "bfs", "queue"],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "number[][]",
        constraints: "0 <= number of nodes <= 2000; -1000 <= node.val <= 1000",
        hints: [
            "Build the tree from level-order array with nulls.",
            "BFS with a queue, collecting one level at a time.",
        ],
        visibleCases: [
            { input: { root: [3, 9, 20, null, null, 15, 7] }, output: [[3], [9, 20], [15, 7]] },
            { input: { root: [1] }, output: [[1]] },
        ],
        hiddenCases: [
            { input: { root: [] }, output: [] },
            { input: { root: [1, 2, 3, 4, 5, 6, 7] }, output: [[1], [2, 3], [4, 5, 6, 7]] },
            { input: { root: [1, null, 2] }, output: [[1], [2]] },
            { input: { root: [1, 2] }, output: [[1], [2]] },
            { input: { root: [1, 2, null, 3] }, output: [[1], [2], [3]] },
            { input: { root: [5, 4, 6, 3, null, null, 7] }, output: [[5], [4, 6], [3, 7]] },
            { input: { root: [0, 2, 3, 4, 5, null, 7, 11, null, null, null, 8] }, output: [[0], [2, 3], [4, 5, 7], [11]] },
            { input: { root: [10, 5, 15, null, 6] }, output: [[10], [5, 15], [6]] },
        ],
    },
    {
        num: 57,
        slug: "binary-tree-right-side-view",
        title: "Binary Tree Right Side View",
        difficulty: "MEDIUM",
        topics: ["trees", "bfs", "dfs"],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "number[]",
        constraints: "0 <= number of nodes <= 100; -100 <= node.val <= 100",
        hints: [
            "Traverse level by level.",
            "Take the last node value at each level.",
        ],
        visibleCases: [
            { input: { root: [1, 2, 3, null, 5, null, 4] }, output: [1, 3, 4] },
            { input: { root: [1, null, 3] }, output: [1, 3] },
        ],
        hiddenCases: [
            { input: { root: [] }, output: [] },
            { input: { root: [1] }, output: [1] },
            { input: { root: [1, 2, 3, 4] }, output: [1, 3, 4] },
            { input: { root: [1, 2, 3, null, 5, null, 4] }, output: [1, 3, 4] },
            { input: { root: [1, 2, null, 3] }, output: [1, 2, 3] },
            { input: { root: [0, 1, 3, 2] }, output: [0, 3, 2] },
            { input: { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1] }, output: [5, 8, 4, 1] },
            { input: { root: [1, 2, 3, 4, null, null, 7] }, output: [1, 3, 7] },
        ],
    },
    {
        num: 58,
        slug: "validate-binary-search-tree",
        title: "Validate Binary Search Tree",
        difficulty: "MEDIUM",
        topics: ["trees", "dfs", "binary-search-tree"],
        inputFormat: "{ root: (number|null)[] }",
        outputFormat: "boolean",
        constraints: "0 <= number of nodes <= 10^4; -2^31 <= node.val <= 2^31 - 1",
        hints: [
            "Pass valid (min, max) bounds while traversing.",
            "Left child must be < node; right child must be > node.",
        ],
        visibleCases: [
            { input: { root: [2, 1, 3] }, output: true },
            { input: { root: [5, 1, 4, null, null, 3, 6] }, output: false },
        ],
        hiddenCases: [
            { input: { root: [] }, output: true },
            { input: { root: [1] }, output: true },
            { input: { root: [2, 2, 2] }, output: false },
            { input: { root: [2147483647] }, output: true },
            { input: { root: [5, 4, 6, null, null, 3, 7] }, output: false },
            { input: { root: [10, 5, 15, null, null, 6] }, output: false },
            { input: { root: [3, 1, 5, 0, 2, 4, 6] }, output: true },
            { input: { root: [1, 1] }, output: false },
        ],
    },
    {
        num: 59,
        slug: "lowest-common-ancestor-of-a-binary-tree",
        title: "Lowest Common Ancestor of a Binary Tree",
        difficulty: "MEDIUM",
        topics: ["trees", "dfs"],
        inputFormat: "{ root: (number|null)[], p: number, q: number }",
        outputFormat: "number",
        constraints: "2 <= number of nodes <= 10^5; all node values and p, q are unique and exist in the tree",
        hints: [
            "If current node equals p or q, it may be the answer.",
            "If both subtrees return a match, current node is the LCA.",
        ],
        visibleCases: [
            { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 1 }, output: 3 },
            { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 5, q: 4 }, output: 5 },
        ],
        hiddenCases: [
            { input: { root: [1, 2], p: 1, q: 2 }, output: 1 },
            { input: { root: [2, 1], p: 1, q: 2 }, output: 2 },
            { input: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 6, q: 4 }, output: 5 },
            { input: { root: [1, 2, 3, 4, 5, 6, 7], p: 4, q: 5 }, output: 2 },
            { input: { root: [1, 2, 3, 4, 5, 6, 7], p: 6, q: 7 }, output: 3 },
            { input: { root: [10, 5, 15, 3, 7, 12, 20], p: 3, q: 7 }, output: 5 },
            { input: { root: [10, 5, 15, 3, 7, 12, 20], p: 12, q: 20 }, output: 15 },
            { input: { root: [4, 2, 6, 1, 3, 5, 7], p: 1, q: 7 }, output: 4 },
        ],
    },
    {
        num: 60,
        slug: "clone-graph",
        title: "Clone Graph",
        difficulty: "MEDIUM",
        topics: ["graphs", "hash-table", "dfs"],
        inputFormat: "{ adjList: number[][] }",
        outputFormat: "number[][]",
        constraints: "1 <= adjList.length <= 100; node values are 1..n; graph is connected and undirected",
        hints: [
            "Map each original node value to its clone.",
            "DFS neighbors and wire cloned adjacency lists.",
        ],
        visibleCases: [
            { input: { adjList: [[2, 4], [1, 3], [2, 4], [1, 3]] }, output: [[2, 4], [1, 3], [2, 4], [1, 3]] },
            { input: { adjList: [[]] }, output: [[]] },
        ],
        hiddenCases: [
            { input: { adjList: [[2], [1]] }, output: [[2], [1]] },
            { input: { adjList: [[2, 3], [1, 3], [1, 2]] }, output: [[2, 3], [1, 3], [1, 2]] },
            { input: { adjList: [[2], [1, 3], [2]] }, output: [[2], [1, 3], [2]] },
            { input: { adjList: [[2, 3, 4], [1, 4], [1, 4], [1, 2, 3]] }, output: [[2, 3, 4], [1, 4], [1, 4], [1, 2, 3]] },
            { input: { adjList: [[2, 6], [1, 3, 4, 5], [2, 6], [2, 5], [2, 4], [1, 2, 3]] }, output: [[2, 6], [1, 3, 4, 5], [2, 6], [2, 5], [2, 4], [1, 2, 3]] },
            { input: { adjList: [[2, 3], [1], [1]] }, output: [[2, 3], [1], [1]] },
            { input: { adjList: [[2, 5], [1, 3], [2, 4], [3, 5], [1, 4]] }, output: [[2, 5], [1, 3], [2, 4], [3, 5], [1, 4]] },
            { input: { adjList: [[2, 3, 5], [1, 4], [1, 4, 5], [2, 3, 5], [1, 3, 4]] }, output: [[2, 3, 5], [1, 4], [1, 4, 5], [2, 3, 5], [1, 3, 4]] },
        ],
    },
    {
        num: 61,
        slug: "course-schedule",
        title: "Course Schedule",
        difficulty: "MEDIUM",
        topics: ["graphs", "topological-sort"],
        inputFormat: "{ numCourses: number, prerequisites: number[][] }",
        outputFormat: "boolean",
        constraints: "1 <= numCourses <= 2000; 0 <= prerequisites.length <= 5000",
        hints: [
            "Build a directed graph from prerequisites.",
            "Detect cycles with indegree-based topological sort.",
        ],
        visibleCases: [
            { input: { numCourses: 2, prerequisites: [[1, 0]] }, output: true, explanation: "Take course 0 then 1." },
            { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, output: false, explanation: "Cycle prevents finishing." },
        ],
        hiddenCases: [
            { input: { numCourses: 1, prerequisites: [] }, output: true },
            { input: { numCourses: 3, prerequisites: [[1, 0], [2, 1]] }, output: true },
            { input: { numCourses: 3, prerequisites: [[0, 1], [1, 2], [2, 0]] }, output: false },
            { input: { numCourses: 4, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2]] }, output: true },
            { input: { numCourses: 2, prerequisites: [] }, output: true },
            { input: { numCourses: 5, prerequisites: [[1, 0], [2, 1], [3, 2], [4, 3]] }, output: true },
            { input: { numCourses: 3, prerequisites: [[0, 1], [1, 2]] }, output: true },
            { input: { numCourses: 4, prerequisites: [[1, 0], [2, 1], [0, 2]] }, output: false },
        ],
    },
    {
        num: 62,
        slug: "rotting-oranges",
        title: "Rotting Oranges",
        difficulty: "MEDIUM",
        topics: ["bfs", "matrix"],
        inputFormat: "{ grid: number[][] }",
        outputFormat: "number",
        constraints: "1 <= m,n <= 10; grid values are 0, 1, or 2",
        hints: [
            "Multi-source BFS from all rotten oranges.",
            "Track minutes layer by layer.",
        ],
        visibleCases: [
            { input: { grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]] }, output: 4 },
            { input: { grid: [[2, 1, 1], [0, 1, 1], [1, 0, 1]] }, output: -1 },
        ],
        hiddenCases: [
            { input: { grid: [[0]] }, output: 0 },
            { input: { grid: [[2]] }, output: 0 },
            { input: { grid: [[1]] }, output: -1 },
            { input: { grid: [[2, 2], [1, 1]] }, output: 1 },
            { input: { grid: [[2, 1], [1, 1], [0, 1]] }, output: 3 },
            { input: { grid: [[2, 1, 1], [1, 1, 1], [1, 1, 2]] }, output: 2 },
            { input: { grid: [[2, 1, 1], [0, 0, 1], [1, 1, 1]] }, output: 6 },
            { input: { grid: [[0, 2]] }, output: 0 },
        ],
    },
    {
        num: 63,
        slug: "find-minimum-in-rotated-sorted-array",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "MEDIUM",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 5000; all elements are distinct; nums was sorted then rotated",
        hints: [
            "Compare mid with the right boundary.",
            "If nums[mid] > nums[hi], min is in the right half.",
        ],
        visibleCases: [
            { input: { nums: [3, 4, 5, 1, 2] }, output: 1 },
            { input: { nums: [4, 5, 6, 7, 0, 1, 2] }, output: 0 },
        ],
        hiddenCases: [
            { input: { nums: [11, 13, 15, 17] }, output: 11 },
            { input: { nums: [2, 1] }, output: 1 },
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [5, 1, 2, 3, 4] }, output: 1 },
            { input: { nums: [2, 3, 4, 5, 1] }, output: 1 },
            { input: { nums: [7, 8, 9, 1, 2, 3, 4, 5, 6] }, output: 1 },
            { input: { nums: [3, 1, 2] }, output: 1 },
            { input: { nums: [9, 1, 2, 3, 4, 5, 6, 7, 8] }, output: 1 },
        ],
    },
    {
        num: 64,
        slug: "search-in-rotated-sorted-array",
        title: "Search in Rotated Sorted Array",
        difficulty: "MEDIUM",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 5000; all elements are distinct; O(log n) expected",
        hints: [
            "Identify which half is sorted at each step.",
            "Check whether target lies in the sorted half.",
        ],
        visibleCases: [
            { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, output: 4 },
            { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, output: -1 },
        ],
        hiddenCases: [
            { input: { nums: [1], target: 0 }, output: -1 },
            { input: { nums: [1], target: 1 }, output: 0 },
            { input: { nums: [3, 1], target: 1 }, output: 1 },
            { input: { nums: [5, 1, 3], target: 3 }, output: 2 },
            { input: { nums: [4, 5, 6, 7, 8, 1, 2, 3], target: 8 }, output: 4 },
            { input: { nums: [6, 7, 1, 2, 3, 4, 5], target: 6 }, output: 0 },
            { input: { nums: [3, 4, 5, 6, 1, 2], target: 2 }, output: 5 },
            { input: { nums: [2, 3, 4, 5, 1], target: 1 }, output: 4 },
        ],
    },
    {
        num: 65,
        slug: "find-first-and-last-position-of-element-in-sorted-array",
        title: "Find First and Last Position of Element in Sorted Array",
        difficulty: "MEDIUM",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number[2]",
        constraints: "0 <= nums.length <= 10^5; nums is sorted non-decreasing; O(log n) expected",
        hints: [
            "Binary search for the leftmost occurrence.",
            "Binary search again for the rightmost occurrence.",
        ],
        visibleCases: [
            { input: { nums: [5, 7, 7, 8, 8, 10], target: 8 }, output: [3, 4] },
            { input: { nums: [5, 7, 7, 8, 8, 10], target: 6 }, output: [-1, -1] },
        ],
        hiddenCases: [
            { input: { nums: [], target: 0 }, output: [-1, -1] },
            { input: { nums: [1], target: 1 }, output: [0, 0] },
            { input: { nums: [2, 2, 2, 2], target: 2 }, output: [0, 3] },
            { input: { nums: [1, 2, 3, 4, 5], target: 3 }, output: [2, 2] },
            { input: { nums: [1, 1, 1, 1, 2], target: 1 }, output: [0, 3] },
            { input: { nums: [1, 4], target: 4 }, output: [1, 1] },
            { input: { nums: [2, 2, 3, 3, 3, 3, 3], target: 3 }, output: [2, 6] },
            { input: { nums: [1, 2, 3], target: 4 }, output: [-1, -1] },
        ],
    },
    {
        num: 66,
        slug: "longest-consecutive-sequence",
        title: "Longest Consecutive Sequence",
        difficulty: "MEDIUM",
        topics: ["hash-table", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "0 <= nums.length <= 10^5; values fit 32-bit signed int",
        hints: [
            "Put all numbers in a set.",
            "Only start counting from sequence beginnings.",
        ],
        visibleCases: [
            { input: { nums: [100, 4, 200, 1, 3, 2] }, output: 4, explanation: "Sequence 1,2,3,4." },
            { input: { nums: [0, 3, 7, 2, 5, 8, 4, 6, 0, 1] }, output: 9 },
        ],
        hiddenCases: [
            { input: { nums: [] }, output: 0 },
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [1, 2, 0, 1] }, output: 3 },
            { input: { nums: [9, 1, 4, 7, 3, -1, 0, 5, 8, -2, 6] }, output: 7 },
            { input: { nums: [10, 11, 12] }, output: 3 },
            { input: { nums: [1, 3, 5, 7] }, output: 1 },
            { input: { nums: [2, 2, 2] }, output: 1 },
            { input: { nums: [-1, 0, 1] }, output: 3 },
        ],
    },
    {
        num: 67,
        slug: "minimum-size-subarray-sum",
        title: "Minimum Size Subarray Sum",
        difficulty: "MEDIUM",
        topics: ["sliding-window", "arrays"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 10^5; 1 <= nums[i], target <= 10^9",
        hints: [
            "Expand the window until sum >= target.",
            "Shrink from the left while the sum stays valid.",
        ],
        visibleCases: [
            { input: { nums: [2, 3, 1, 2, 4, 3], target: 7 }, output: 2 },
            { input: { nums: [1, 4, 4], target: 4 }, output: 1 },
        ],
        hiddenCases: [
            { input: { nums: [1, 1, 1, 1, 1, 1, 1, 1], target: 11 }, output: 0 },
            { input: { nums: [1, 2, 3, 4, 5], target: 15 }, output: 5 },
            { input: { nums: [1], target: 1 }, output: 1 },
            { input: { nums: [1, 2, 3], target: 3 }, output: 1 },
            { input: { nums: [2, 1, 5, 2, 3, 2], target: 7 }, output: 2 },
            { input: { nums: [1, 1, 1, 1, 2, 2, 2, 2], target: 6 }, output: 3 },
            { input: { nums: [3, 4, 1, 1, 6, 2, 5, 1], target: 8 }, output: 2 },
            { input: { nums: [10, 5, 2, 6], target: 20 }, output: 4 },
        ],
    },
    {
        num: 68,
        slug: "minimum-window-substring-lite",
        title: "Minimum Window Substring Lite",
        difficulty: "MEDIUM",
        topics: ["sliding-window", "strings", "hash-table"],
        inputFormat: "{ s: string, t: string }",
        outputFormat: "string",
        constraints: "1 <= s.length, t.length <= 10^4; s and t consist of English letters",
        hints: [
            "Count required characters from t.",
            "Shrink window when all counts are satisfied.",
        ],
        visibleCases: [
            { input: { s: "ADOBECODEBANC", t: "ABC" }, output: "BANC" },
            { input: { s: "a", t: "a" }, output: "a" },
        ],
        hiddenCases: [
            { input: { s: "a", t: "aa" }, output: "" },
            { input: { s: "ab", t: "b" }, output: "b" },
            { input: { s: "abc", t: "cba" }, output: "abc" },
            { input: { s: "bba", t: "ab" }, output: "ba" },
            { input: { s: "cabwefgewcwaefgcf", t: "cae" }, output: "cwae" },
            { input: { s: "aa", t: "aa" }, output: "aa" },
            { input: { s: "abcabdebac", t: "abc" }, output: "abc" },
            { input: { s: "abc", t: "d" }, output: "" },
        ],
    },
    {
        num: 69,
        slug: "palindromic-substrings",
        title: "Palindromic Substrings",
        difficulty: "MEDIUM",
        topics: ["strings", "dynamic-programming"],
        inputFormat: "{ s: string }",
        outputFormat: "number",
        constraints: "1 <= s.length <= 1000; s consists of lowercase English letters",
        hints: [
            "Expand around each center.",
            "Count odd and even length palindromes separately.",
        ],
        visibleCases: [
            { input: { s: "abc" }, output: 3 },
            { input: { s: "aaa" }, output: 6 },
        ],
        hiddenCases: [
            { input: { s: "a" }, output: 1 },
            { input: { s: "aba" }, output: 4 },
            { input: { s: "abba" }, output: 6 },
            { input: { s: "abcd" }, output: 4 },
            { input: { s: "racecar" }, output: 10 },
            { input: { s: "bb" }, output: 3 },
            { input: { s: "ababa" }, output: 9 },
            { input: { s: "noon" }, output: 6 },
        ],
    },
    {
        num: 70,
        slug: "longest-palindromic-substring",
        title: "Longest Palindromic Substring",
        difficulty: "MEDIUM",
        topics: ["strings", "dynamic-programming"],
        inputFormat: "{ s: string }",
        outputFormat: "string",
        constraints: "1 <= s.length <= 1000; s consists of lowercase English letters",
        hints: [
            "Expand around each center.",
            "Track the longest palindrome found.",
        ],
        visibleCases: [
            { input: { s: "babad" }, output: "bab" },
            { input: { s: "cbbd" }, output: "bb" },
        ],
        hiddenCases: [
            { input: { s: "a" }, output: "a" },
            { input: { s: "ac" }, output: "a" },
            { input: { s: "racecar" }, output: "racecar" },
            { input: { s: "aacabdkacaa" }, output: "aca" },
            { input: { s: "forgeeksskeegfor" }, output: "geeksskeeg" },
            { input: { s: "aaa" }, output: "aaa" },
            { input: { s: "abcdcba" }, output: "abcdcba" },
            { input: { s: "bb" }, output: "bb" },
        ],
    },
    {
        num: 71,
        slug: "sort-colors",
        title: "Sort Colors",
        difficulty: "MEDIUM",
        topics: ["arrays", "two-pointers"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[]",
        constraints: "n == nums.length; 1 <= n <= 300; nums[i] is 0, 1, or 2",
        hints: [
            "Use Dutch national flag pointers low, mid, high.",
            "Swap 0s to the front and 2s to the back in one pass.",
        ],
        visibleCases: [
            { input: { nums: [2, 0, 2, 1, 1, 0] }, output: [0, 0, 1, 1, 2, 2] },
            { input: { nums: [2, 0, 1] }, output: [0, 1, 2] },
        ],
        hiddenCases: [
            { input: { nums: [0] }, output: [0] },
            { input: { nums: [1] }, output: [1] },
            { input: { nums: [2] }, output: [2] },
            { input: { nums: [0, 0, 0] }, output: [0, 0, 0] },
            { input: { nums: [1, 2, 0] }, output: [0, 1, 2] },
            { input: { nums: [2, 2, 2, 1, 1, 0] }, output: [0, 1, 1, 2, 2, 2] },
            { input: { nums: [1, 0, 2, 1, 0, 2] }, output: [0, 0, 1, 1, 2, 2] },
            { input: { nums: [0, 1, 0, 1, 2, 1, 2] }, output: [0, 0, 1, 1, 1, 2, 2] },
        ],
    },
    {
        num: 72,
        slug: "spiral-matrix",
        title: "Spiral Matrix",
        difficulty: "MEDIUM",
        topics: ["matrix", "simulation"],
        inputFormat: "{ matrix: number[][] }",
        outputFormat: "number[]",
        constraints: "1 <= m,n <= 10; -100 <= matrix[i][j] <= 100",
        hints: [
            "Track top, bottom, left, right boundaries.",
            "Traverse right, down, left, up and shrink bounds.",
        ],
        visibleCases: [
            { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, output: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
            { input: { matrix: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]] }, output: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
        ],
        hiddenCases: [
            { input: { matrix: [[1]] }, output: [1] },
            { input: { matrix: [[1, 2, 3]] }, output: [1, 2, 3] },
            { input: { matrix: [[1], [2], [3]] }, output: [1, 2, 3] },
            { input: { matrix: [[2, 5], [8, 4], [0, -1]] }, output: [2, 5, 4, -1, 0, 8] },
            { input: { matrix: [[1, 2], [3, 4]] }, output: [1, 2, 4, 3] },
            { input: { matrix: [[7], [9], [6]] }, output: [7, 9, 6] },
            { input: { matrix: [[1, 2, 3, 4]] }, output: [1, 2, 3, 4] },
            { input: { matrix: [[1, 2], [3, 4], [5, 6]] }, output: [1, 2, 4, 6, 5, 3] },
        ],
    },
    {
        num: 73,
        slug: "rotate-image",
        title: "Rotate Image",
        difficulty: "MEDIUM",
        topics: ["matrix", "arrays"],
        inputFormat: "{ matrix: number[][] }",
        outputFormat: "number[][]",
        constraints: "n == matrix.length == matrix[i].length; 1 <= n <= 20",
        hints: [
            "Transpose the matrix in place.",
            "Reverse each row to complete a 90-degree clockwise rotation.",
        ],
        visibleCases: [
            { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, output: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
            { input: { matrix: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]] }, output: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
        ],
        hiddenCases: [
            { input: { matrix: [[1]] }, output: [[1]] },
            { input: { matrix: [[1, 2], [3, 4]] }, output: [[3, 1], [4, 2]] },
            { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, output: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
            { input: { matrix: [[0, 1], [1, 0]] }, output: [[1, 0], [0, 1]] },
            { input: { matrix: [[2, 3], [1, 4]] }, output: [[1, 2], [4, 3]] },
            { input: { matrix: [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]] }, output: [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]] },
            { input: { matrix: [[-1, 2], [3, -4]] }, output: [[3, -1], [-4, 2]] },
            { input: { matrix: [[10, 20], [30, 40]] }, output: [[30, 10], [40, 20]] },
        ],
    },
    {
        num: 74,
        slug: "find-all-anagrams-in-a-string",
        title: "Find All Anagrams in a String",
        difficulty: "MEDIUM",
        topics: ["sliding-window", "strings", "hash-table"],
        inputFormat: "{ s: string, p: string }",
        outputFormat: "number[]",
        constraints: "1 <= s.length, p.length <= 3 * 10^4; s and p consist of lowercase English letters",
        hints: [
            "Maintain character counts for the current window.",
            "Slide a window of length len(p) across s.",
        ],
        visibleCases: [
            { input: { s: "cbaebabacd", p: "abc" }, output: [0, 6] },
            { input: { s: "abab", p: "ab" }, output: [0, 1, 2] },
        ],
        hiddenCases: [
            { input: { s: "baa", p: "aa" }, output: [1] },
            { input: { s: "aaaaaaa", p: "aaa" }, output: [0, 1, 2, 3, 4] },
            { input: { s: "abc", p: "def" }, output: [] },
            { input: { s: "ab", p: "abc" }, output: [] },
            { input: { s: "cba", p: "abc" }, output: [0] },
            { input: { s: "abababab", p: "abab" }, output: [0, 1, 2, 3, 4] },
            { input: { s: "af", p: "be" }, output: [] },
            { input: { s: "abab", p: "ba" }, output: [0, 1, 2] },
        ],
    },
    {
        num: 75,
        slug: "task-scheduler",
        title: "Task Scheduler",
        difficulty: "MEDIUM",
        topics: ["greedy", "heap", "arrays"],
        inputFormat: "{ tasks: string[], n: number }",
        outputFormat: "number",
        constraints: "1 <= tasks.length <= 10^4; tasks[i] is uppercase English letter; 0 <= n <= 100",
        hints: [
            "Count task frequencies.",
            "The most frequent task determines the minimum frame layout.",
        ],
        visibleCases: [
            { input: { tasks: ["A", "A", "A", "B", "B", "B"], n: 2 }, output: 8 },
            { input: { tasks: ["A", "A", "A", "B", "B", "B"], n: 0 }, output: 6 },
        ],
        hiddenCases: [
            { input: { tasks: ["A"], n: 0 }, output: 1 },
            { input: { tasks: ["A", "A", "A", "A"], n: 3 }, output: 13 },
            { input: { tasks: ["A", "B", "C", "D", "E", "F"], n: 2 }, output: 6 },
            { input: { tasks: ["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], n: 2 }, output: 16 },
            { input: { tasks: ["A", "B", "A", "B"], n: 2 }, output: 5 },
            { input: { tasks: ["A", "A", "B", "B"], n: 2 }, output: 5 },
            { input: { tasks: ["A", "A", "A", "B", "B", "B", "C", "C", "C"], n: 3 }, output: 11 },
            { input: { tasks: ["A", "B", "C", "A", "B", "C"], n: 1 }, output: 6 },
        ],
    },
];
