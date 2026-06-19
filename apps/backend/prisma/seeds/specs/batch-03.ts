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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int prev2 = 0, prev1 = 0;
for (JsonElement el : numsA) {
    int x = el.getAsInt();
    int cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
}
return prev1;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int prev2 = 0, prev1 = 0;
for (int x : nums) {
    int cur = std::max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
}
return prev1;`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    reach = 0
    for i, jump in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + jump)
    return True`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int reach = 0;
for (int i = 0; i < numsA.size(); i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + numsA.get(i).getAsInt());
}
return true;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int reach = 0;
for (int i = 0; i < (int)nums.size(); ++i) {
    if (i > reach) return false;
    reach = std::max(reach, i + nums[i]);
}
return true;`,
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
        pythonBody: `def solve(data):
    s = data.get("s", "")
    last = {ch: i for i, ch in enumerate(s)}
    parts, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])
        if i == end:
            parts.append(end - start + 1)
            start = i + 1
    return parts`,
        javaBody: `String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
for (int i = 0; i < s.length(); i++) last.put(s.charAt(i), i);
List<Integer> parts = new ArrayList<>();
int start = 0, end = 0;
for (int i = 0; i < s.length(); i++) {
    end = Math.max(end, last.get(s.charAt(i)));
    if (i == end) {
        parts.add(end - start + 1);
        start = i + 1;
    }
}
return parts;`,
        cppBody: `std::string s = data.value("s", std::string{});
std::unordered_map<char, int> last;
for (int i = 0; i < (int)s.size(); ++i) last[s[i]] = i;
std::vector<int> parts;
int start = 0, end = 0;
for (int i = 0; i < (int)s.size(); ++i) {
    end = std::max(end, last[s[i]]);
    if (i == end) {
        parts.push_back(end - start + 1);
        start = i + 1;
    }
}
return parts;`,
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
        pythonBody: `def solve(data):
    temperatures = data.get("temperatures", [])
    n = len(temperatures)
    ans = [0] * n
    st = []
    for i, t in enumerate(temperatures):
        while st and temperatures[st[-1]] < t:
            j = st.pop()
            ans[j] = i - j
        st.append(i)
    return ans`,
        javaBody: `JsonArray tempsA = data.has("temperatures") && data.get("temperatures").isJsonArray()
    ? data.getAsJsonArray("temperatures") : new JsonArray();
int n = tempsA.size();
int[] ans = new int[n];
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < n; i++) {
    int t = tempsA.get(i).getAsInt();
    while (!st.isEmpty() && tempsA.get(st.peek()).getAsInt() < t) {
        int j = st.pop();
        ans[j] = i - j;
    }
    st.push(i);
}
return ans;`,
        cppBody: `std::vector<int> temperatures = data.value("temperatures", std::vector<int>{});
int n = (int)temperatures.size();
std::vector<int> ans(n, 0);
std::vector<int> st;
for (int i = 0; i < n; ++i) {
    while (!st.empty() && temperatures[st.back()] < temperatures[i]) {
        int j = st.back();
        st.pop_back();
        ans[j] = i - j;
    }
    st.push_back(i);
}
return ans;`,
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
        pythonBody: `def solve(data):
    tokens = data.get("tokens", [])
    st = []
    for tok in tokens:
        if tok in "+-*/":
            b, a = st.pop(), st.pop()
            if tok == "+":
                st.append(a + b)
            elif tok == "-":
                st.append(a - b)
            elif tok == "*":
                st.append(a * b)
            else:
                st.append(int(a / b))
        else:
            st.append(int(tok))
    return st[0]`,
        javaBody: `JsonArray tokensA = data.has("tokens") && data.get("tokens").isJsonArray()
    ? data.getAsJsonArray("tokens") : new JsonArray();
Deque<Integer> st = new ArrayDeque<>();
for (JsonElement el : tokensA) {
    String tok = el.getAsString();
    if ("+-*/".contains(tok)) {
        int b = st.pop(), a = st.pop();
        if (tok.equals("+")) st.push(a + b);
        else if (tok.equals("-")) st.push(a - b);
        else if (tok.equals("*")) st.push(a * b);
        else st.push(a / b);
    } else {
        st.push(Integer.parseInt(tok));
    }
}
return st.pop();`,
        cppBody: `std::vector<std::string> tokens = data.value("tokens", std::vector<std::string>{});
std::vector<int> st;
for (const std::string& tok : tokens) {
    if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
        int b = st.back(); st.pop_back();
        int a = st.back(); st.pop_back();
        if (tok == "+") st.push_back(a + b);
        else if (tok == "-") st.push_back(a - b);
        else if (tok == "*") st.push_back(a * b);
        else st.push_back(a / b);
    } else {
        st.push_back(std::stoi(tok));
    }
}
return st.back();`,
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
        pythonBody: `${PY_TREE_HELPERS}
def solve(data):
    root = _build_tree(data.get("root", []))
    if root is None:
        return []
    ans, q = [], [root]
    while q:
        level, nxt = [], []
        for node in q:
            level.append(node["val"])
            if node["left"]:
                nxt.append(node["left"])
            if node["right"]:
                nxt.append(node["right"])
        ans.append(level)
        q = nxt
    return ans`,
        javaBody: `${JAVA_TREE_NODE}
JsonArray rootA = data.has("root") && data.get("root").isJsonArray()
    ? data.getAsJsonArray("root") : new JsonArray();
TNode root = buildTree(rootA);
if (root == null) return new ArrayList<>();
List<List<Integer>> ans = new ArrayList<>();
Deque<TNode> q = new ArrayDeque<>();
q.add(root);
while (!q.isEmpty()) {
    int size = q.size();
    List<Integer> level = new ArrayList<>();
    for (int i = 0; i < size; i++) {
        TNode node = q.removeFirst();
        level.add(node.val);
        if (node.left != null) q.add(node.left);
        if (node.right != null) q.add(node.right);
    }
    ans.add(level);
}
return ans;`,
        cppBody: `${CPP_TREE_NODE}
json rootA = data.contains("root") ? data["root"] : json::array();
TNode* root = buildTree(rootA);
if (!root) return json::array();
json ans = json::array();
std::deque<TNode*> q = {root};
while (!q.empty()) {
    int size = (int)q.size();
    json level = json::array();
    for (int i = 0; i < size; ++i) {
        TNode* node = q.front();
        q.pop_front();
        level.push_back(node->val);
        if (node->left) q.push_back(node->left);
        if (node->right) q.push_back(node->right);
    }
    ans.push_back(level);
}
return ans;`,
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
        pythonBody: `${PY_TREE_HELPERS}
def solve(data):
    root = _build_tree(data.get("root", []))
    if root is None:
        return []
    ans, q = [], [root]
    while q:
        level = []
        nxt = []
        for node in q:
            level.append(node["val"])
            if node["left"]:
                nxt.append(node["left"])
            if node["right"]:
                nxt.append(node["right"])
        ans.append(level[-1])
        q = nxt
    return ans`,
        javaBody: `${JAVA_TREE_NODE}
JsonArray rootA = data.has("root") && data.get("root").isJsonArray()
    ? data.getAsJsonArray("root") : new JsonArray();
TNode root = buildTree(rootA);
if (root == null) return new ArrayList<>();
List<Integer> ans = new ArrayList<>();
Deque<TNode> q = new ArrayDeque<>();
q.add(root);
while (!q.isEmpty()) {
    int size = q.size();
    int rightVal = 0;
    for (int i = 0; i < size; i++) {
        TNode node = q.removeFirst();
        rightVal = node.val;
        if (node.left != null) q.add(node.left);
        if (node.right != null) q.add(node.right);
    }
    ans.add(rightVal);
}
return ans;`,
        cppBody: `${CPP_TREE_NODE}
json rootA = data.contains("root") ? data["root"] : json::array();
TNode* root = buildTree(rootA);
if (!root) return json::array();
json ans = json::array();
std::deque<TNode*> q = {root};
while (!q.empty()) {
    int size = (int)q.size();
    int rightVal = 0;
    for (int i = 0; i < size; ++i) {
        TNode* node = q.front();
        q.pop_front();
        rightVal = node->val;
        if (node->left) q.push_back(node->left);
        if (node->right) q.push_back(node->right);
    }
    ans.push_back(rightVal);
}
return ans;`,
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
        pythonBody: `${PY_TREE_HELPERS}
def solve(data):
    root = _build_tree(data.get("root", []))
    def valid(node, lo, hi):
        if node is None:
            return True
        v = node["val"]
        if v <= lo or v >= hi:
            return False
        return valid(node["left"], lo, v) and valid(node["right"], v, hi)
    return valid(root, float("-inf"), float("inf"))`,
        javaBody: `${JAVA_TREE_NODE}
JsonArray rootA = data.has("root") && data.get("root").isJsonArray()
    ? data.getAsJsonArray("root") : new JsonArray();
TNode root = buildTree(rootA);
Deque<TNode> st = new ArrayDeque<>();
TNode cur = root;
Long prev = null;
while (cur != null || !st.isEmpty()) {
    while (cur != null) {
        st.push(cur);
        cur = cur.left;
    }
    cur = st.pop();
    if (prev != null && cur.val <= prev) return false;
    prev = (long) cur.val;
    cur = cur.right;
}
return true;`,
        cppBody: `${CPP_TREE_NODE}
json rootA = data.contains("root") ? data["root"] : json::array();
TNode* root = buildTree(rootA);
std::function<bool(TNode*, long long, long long)> valid = [&](TNode* node, long long lo, long long hi) -> bool {
    if (!node) return true;
    if (node->val <= lo || node->val >= hi) return false;
    return valid(node->left, lo, node->val) && valid(node->right, node->val, hi);
};
return valid(root, LLONG_MIN, LLONG_MAX);`,
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
        pythonBody: `${PY_TREE_HELPERS}
def solve(data):
    root = _build_tree(data.get("root", []))
    p = data.get("p")
    q = data.get("q")
    def lca(node):
        if node is None:
            return None
        if node["val"] == p or node["val"] == q:
            return node
        left = lca(node["left"])
        right = lca(node["right"])
        if left and right:
            return node
        return left or right
    ans = lca(root)
    return None if ans is None else ans["val"]`,
        javaBody: `${JAVA_TREE_NODE}
JsonArray rootA = data.has("root") && data.get("root").isJsonArray()
    ? data.getAsJsonArray("root") : new JsonArray();
int p = data.get("p").getAsInt();
int q = data.get("q").getAsInt();
TNode root = buildTree(rootA);
Map<Integer, Integer> parent = new HashMap<>();
Deque<TNode> st = new ArrayDeque<>();
st.push(root);
parent.put(root.val, null);
while (!st.isEmpty()) {
    TNode node = st.pop();
    if (node.left != null) { parent.put(node.left.val, node.val); st.push(node.left); }
    if (node.right != null) { parent.put(node.right.val, node.val); st.push(node.right); }
}
Set<Integer> seen = new HashSet<>();
int cur = p;
seen.add(cur);
while (parent.get(cur) != null) {
    cur = parent.get(cur);
    seen.add(cur);
}
cur = q;
while (!seen.contains(cur)) {
    cur = parent.get(cur);
}
return cur;`,
        cppBody: `${CPP_TREE_NODE}
json rootA = data.contains("root") ? data["root"] : json::array();
int p = data["p"].get<int>();
int q = data["q"].get<int>();
TNode* root = buildTree(rootA);
std::function<TNode*(TNode*)> lca = [&](TNode* node) -> TNode* {
    if (!node) return nullptr;
    if (node->val == p || node->val == q) return node;
    TNode* left = lca(node->left);
    TNode* right = lca(node->right);
    if (left && right) return node;
    return left ? left : right;
};
TNode* ans = lca(root);
return ans ? json(ans->val) : json(nullptr);`,
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
        pythonBody: `def solve(data):
    adj = data.get("adjList", [])
    if not adj:
        return []
    clones = {}
    def dfs(v):
        if v in clones:
            return clones[v]
        clones[v] = []
        for nei in adj[v - 1]:
            dfs(nei)
            clones[v].append(nei)
        return clones[v]
    for i in range(1, len(adj) + 1):
        dfs(i)
    return [clones[i] for i in range(1, len(adj) + 1)]`,
        javaBody: `JsonArray adjA = data.has("adjList") && data.get("adjList").isJsonArray()
    ? data.getAsJsonArray("adjList") : new JsonArray();
int n = adjA.size();
if (n == 0) return new JsonArray();
List<List<Integer>> adj = new ArrayList<>();
for (JsonElement row : adjA) {
    List<Integer> lst = new ArrayList<>();
    for (JsonElement el : row.getAsJsonArray()) lst.add(el.getAsInt());
    adj.add(lst);
}
Map<Integer, List<Integer>> clones = new HashMap<>();
Deque<Integer> st = new ArrayDeque<>();
st.push(1);
clones.put(1, new ArrayList<>());
while (!st.isEmpty()) {
    int v = st.pop();
  for (int nei : adj.get(v - 1)) {
        if (!clones.containsKey(nei)) {
            clones.put(nei, new ArrayList<>());
            st.push(nei);
        }
    }
}
for (int v = 1; v <= n; v++) {
    for (int nei : adj.get(v - 1)) clones.get(v).add(nei);
}
JsonArray out = new JsonArray();
for (int v = 1; v <= n; v++) {
    JsonArray row = new JsonArray();
    for (int nei : clones.get(v)) row.add(nei);
    out.add(row);
}
return out;`,
        cppBody: `std::vector<std::vector<int>> adj = data.value("adjList", std::vector<std::vector<int>>{});
int n = (int)adj.size();
if (n == 0) return json::array();
std::unordered_map<int, std::vector<int>> clones;
std::vector<int> st = {1};
clones[1] = {};
while (!st.empty()) {
    int v = st.back();
    st.pop_back();
    for (int nei : adj[v - 1]) {
        if (!clones.count(nei)) {
            clones[nei] = {};
            st.push_back(nei);
        }
    }
}
for (int v = 1; v <= n; ++v) {
    for (int nei : adj[v - 1]) clones[v].push_back(nei);
}
json out = json::array();
for (int v = 1; v <= n; ++v) out.push_back(clones[v]);
return out;`,
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
        pythonBody: `def solve(data):
    n = data.get("numCourses", 0)
    prereqs = data.get("prerequisites", [])
    indeg = [0] * n
    adj = [[] for _ in range(n)]
    for a, b in prereqs:
        adj[b].append(a)
        indeg[a] += 1
    q = [i for i in range(n) if indeg[i] == 0]
    seen = 0
    while q:
        u = q.pop()
        seen += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return seen == n`,
        javaBody: `int n = data.get("numCourses").getAsInt();
JsonArray preA = data.has("prerequisites") && data.get("prerequisites").isJsonArray()
    ? data.getAsJsonArray("prerequisites") : new JsonArray();
int[] indeg = new int[n];
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (JsonElement el : preA) {
    JsonArray pair = el.getAsJsonArray();
    int a = pair.get(0).getAsInt(), b = pair.get(1).getAsInt();
    adj.get(b).add(a);
    indeg[a]++;
}
Deque<Integer> q = new ArrayDeque<>();
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
int seen = 0;
while (!q.isEmpty()) {
    int u = q.removeFirst();
    seen++;
    for (int v : adj.get(u)) {
        if (--indeg[v] == 0) q.add(v);
    }
}
return seen == n;`,
        cppBody: `int n = data["numCourses"].get<int>();
std::vector<std::vector<int>> prereqs = data.value("prerequisites", std::vector<std::vector<int>>{});
std::vector<int> indeg(n, 0);
std::vector<std::vector<int>> adj(n);
for (const auto& pair : prereqs) {
    int a = pair[0], b = pair[1];
    adj[b].push_back(a);
    indeg[a]++;
}
std::deque<int> q;
for (int i = 0; i < n; ++i) if (indeg[i] == 0) q.push_back(i);
int seen = 0;
while (!q.empty()) {
    int u = q.front();
    q.pop_front();
    seen++;
    for (int v : adj[u]) {
        if (--indeg[v] == 0) q.push_back(v);
    }
}
return seen == n;`,
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
        pythonBody: `def solve(data):
    grid = data.get("grid", [])
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    q, fresh = [], 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 2:
                q.append((i, j, 0))
            elif grid[i][j] == 1:
                fresh += 1
    minutes = 0
    while q:
        i, j, t = q.pop(0)
        minutes = max(minutes, t)
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < m and 0 <= nj < n and grid[ni][nj] == 1:
                grid[ni][nj] = 2
                fresh -= 1
                q.append((ni, nj, t + 1))
    return -1 if fresh else minutes`,
        javaBody: `JsonArray gridA = data.has("grid") && data.get("grid").isJsonArray()
    ? data.getAsJsonArray("grid") : new JsonArray();
if (gridA.size() == 0) return 0;
int m = gridA.size(), n = gridA.get(0).getAsJsonArray().size();
int[][] grid = new int[m][n];
Deque<int[]> q = new ArrayDeque<>();
int fresh = 0;
for (int i = 0; i < m; i++) {
    JsonArray row = gridA.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        grid[i][j] = row.get(j).getAsInt();
        if (grid[i][j] == 2) q.add(new int[] {i, j, 0});
        else if (grid[i][j] == 1) fresh++;
    }
}
int minutes = 0;
int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
while (!q.isEmpty()) {
    int[] cur = q.removeFirst();
    int i = cur[0], j = cur[1], t = cur[2];
    minutes = Math.max(minutes, t);
    for (int k = 0; k < 4; k++) {
        int ni = i + dr[k], nj = j + dc[k];
        if (0 <= ni && ni < m && 0 <= nj && nj < n && grid[ni][nj] == 1) {
            grid[ni][nj] = 2;
            fresh--;
            q.add(new int[] {ni, nj, t + 1});
        }
    }
}
return fresh == 0 ? minutes : -1;`,
        cppBody: `std::vector<std::vector<int>> grid = data.value("grid", std::vector<std::vector<int>>{});
if (grid.empty()) return 0;
int m = (int)grid.size(), n = (int)grid[0].size();
std::deque<std::array<int, 3>> q;
int fresh = 0;
for (int i = 0; i < m; ++i) {
    for (int j = 0; j < n; ++j) {
        if (grid[i][j] == 2) q.push_back({i, j, 0});
        else if (grid[i][j] == 1) fresh++;
    }
}
int minutes = 0;
const int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
while (!q.empty()) {
    auto [i, j, t] = q.front();
    q.pop_front();
    minutes = std::max(minutes, t);
    for (int k = 0; k < 4; ++k) {
        int ni = i + dr[k], nj = j + dc[k];
        if (0 <= ni && ni < m && 0 <= nj && nj < n && grid[ni][nj] == 1) {
            grid[ni][nj] = 2;
            fresh--;
            q.push_back({ni, nj, t + 1});
        }
    }
}
return fresh == 0 ? minutes : -1;`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int lo = 0, hi = numsA.size() - 1;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (numsA.get(mid).getAsInt() > numsA.get(hi).getAsInt()) lo = mid + 1;
    else hi = mid;
}
return numsA.get(lo).getAsInt();`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int lo = 0, hi = (int)nums.size() - 1;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
}
return nums[lo];`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    target = data.get("target", 0)
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.get("target").getAsInt();
int lo = 0, hi = numsA.size() - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    int val = numsA.get(mid).getAsInt();
    if (val == target) return mid;
    if (numsA.get(lo).getAsInt() <= val) {
        if (numsA.get(lo).getAsInt() <= target && target < val) hi = mid - 1;
        else lo = mid + 1;
    } else {
        if (val < target && target <= numsA.get(hi).getAsInt()) lo = mid + 1;
        else hi = mid - 1;
    }
}
return -1;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data["target"].get<int>();
int lo = 0, hi = (int)nums.size() - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[lo] <= nums[mid]) {
        if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
        else lo = mid + 1;
    } else {
        if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
        else hi = mid - 1;
    }
}
return -1;`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    target = data.get("target", 0)
    def bound(left):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if (nums[mid] < target) if left else (nums[mid] <= target):
                lo = mid + 1
            else:
                hi = mid
        return lo
    l, r = bound(True), bound(False) - 1
    return [-1, -1] if l > r else [l, r]`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.get("target").getAsInt();
int n = numsA.size();
int lo = 0, hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (numsA.get(mid).getAsInt() < target) lo = mid + 1;
    else hi = mid;
}
int left = lo;
lo = 0; hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (numsA.get(mid).getAsInt() <= target) lo = mid + 1;
    else hi = mid;
}
int right = lo - 1;
if (left > right) return new int[] {-1, -1};
return new int[] {left, right};`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data["target"].get<int>();
int n = (int)nums.size();
int lo = 0, hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
}
int left = lo;
lo = 0; hi = n;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] <= target) lo = mid + 1;
    else hi = mid;
}
int right = lo - 1;
if (left > right) return json::array({-1, -1});
return json::array({left, right});`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            cur = x
            length = 0
            while cur in s:
                length += 1
                cur += 1
            best = max(best, length)
    return best`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
Set<Integer> s = new HashSet<>();
for (JsonElement el : numsA) s.add(el.getAsInt());
int best = 0;
for (int x : s) {
    if (s.contains(x - 1)) continue;
    int cur = x, length = 0;
    while (s.contains(cur)) {
        length++;
        cur++;
    }
    best = Math.max(best, length);
}
return best;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
std::unordered_set<int> s(nums.begin(), nums.end());
int best = 0;
for (int x : s) {
    if (s.count(x - 1)) continue;
    int cur = x, length = 0;
    while (s.count(cur)) {
        length++;
        cur++;
    }
    best = std::max(best, length);
}
return best;`,
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
        pythonBody: `def solve(data):
    nums = data.get("nums", [])
    target = data.get("target", 0)
    lo = cur = 0
    best = float("inf")
    for hi, x in enumerate(nums):
        cur += x
        while cur >= target:
            best = min(best, hi - lo + 1)
            cur -= nums[lo]
            lo += 1
    return 0 if best == float("inf") else best`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
long target = data.get("target").getAsLong();
int lo = 0;
long cur = 0;
int best = Integer.MAX_VALUE;
for (int hi = 0; hi < numsA.size(); hi++) {
    cur += numsA.get(hi).getAsInt();
    while (cur >= target) {
        best = Math.min(best, hi - lo + 1);
        cur -= numsA.get(lo++).getAsInt();
    }
}
return best == Integer.MAX_VALUE ? 0 : best;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
long long target = data["target"].get<long long>();
int lo = 0;
long long cur = 0;
int best = INT_MAX;
for (int hi = 0; hi < (int)nums.size(); ++hi) {
    cur += nums[hi];
    while (cur >= target) {
        best = std::min(best, hi - lo + 1);
        cur -= nums[lo++];
    }
}
return best == INT_MAX ? 0 : best;`,
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
        pythonBody: `def solve(data):
    from collections import Counter
    s = data.get("s", "")
    t = data.get("t", "")
    need = Counter(t)
    missing = len(t)
    lo = 0
    best = ""
    for hi, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            window = s[lo:hi + 1]
            if not best or len(window) < len(best):
                best = window
            need[s[lo]] += 1
            if need[s[lo]] > 0:
                missing += 1
            lo += 1
    return best`,
        javaBody: `String s = data.get("s").getAsString();
String t = data.get("t").getAsString();
int[] need = new int[128];
for (char ch : t.toCharArray()) need[ch]++;
int missing = t.length();
int lo = 0;
String best = "";
for (int hi = 0; hi < s.length(); hi++) {
    char ch = s.charAt(hi);
    if (need[ch]-- > 0) missing--;
    while (missing == 0) {
        String window = s.substring(lo, hi + 1);
        if (best.isEmpty() || window.length() < best.length()) best = window;
        if (++need[s.charAt(lo)] > 0) missing++;
        lo++;
    }
}
return best;`,
        cppBody: `std::string s = data["s"].get<std::string>();
std::string t = data["t"].get<std::string>();
std::array<int, 128> need{};
for (char ch : t) need[(unsigned char)ch]++;
int missing = (int)t.size();
int lo = 0;
std::string best;
for (int hi = 0; hi < (int)s.size(); ++hi) {
    if (need[(unsigned char)s[hi]]-- > 0) missing--;
    while (missing == 0) {
        std::string window = s.substr(lo, hi - lo + 1);
        if (best.empty() || window.size() < best.size()) best = window;
        if (++need[(unsigned char)s[lo]] > 0) missing++;
        lo++;
    }
}
return best;`,
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
        pythonBody: `def solve(data):
    s = data.get("s", "")
    n = len(s)
    ans = 0
    for center in range(2 * n - 1):
        lo = center // 2
        hi = lo + center % 2
        while lo >= 0 and hi < n and s[lo] == s[hi]:
            ans += 1
            lo -= 1
            hi += 1
    return ans`,
        javaBody: `String s = data.get("s").getAsString();
int n = s.length(), ans = 0;
for (int center = 0; center < 2 * n - 1; center++) {
    int lo = center / 2, hi = lo + center % 2;
    while (lo >= 0 && hi < n && s.charAt(lo) == s.charAt(hi)) {
        ans++;
        lo--;
        hi++;
    }
}
return ans;`,
        cppBody: `std::string s = data["s"].get<std::string>();
int n = (int)s.size(), ans = 0;
for (int center = 0; center < 2 * n - 1; ++center) {
    int lo = center / 2, hi = lo + center % 2;
    while (lo >= 0 && hi < n && s[lo] == s[hi]) {
        ans++;
        lo--;
        hi++;
    }
}
return ans;`,
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
        pythonBody: `def solve(data):
    s = data.get("s", "")
    n = len(s)
    best = ""
    for center in range(2 * n - 1):
        lo = center // 2
        hi = lo + center % 2
        while lo >= 0 and hi < n and s[lo] == s[hi]:
            if hi - lo + 1 > len(best):
                best = s[lo:hi + 1]
            lo -= 1
            hi += 1
    return best`,
        javaBody: `String s = data.get("s").getAsString();
int n = s.length();
String best = "";
for (int center = 0; center < 2 * n - 1; center++) {
    int lo = center / 2, hi = lo + center % 2;
    while (lo >= 0 && hi < n && s.charAt(lo) == s.charAt(hi)) {
        if (hi - lo + 1 > best.length()) best = s.substring(lo, hi + 1);
        lo--;
        hi++;
    }
}
return best;`,
        cppBody: `std::string s = data["s"].get<std::string>();
int n = (int)s.size();
std::string best;
for (int center = 0; center < 2 * n - 1; ++center) {
    int lo = center / 2, hi = lo + center % 2;
    while (lo >= 0 && hi < n && s[lo] == s[hi]) {
        if (hi - lo + 1 > (int)best.size()) best = s.substr(lo, hi - lo + 1);
        lo--;
        hi++;
    }
}
return best;`,
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
        pythonBody: `def solve(data):
    nums = list(data.get("nums", []))
    lo = mid = 0
    hi = len(nums) - 1
    while mid <= hi:
        if nums[mid] == 0:
            nums[lo], nums[mid] = nums[mid], nums[lo]
            lo += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[hi] = nums[hi], nums[mid]
            hi -= 1
    return nums`,
        javaBody: `JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums") : new JsonArray();
int[] nums = new int[numsA.size()];
for (int i = 0; i < numsA.size(); i++) nums[i] = numsA.get(i).getAsInt();
int lo = 0, mid = 0, hi = nums.length - 1;
while (mid <= hi) {
    if (nums[mid] == 0) {
        int tmp = nums[lo]; nums[lo] = nums[mid]; nums[mid] = tmp;
        lo++; mid++;
    } else if (nums[mid] == 1) {
        mid++;
    } else {
        int tmp = nums[mid]; nums[mid] = nums[hi]; nums[hi] = tmp;
        hi--;
    }
}
return nums;`,
        cppBody: `std::vector<int> nums = data.value("nums", std::vector<int>{});
int lo = 0, mid = 0, hi = (int)nums.size() - 1;
while (mid <= hi) {
    if (nums[mid] == 0) {
        std::swap(nums[lo++], nums[mid++]);
    } else if (nums[mid] == 1) {
        mid++;
    } else {
        std::swap(nums[mid], nums[hi--]);
    }
}
return nums;`,
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
        pythonBody: `def solve(data):
    matrix = data.get("matrix", [])
    if not matrix:
        return []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    ans = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            ans.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            ans.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                ans.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                ans.append(matrix[r][left])
            left += 1
    return ans`,
        javaBody: `JsonArray matrixA = data.has("matrix") && data.get("matrix").isJsonArray()
    ? data.getAsJsonArray("matrix") : new JsonArray();
if (matrixA.size() == 0) return new ArrayList<>();
int m = matrixA.size(), n = matrixA.get(0).getAsJsonArray().size();
int[][] matrix = new int[m][n];
for (int i = 0; i < m; i++) {
    JsonArray row = matrixA.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) matrix[i][j] = row.get(j).getAsInt();
}
int top = 0, bottom = m - 1, left = 0, right = n - 1;
List<Integer> ans = new ArrayList<>();
while (top <= bottom && left <= right) {
    for (int c = left; c <= right; c++) ans.add(matrix[top][c]);
    top++;
    for (int r = top; r <= bottom; r++) ans.add(matrix[r][right]);
    right--;
    if (top <= bottom) {
        for (int c = right; c >= left; c--) ans.add(matrix[bottom][c]);
        bottom--;
    }
    if (left <= right) {
        for (int r = bottom; r >= top; r--) ans.add(matrix[r][left]);
        left++;
    }
}
return ans;`,
        cppBody: `std::vector<std::vector<int>> matrix = data.value("matrix", std::vector<std::vector<int>>{});
if (matrix.empty()) return json::array();
int m = (int)matrix.size(), n = (int)matrix[0].size();
int top = 0, bottom = m - 1, left = 0, right = n - 1;
json ans = json::array();
while (top <= bottom && left <= right) {
    for (int c = left; c <= right; ++c) ans.push_back(matrix[top][c]);
    top++;
    for (int r = top; r <= bottom; ++r) ans.push_back(matrix[r][right]);
    right--;
    if (top <= bottom) {
        for (int c = right; c >= left; --c) ans.push_back(matrix[bottom][c]);
        bottom--;
    }
    if (left <= right) {
        for (int r = bottom; r >= top; --r) ans.push_back(matrix[r][left]);
        left++;
    }
}
return ans;`,
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
        pythonBody: `def solve(data):
    matrix = [row[:] for row in data.get("matrix", [])]
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix`,
        javaBody: `JsonArray matrixA = data.has("matrix") && data.get("matrix").isJsonArray()
    ? data.getAsJsonArray("matrix") : new JsonArray();
int n = matrixA.size();
int[][] matrix = new int[n][n];
for (int i = 0; i < n; i++) {
    JsonArray row = matrixA.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) matrix[i][j] = row.get(j).getAsInt();
}
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        int tmp = matrix[i][j];
        matrix[i][j] = matrix[j][i];
        matrix[j][i] = tmp;
    }
}
for (int i = 0; i < n; i++) {
    for (int l = 0, r = n - 1; l < r; l++, r--) {
        int tmp = matrix[i][l];
        matrix[i][l] = matrix[i][r];
        matrix[i][r] = tmp;
    }
}
JsonArray out = new JsonArray();
for (int i = 0; i < n; i++) {
    JsonArray row = new JsonArray();
    for (int j = 0; j < n; j++) row.add(matrix[i][j]);
    out.add(row);
}
return out;`,
        cppBody: `std::vector<std::vector<int>> matrix = data.value("matrix", std::vector<std::vector<int>>{});
int n = (int)matrix.size();
for (int i = 0; i < n; ++i) {
    for (int j = i + 1; j < n; ++j) std::swap(matrix[i][j], matrix[j][i]);
}
for (auto& row : matrix) std::reverse(row.begin(), row.end());
return matrix;`,
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
        pythonBody: `def solve(data):
    s = data.get("s", "")
    p = data.get("p", "")
    if len(p) > len(s):
        return []
    need = [0] * 26
    have = [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    ans = []
    for i, ch in enumerate(s):
        have[ord(ch) - 97] += 1
        if i >= len(p):
            have[ord(s[i - len(p)]) - 97] -= 1
        if i >= len(p) - 1 and have == need:
            ans.append(i - len(p) + 1)
    return ans`,
        javaBody: `String s = data.get("s").getAsString();
String p = data.get("p").getAsString();
if (p.length() > s.length()) return new ArrayList<>();
int[] need = new int[26], have = new int[26];
for (char ch : p.toCharArray()) need[ch - 'a']++;
List<Integer> ans = new ArrayList<>();
for (int i = 0; i < s.length(); i++) {
    have[s.charAt(i) - 'a']++;
    if (i >= p.length()) have[s.charAt(i - p.length()) - 'a']--;
    if (i >= p.length() - 1 && Arrays.equals(need, have)) ans.add(i - p.length() + 1);
}
return ans;`,
        cppBody: `std::string s = data["s"].get<std::string>();
std::string p = data["p"].get<std::string>();
if (p.size() > s.size()) return json::array();
std::array<int, 26> need{}, have{};
for (char ch : p) need[ch - 'a']++;
json ans = json::array();
for (int i = 0; i < (int)s.size(); ++i) {
    have[s[i] - 'a']++;
    if (i >= (int)p.size()) have[s[i - p.size()] - 'a']--;
    if (i >= (int)p.size() - 1 && have == need) ans.push_back(i - (int)p.size() + 1);
}
return ans;`,
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
        pythonBody: `def solve(data):
    from collections import Counter
    tasks = data.get("tasks", [])
    n = data.get("n", 0)
    if not tasks:
        return 0
    counts = Counter(tasks)
    max_freq = max(counts.values())
    max_count = sum(1 for v in counts.values() if v == max_freq)
    part = (max_freq - 1) * (n + 1) + max_count
    return max(len(tasks), part)`,
        javaBody: `JsonArray tasksA = data.has("tasks") && data.get("tasks").isJsonArray()
    ? data.getAsJsonArray("tasks") : new JsonArray();
int n = data.get("n").getAsInt();
int[] freq = new int[26];
for (JsonElement el : tasksA) freq[el.getAsString().charAt(0) - 'A']++;
int maxFreq = 0, maxCount = 0;
for (int f : freq) {
    if (f > maxFreq) {
        maxFreq = f;
        maxCount = 1;
    } else if (f == maxFreq && f > 0) {
        maxCount++;
    }
}
int part = (maxFreq - 1) * (n + 1) + maxCount;
return Math.max(tasksA.size(), part);`,
        cppBody: `std::vector<std::string> tasks = data.value("tasks", std::vector<std::string>{});
int n = data["n"].get<int>();
std::array<int, 26> freq{};
for (const std::string& t : tasks) freq[t[0] - 'A']++;
int maxFreq = 0, maxCount = 0;
for (int f : freq) {
    if (f > maxFreq) {
        maxFreq = f;
        maxCount = 1;
    } else if (f == maxFreq && f > 0) {
        maxCount++;
    }
}
int part = (maxFreq - 1) * (n + 1) + maxCount;
return std::max((int)tasks.size(), part);`,
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
