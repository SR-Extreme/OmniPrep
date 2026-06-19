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
        pythonBody: `    numRows = data.get("numRows", 0)
    res = []
    for i in range(numRows):
        row = [1] * (i + 1)
        for j in range(1, i):
            row[j] = res[i - 1][j - 1] + res[i - 1][j]
        res.append(row)
    return res`,
        javaBody: `
      int numRows = data.has("numRows") ? data.get("numRows").getAsInt() : 0;
      List<List<Integer>> res = new ArrayList<>();
      for (int i = 0; i < numRows; i++) {
          List<Integer> row = new ArrayList<>();
          for (int j = 0; j <= i; j++) {
              if (j == 0 || j == i) row.add(1);
              else row.add(res.get(i - 1).get(j - 1) + res.get(i - 1).get(j));
          }
          res.add(row);
      }
      return res;`,
        cppBody: `
      int numRows = data.value("numRows", 0);
      std::vector<std::vector<int>> res;
      for (int i = 0; i < numRows; ++i) {
          std::vector<int> row(i + 1, 1);
          for (int j = 1; j < i; ++j) row[j] = res[i - 1][j - 1] + res[i - 1][j];
          res.push_back(row);
      }
      return res;`,
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
        pythonBody: `    image = [row[:] for row in data.get("image", [])]
    sr, sc, color = data.get("sr", 0), data.get("sc", 0), data.get("color", 0)
    orig = image[sr][sc]
    if orig == color:
        return image
    m, n = len(image), len(image[0])
    stack = [(sr, sc)]
    image[sr][sc] = color
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and image[nr][nc] == orig:
                image[nr][nc] = color
                stack.append((nr, nc))
    return image`,
        javaBody: `
      JsonArray imageJson = data.getAsJsonArray("image");
      int m = imageJson.size();
      int[][] image = new int[m][];
      for (int i = 0; i < m; i++) {
          JsonArray row = imageJson.get(i).getAsJsonArray();
          image[i] = new int[row.size()];
          for (int j = 0; j < row.size(); j++) image[i][j] = row.get(j).getAsInt();
      }
      int sr = data.get("sr").getAsInt(), sc = data.get("sc").getAsInt(), color = data.get("color").getAsInt();
      int orig = image[sr][sc];
      if (orig == color) {
          JsonArray out = new JsonArray();
          for (int[] row : image) { JsonArray rj = new JsonArray(); for (int v : row) rj.add(v); out.add(rj); }
          return out;
      }
      ArrayDeque<int[]> st = new ArrayDeque<>();
      st.push(new int[]{sr, sc});
      image[sr][sc] = color;
      int n = image[0].length;
      int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
      while (!st.isEmpty()) {
          int[] cur = st.pop();
          for (int[] d : dirs) {
              int nr = cur[0] + d[0], nc = cur[1] + d[1];
              if (0 <= nr && nr < m && 0 <= nc && nc < n && image[nr][nc] == orig) {
                  image[nr][nc] = color;
                  st.push(new int[]{nr, nc});
              }
          }
      }
      JsonArray out = new JsonArray();
      for (int[] row : image) { JsonArray rj = new JsonArray(); for (int v : row) rj.add(v); out.add(rj); }
      return out;`,
        cppBody: `
      auto image = data["image"].get<std::vector<std::vector<int>>>();
      int sr = data["sr"].get<int>(), sc = data["sc"].get<int>(), color = data["color"].get<int>();
      int orig = image[sr][sc];
      if (orig == color) return image;
      int m = static_cast<int>(image.size()), n = static_cast<int>(image[0].size());
      std::vector<std::pair<int,int>> st = {{sr, sc}};
      image[sr][sc] = color;
      while (!st.empty()) {
          auto [r, c] = st.back(); st.pop_back();
          for (auto [dr, dc] : std::vector<std::pair<int,int>>{{1,0},{-1,0},{0,1},{0,-1}}) {
              int nr = r + dr, nc = c + dc;
              if (0 <= nr && nr < m && 0 <= nc && nc < n && image[nr][nc] == orig) {
                  image[nr][nc] = color;
                  st.push_back({nr, nc});
              }
          }
      }
      return image;`,
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
        pythonBody: `    def _build_tree(arr):
        if not arr:
            return None
        nodes = [None if v is None else {"val": v, "left": None, "right": None} for v in arr]
        for i, node in enumerate(nodes):
            if node is None:
                continue
            if i * 2 + 1 < len(nodes):
                node["left"] = nodes[i * 2 + 1]
            if i * 2 + 2 < len(nodes):
                node["right"] = nodes[i * 2 + 2]
        return nodes[0] if nodes else None
    def _same(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a["val"] == b["val"] and _same(a["left"], b["left"]) and _same(a["right"], b["right"])
    return _same(_build_tree(data.get("p", [])), _build_tree(data.get("q", [])))`,
        javaBody: `
      class TNode { Integer val; TNode left, right; }
      java.util.function.Function<JsonArray, TNode> buildTree = (arrJson) -> {
          java.util.List<Integer> vals = new java.util.ArrayList<>();
          for (JsonElement e : arrJson) {
              vals.add(e.isJsonNull() ? null : e.getAsInt());
          }
          if (vals.isEmpty()) return null;
          java.util.List<TNode> nodes = new java.util.ArrayList<>();
          for (Integer v : vals) {
              if (v == null) nodes.add(null);
              else { TNode n = new TNode(); n.val = v; nodes.add(n); }
          }
          for (int i = 0; i < nodes.size(); i++) {
              if (nodes.get(i) == null) continue;
              if (i * 2 + 1 < nodes.size()) nodes.get(i).left = nodes.get(i * 2 + 1);
              if (i * 2 + 2 < nodes.size()) nodes.get(i).right = nodes.get(i * 2 + 2);
          }
          return nodes.get(0);
      };
      TNode p = buildTree.apply(data.getAsJsonArray("p"));
      TNode q = buildTree.apply(data.getAsJsonArray("q"));
      java.util.function.BiFunction<TNode, TNode, Boolean> same = new java.util.function.BiFunction<>() {
          public Boolean apply(TNode a, TNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null) return false;
              return a.val.equals(b.val) && apply(a.left, b.left) && apply(a.right, b.right);
          }
      };
      return same.apply(p, q);`,
        cppBody: `
      struct TNode { int val; TNode* left; TNode* right; TNode(int v): val(v), left(nullptr), right(nullptr) {} };
      auto buildTree = [](const json& arrJson) -> TNode* {
          std::vector<std::optional<int>> vals;
          for (const auto& e : arrJson) {
              if (e.is_null()) vals.push_back(std::nullopt);
              else vals.push_back(e.get<int>());
          }
          if (vals.empty()) return nullptr;
          std::vector<TNode*> nodes;
          nodes.reserve(vals.size());
          for (auto v : vals) {
              nodes.push_back(v ? new TNode(*v) : nullptr);
          }
          for (size_t i = 0; i < nodes.size(); ++i) {
              if (!nodes[i]) continue;
              if (i * 2 + 1 < nodes.size()) nodes[i]->left = nodes[i * 2 + 1];
              if (i * 2 + 2 < nodes.size()) nodes[i]->right = nodes[i * 2 + 2];
          }
          return nodes[0];
      };
      TNode* p = buildTree(data["p"]);
      TNode* q = buildTree(data["q"]);
      std::function<bool(TNode*, TNode*)> same = [&](TNode* a, TNode* b) -> bool {
          if (!a && !b) return true;
          if (!a || !b) return false;
          return a->val == b->val && same(a->left, b->left) && same(a->right, b->right);
      };
      return same(p, q);`,
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
        pythonBody: `    def _build_tree(arr):
        if not arr:
            return None
        nodes = [None if v is None else {"val": v, "left": None, "right": None} for v in arr]
        for i, node in enumerate(nodes):
            if node is None:
                continue
            if i * 2 + 1 < len(nodes):
                node["left"] = nodes[i * 2 + 1]
            if i * 2 + 2 < len(nodes):
                node["right"] = nodes[i * 2 + 2]
        return nodes[0] if nodes else None
    def _mirror(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a["val"] == b["val"] and _mirror(a["left"], b["right"]) and _mirror(a["right"], b["left"])
    root = _build_tree(data.get("root", []))
    if root is None:
        return True
    return _mirror(root["left"], root["right"])`,
        javaBody: `
      class TNode { Integer val; TNode left, right; }
      java.util.function.Function<JsonArray, TNode> buildTree = (arrJson) -> {
          java.util.List<Integer> vals = new java.util.ArrayList<>();
          for (JsonElement e : arrJson) {
              vals.add(e.isJsonNull() ? null : e.getAsInt());
          }
          if (vals.isEmpty()) return null;
          java.util.List<TNode> nodes = new java.util.ArrayList<>();
          for (Integer v : vals) {
              if (v == null) nodes.add(null);
              else { TNode n = new TNode(); n.val = v; nodes.add(n); }
          }
          for (int i = 0; i < nodes.size(); i++) {
              if (nodes.get(i) == null) continue;
              if (i * 2 + 1 < nodes.size()) nodes.get(i).left = nodes.get(i * 2 + 1);
              if (i * 2 + 2 < nodes.size()) nodes.get(i).right = nodes.get(i * 2 + 2);
          }
          return nodes.get(0);
      };
      TNode root = buildTree.apply(data.getAsJsonArray("root"));
      if (root == null) return true;
      java.util.function.BiFunction<TNode, TNode, Boolean> mirror = new java.util.function.BiFunction<>() {
          public Boolean apply(TNode a, TNode b) {
              if (a == null && b == null) return true;
              if (a == null || b == null) return false;
              return a.val.equals(b.val) && apply(a.left, b.right) && apply(a.right, b.left);
          }
      };
      return mirror.apply(root.left, root.right);`,
        cppBody: `
      struct TNode { int val; TNode* left; TNode* right; TNode(int v): val(v), left(nullptr), right(nullptr) {} };
      auto buildTree = [](const json& arrJson) -> TNode* {
          std::vector<std::optional<int>> vals;
          for (const auto& e : arrJson) {
              if (e.is_null()) vals.push_back(std::nullopt);
              else vals.push_back(e.get<int>());
          }
          if (vals.empty()) return nullptr;
          std::vector<TNode*> nodes;
          nodes.reserve(vals.size());
          for (auto v : vals) {
              nodes.push_back(v ? new TNode(*v) : nullptr);
          }
          for (size_t i = 0; i < nodes.size(); ++i) {
              if (!nodes[i]) continue;
              if (i * 2 + 1 < nodes.size()) nodes[i]->left = nodes[i * 2 + 1];
              if (i * 2 + 2 < nodes.size()) nodes[i]->right = nodes[i * 2 + 2];
          }
          return nodes[0];
      };
      TNode* root = buildTree(data["root"]);
      if (!root) return true;
      std::function<bool(TNode*, TNode*)> mirror = [&](TNode* a, TNode* b) -> bool {
          if (!a && !b) return true;
          if (!a || !b) return false;
          return a->val == b->val && mirror(a->left, b->right) && mirror(a->right, b->left);
      };
      return mirror(root->left, root->right);`,
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
        pythonBody: `    def _build_tree(arr):
        if not arr:
            return None
        nodes = [None if v is None else {"val": v, "left": None, "right": None} for v in arr]
        for i, node in enumerate(nodes):
            if node is None:
                continue
            if i * 2 + 1 < len(nodes):
                node["left"] = nodes[i * 2 + 1]
            if i * 2 + 2 < len(nodes):
                node["right"] = nodes[i * 2 + 2]
        return nodes[0] if nodes else None
    def _depth(node):
        if node is None:
            return 0
        return 1 + max(_depth(node["left"]), _depth(node["right"]))
    return _depth(_build_tree(data.get("root", [])))`,
        javaBody: `
      class TNode { Integer val; TNode left, right; }
      java.util.function.Function<JsonArray, TNode> buildTree = (arrJson) -> {
          java.util.List<Integer> vals = new java.util.ArrayList<>();
          for (JsonElement e : arrJson) {
              vals.add(e.isJsonNull() ? null : e.getAsInt());
          }
          if (vals.isEmpty()) return null;
          java.util.List<TNode> nodes = new java.util.ArrayList<>();
          for (Integer v : vals) {
              if (v == null) nodes.add(null);
              else { TNode n = new TNode(); n.val = v; nodes.add(n); }
          }
          for (int i = 0; i < nodes.size(); i++) {
              if (nodes.get(i) == null) continue;
              if (i * 2 + 1 < nodes.size()) nodes.get(i).left = nodes.get(i * 2 + 1);
              if (i * 2 + 2 < nodes.size()) nodes.get(i).right = nodes.get(i * 2 + 2);
          }
          return nodes.get(0);
      };
      TNode root = buildTree.apply(data.getAsJsonArray("root"));
      java.util.function.Function<TNode, Integer> depth = new java.util.function.Function<>() {
          public Integer apply(TNode node) {
              if (node == null) return 0;
              return 1 + Math.max(apply(node.left), apply(node.right));
          }
      };
      return depth.apply(root);`,
        cppBody: `
      struct TNode { int val; TNode* left; TNode* right; TNode(int v): val(v), left(nullptr), right(nullptr) {} };
      auto buildTree = [](const json& arrJson) -> TNode* {
          std::vector<std::optional<int>> vals;
          for (const auto& e : arrJson) {
              if (e.is_null()) vals.push_back(std::nullopt);
              else vals.push_back(e.get<int>());
          }
          if (vals.empty()) return nullptr;
          std::vector<TNode*> nodes;
          nodes.reserve(vals.size());
          for (auto v : vals) {
              nodes.push_back(v ? new TNode(*v) : nullptr);
          }
          for (size_t i = 0; i < nodes.size(); ++i) {
              if (!nodes[i]) continue;
              if (i * 2 + 1 < nodes.size()) nodes[i]->left = nodes[i * 2 + 1];
              if (i * 2 + 2 < nodes.size()) nodes[i]->right = nodes[i * 2 + 2];
          }
          return nodes[0];
      };
      TNode* root = buildTree(data["root"]);
      std::function<int(TNode*)> depth = [&](TNode* node) -> int {
          if (!node) return 0;
          return 1 + std::max(depth(node->left), depth(node->right));
      };
      return depth(root);`,
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
        pythonBody: `    def _build_tree(arr):
        if not arr:
            return None
        nodes = [None if v is None else {"val": v, "left": None, "right": None} for v in arr]
        for i, node in enumerate(nodes):
            if node is None:
                continue
            if i * 2 + 1 < len(nodes):
                node["left"] = nodes[i * 2 + 1]
            if i * 2 + 2 < len(nodes):
                node["right"] = nodes[i * 2 + 2]
        return nodes[0] if nodes else None
    best = 0
    def _dfs(node):
        nonlocal best
        if node is None:
            return 0
        left = _dfs(node["left"])
        right = _dfs(node["right"])
        best = max(best, left + right)
        return 1 + max(left, right)
    _dfs(_build_tree(data.get("root", [])))
    return best`,
        javaBody: `
      class TNode { Integer val; TNode left, right; }
      java.util.function.Function<JsonArray, TNode> buildTree = (arrJson) -> {
          java.util.List<Integer> vals = new java.util.ArrayList<>();
          for (JsonElement e : arrJson) {
              vals.add(e.isJsonNull() ? null : e.getAsInt());
          }
          if (vals.isEmpty()) return null;
          java.util.List<TNode> nodes = new java.util.ArrayList<>();
          for (Integer v : vals) {
              if (v == null) nodes.add(null);
              else { TNode n = new TNode(); n.val = v; nodes.add(n); }
          }
          for (int i = 0; i < nodes.size(); i++) {
              if (nodes.get(i) == null) continue;
              if (i * 2 + 1 < nodes.size()) nodes.get(i).left = nodes.get(i * 2 + 1);
              if (i * 2 + 2 < nodes.size()) nodes.get(i).right = nodes.get(i * 2 + 2);
          }
          return nodes.get(0);
      };
      TNode root = buildTree.apply(data.getAsJsonArray("root"));
      int[] best = {0};
      class Dfs {
          int go(TNode node) {
              if (node == null) return 0;
              int left = go(node.left), right = go(node.right);
              best[0] = Math.max(best[0], left + right);
              return 1 + Math.max(left, right);
          }
      }
      new Dfs().go(root);
      return best[0];`,
        cppBody: `
      struct TNode { int val; TNode* left; TNode* right; TNode(int v): val(v), left(nullptr), right(nullptr) {} };
      auto buildTree = [](const json& arrJson) -> TNode* {
          std::vector<std::optional<int>> vals;
          for (const auto& e : arrJson) {
              if (e.is_null()) vals.push_back(std::nullopt);
              else vals.push_back(e.get<int>());
          }
          if (vals.empty()) return nullptr;
          std::vector<TNode*> nodes;
          nodes.reserve(vals.size());
          for (auto v : vals) {
              nodes.push_back(v ? new TNode(*v) : nullptr);
          }
          for (size_t i = 0; i < nodes.size(); ++i) {
              if (!nodes[i]) continue;
              if (i * 2 + 1 < nodes.size()) nodes[i]->left = nodes[i * 2 + 1];
              if (i * 2 + 2 < nodes.size()) nodes[i]->right = nodes[i * 2 + 2];
          }
          return nodes[0];
      };
      TNode* root = buildTree(data["root"]);
      int best = 0;
      std::function<int(TNode*)> dfs = [&](TNode* node) -> int {
          if (!node) return 0;
          int left = dfs(node->left), right = dfs(node->right);
          best = std::max(best, left + right);
          return 1 + std::max(left, right);
      };
      dfs(root);
      return best;`,
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
        pythonBody: `    head_vals, pos = data.get("head", []), data.get("pos", -1)
    if not head_vals:
        return False
    nodes = [{"val": v, "next": None} for v in head_vals]
    for i in range(len(nodes) - 1):
        nodes[i]["next"] = nodes[i + 1]
    if pos >= 0:
        nodes[-1]["next"] = nodes[pos]
    slow = fast = nodes[0]
    while fast and fast.get("next"):
        slow = slow["next"]
        fast = fast["next"]["next"]
        if slow is fast:
            return True
    return False`,
        javaBody: `
      JsonArray headJson = data.getAsJsonArray("head");
      int pos = data.get("pos").getAsInt();
      class LNode { int val; LNode next; LNode(int v){ val = v; } }
      LNode dummy = new LNode(0), tail = dummy;
      java.util.List<LNode> nodes = new java.util.ArrayList<>();
      for (JsonElement e : headJson) {
          LNode n = new LNode(e.getAsInt());
          nodes.add(n);
          tail.next = n; tail = n;
      }
      if (pos >= 0 && !nodes.isEmpty()) nodes.get(nodes.size() - 1).next = nodes.get(pos);
      LNode slow = dummy.next, fast = dummy.next;
      while (fast != null && fast.next != null) {
          slow = slow.next;
          fast = fast.next.next;
          if (slow == fast) return true;
      }
      return false;`,
        cppBody: `
      auto headJson = data["head"];
      int pos = data["pos"].get<int>();
      struct LNode { int val; LNode* next; LNode(int v): val(v), next(nullptr) {} };
      LNode* head = nullptr; LNode* tail = nullptr;
      std::vector<LNode*> nodes;
      for (const auto& e : headJson) {
          auto* n = new LNode(e.get<int>());
          nodes.push_back(n);
          if (!head) head = n; else tail->next = n;
          tail = n;
      }
      if (pos >= 0 && !nodes.empty()) nodes.back()->next = nodes[pos];
      LNode *slow = head, *fast = head;
      while (fast && fast->next) {
          slow = slow->next;
          fast = fast->next->next;
          if (slow == fast) return true;
      }
      return false;`,
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
        pythonBody: `    vals = data.get("head", [])
    return vals == vals[::-1]`,
        javaBody: `
      JsonArray headJson = data.getAsJsonArray("head");
      java.util.List<Integer> vals = new java.util.ArrayList<>();
      for (JsonElement e : headJson) vals.add(e.getAsInt());
      int i = 0, j = vals.size() - 1;
      while (i < j) {
          if (!vals.get(i++).equals(vals.get(j--))) return false;
      }
      return true;`,
        cppBody: `
      std::vector<int> vals = data["head"].get<std::vector<int>>();
      int i = 0, j = static_cast<int>(vals.size()) - 1;
      while (i < j) {
          if (vals[i++] != vals[j--]) return false;
      }
      return true;`,
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
        pythonBody: `    ops, args = data.get("ops", []), data.get("args", [])
    stack, mins, out = [], [], []
    for op, a in zip(ops, args):
        if op == "push":
            x = a[0]
            stack.append(x)
            mins.append(x if not mins else min(x, mins[-1]))
            out.append(None)
        elif op == "pop":
            stack.pop(); mins.pop(); out.append(None)
        elif op == "top":
            out.append(stack[-1])
        elif op == "getMin":
            out.append(mins[-1])
    return out`,
        javaBody: `
      JsonArray ops = data.getAsJsonArray("ops");
      JsonArray args = data.getAsJsonArray("args");
      ArrayDeque<Integer> stack = new ArrayDeque<>();
      ArrayDeque<Integer> mins = new ArrayDeque<>();
      JsonArray out = new JsonArray();
      for (int i = 0; i < ops.size(); i++) {
          String op = ops.get(i).getAsString();
          JsonArray a = args.get(i).getAsJsonArray();
          if ("push".equals(op)) {
              int x = a.get(0).getAsInt();
              stack.push(x);
              mins.push(mins.isEmpty() ? x : Math.min(x, mins.peek()));
              out.add(JsonNull.INSTANCE);
          } else if ("pop".equals(op)) {
              stack.pop(); mins.pop(); out.add(JsonNull.INSTANCE);
          } else if ("top".equals(op)) {
              out.add(stack.peek());
          } else if ("getMin".equals(op)) {
              out.add(mins.peek());
          }
      }
      return out;`,
        cppBody: `
      auto ops = data["ops"];
      auto args = data["args"];
      std::vector<int> stack, mins;
      json out = json::array();
      for (size_t i = 0; i < ops.size(); ++i) {
          std::string op = ops[i].get<std::string>();
          auto a = args[i];
          if (op == "push") {
              int x = a[0].get<int>();
              stack.push_back(x);
              mins.push_back(mins.empty() ? x : std::min(x, mins.back()));
              out.push_back(nullptr);
          } else if (op == "pop") {
              stack.pop_back(); mins.pop_back(); out.push_back(nullptr);
          } else if (op == "top") {
              out.push_back(stack.back());
          } else if (op == "getMin") {
              out.push_back(mins.back());
          }
      }
      return out;`,
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
        pythonBody: `    ops, args = data.get("ops", []), data.get("args", [])
    in_st, out_st, out = [], [], []
    for op, a in zip(ops, args):
        if op == "push":
            in_st.append(a[0]); out.append(None)
        elif op == "pop":
            if not out_st:
                while in_st: out_st.append(in_st.pop())
            out.append(out_st.pop())
        elif op == "peek":
            if not out_st:
                while in_st: out_st.append(in_st.pop())
            out.append(out_st[-1])
        elif op == "empty":
            out.append(not in_st and not out_st)
    return out`,
        javaBody: `
      JsonArray ops = data.getAsJsonArray("ops");
      JsonArray args = data.getAsJsonArray("args");
      ArrayDeque<Integer> inSt = new ArrayDeque<>(), outSt = new ArrayDeque<>();
      JsonArray out = new JsonArray();
      for (int i = 0; i < ops.size(); i++) {
          String op = ops.get(i).getAsString();
          JsonArray a = args.get(i).getAsJsonArray();
          if ("push".equals(op)) { inSt.push(a.get(0).getAsInt()); out.add(JsonNull.INSTANCE); }
          else if ("pop".equals(op)) {
              if (outSt.isEmpty()) while (!inSt.isEmpty()) outSt.push(inSt.pop());
              out.add(outSt.pop());
          } else if ("peek".equals(op)) {
              if (outSt.isEmpty()) while (!inSt.isEmpty()) outSt.push(inSt.pop());
              out.add(outSt.peek());
          } else if ("empty".equals(op)) {
              out.add(inSt.isEmpty() && outSt.isEmpty());
          }
      }
      return out;`,
        cppBody: `
      auto ops = data["ops"]; auto args = data["args"];
      std::vector<int> inSt, outSt; json out = json::array();
      for (size_t i = 0; i < ops.size(); ++i) {
          std::string op = ops[i].get<std::string>(); auto a = args[i];
          if (op == "push") { inSt.push_back(a[0].get<int>()); out.push_back(nullptr); }
          else if (op == "pop") {
              if (outSt.empty()) while (!inSt.empty()) { outSt.push_back(inSt.back()); inSt.pop_back(); }
              out.push_back(outSt.back()); outSt.pop_back();
          } else if (op == "peek") {
              if (outSt.empty()) while (!inSt.empty()) { outSt.push_back(inSt.back()); inSt.pop_back(); }
              out.push_back(outSt.back());
          } else if (op == "empty") {
              out.push_back(inSt.empty() && outSt.empty());
          }
      }
      return out;`,
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
        pythonBody: `    nums = sorted(data.get("nums", []))
    res, n = [], len(nums)
    for i in range(n):
        if i and nums[i] == nums[i - 1]:
            continue
        if nums[i] > 0:
            break
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s == 0:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return res`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      List<Integer> nums = new ArrayList<>();
      for (JsonElement e : numsJson) nums.add(e.getAsInt());
      Collections.sort(nums);
      List<List<Integer>> res = new ArrayList<>();
      int n = nums.size();
      for (int i = 0; i < n; i++) {
          if (i > 0 && nums.get(i).equals(nums.get(i - 1))) continue;
          if (nums.get(i) > 0) break;
          int l = i + 1, r = n - 1;
          while (l < r) {
              int s = nums.get(i) + nums.get(l) + nums.get(r);
              if (s == 0) {
                  res.add(Arrays.asList(nums.get(i), nums.get(l), nums.get(r)));
                  l++; r--;
                  while (l < r && nums.get(l).equals(nums.get(l - 1))) l++;
                  while (l < r && nums.get(r).equals(nums.get(r + 1))) r--;
              } else if (s < 0) l++; else r--;
          }
      }
      return res;`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      std::sort(nums.begin(), nums.end());
      std::vector<std::vector<int>> res;
      int n = static_cast<int>(nums.size());
      for (int i = 0; i < n; ++i) {
          if (i > 0 && nums[i] == nums[i - 1]) continue;
          if (nums[i] > 0) break;
          int l = i + 1, r = n - 1;
          while (l < r) {
              int s = nums[i] + nums[l] + nums[r];
              if (s == 0) {
                  res.push_back({nums[i], nums[l], nums[r]});
                  ++l; --r;
                  while (l < r && nums[l] == nums[l - 1]) ++l;
                  while (l < r && nums[r] == nums[r + 1]) --r;
              } else if (s < 0) ++l; else --r;
          }
      }
      return res;`,
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
        pythonBody: `    s = data.get("s", "")
    last, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      Map<Character, Integer> last = new HashMap<>();
      int left = 0, best = 0;
      for (int right = 0; right < s.length(); right++) {
          char ch = s.charAt(right);
          if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
          last.put(ch, right);
          best = Math.max(best, right - left + 1);
      }
      return best;`,
        cppBody: `
      std::string s = data.value("s", std::string{});
      std::unordered_map<char, int> last;
      int left = 0, best = 0;
      for (int right = 0; right < static_cast<int>(s.size()); ++right) {
          char ch = s[right];
          auto it = last.find(ch);
          if (it != last.end() && it->second >= left) left = it->second + 1;
          last[ch] = right;
          best = std::max(best, right - left + 1);
      }
      return best;`,
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
        pythonBody: `    h = data.get("height", [])
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, min(h[l], h[r]) * (r - l))
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    return best`,
        javaBody: `
      JsonArray hJson = data.has("height") ? data.getAsJsonArray("height") : new JsonArray();
      List<Integer> h = new ArrayList<>();
      for (JsonElement e : hJson) h.add(e.getAsInt());
      int l = 0, r = h.size() - 1, best = 0;
      while (l < r) {
          best = Math.max(best, Math.min(h.get(l), h.get(r)) * (r - l));
          if (h.get(l) < h.get(r)) l++; else r--;
      }
      return best;`,
        cppBody: `
      std::vector<int> h = data.value("height", std::vector<int>{});
      int l = 0, r = static_cast<int>(h.size()) - 1, best = 0;
      while (l < r) {
          best = std::max(best, std::min(h[l], h[r]) * (r - l));
          if (h[l] < h[r]) ++l; else --r;
      }
      return best;`,
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
        pythonBody: `    grid = data.get("grid", [])
    if not grid:
        return 0
    m, n = len(grid), len(grid[0])
    vis = [[False] * n for _ in range(m)]
    ans = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == "1" and not vis[i][j]:
                ans += 1
                st = [(i, j)]
                vis[i][j] = True
                while st:
                    x, y = st.pop()
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == "1":
                            vis[nx][ny] = True
                            st.append((nx, ny))
    return ans`,
        javaBody: `
      JsonArray grid = data.has("grid") ? data.getAsJsonArray("grid") : new JsonArray();
      int m = grid.size();
      if (m == 0) return 0;
      int n = grid.get(0).getAsJsonArray().size();
      boolean[][] vis = new boolean[m][n];
      int ans = 0;
      int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
      for (int i = 0; i < m; i++) {
          JsonArray row = grid.get(i).getAsJsonArray();
          for (int j = 0; j < n; j++) {
              if (!"1".equals(row.get(j).getAsString()) || vis[i][j]) continue;
              ans++;
              ArrayDeque<int[]> st = new ArrayDeque<>();
              st.push(new int[]{i, j}); vis[i][j] = true;
              while (!st.isEmpty()) {
                  int[] cur = st.pop();
                  for (int[] d : dirs) {
                      int nx = cur[0] + d[0], ny = cur[1] + d[1];
                      if (0 <= nx && nx < m && 0 <= ny && ny < n && !vis[nx][ny]
                              && "1".equals(grid.get(nx).getAsJsonArray().get(ny).getAsString())) {
                          vis[nx][ny] = true; st.push(new int[]{nx, ny});
                      }
                  }
              }
          }
      }
      return ans;`,
        cppBody: `
      if (!data.contains("grid") || !data["grid"].is_array() || data["grid"].empty()) return 0;
      const auto& grid = data["grid"];
      int m = static_cast<int>(grid.size()), n = static_cast<int>(grid[0].size());
      std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
      auto isLand = [&](int r, int c) { return grid[r][c].get<std::string>() == "1"; };
      int ans = 0;
      for (int i = 0; i < m; ++i) {
          for (int j = 0; j < n; ++j) {
              if (!isLand(i, j) || vis[i][j]) continue;
              ++ans;
              std::vector<std::pair<int,int>> st = {{i, j}}; vis[i][j] = true;
              while (!st.empty()) {
                  auto [x, y] = st.back(); st.pop_back();
                  for (auto [dx, dy] : std::vector<std::pair<int,int>>{{1,0},{-1,0},{0,1},{0,-1}}) {
                      int nx = x + dx, ny = y + dy;
                      if (0 <= nx && nx < m && 0 <= ny && ny < n && !vis[nx][ny] && isLand(nx, ny)) {
                          vis[nx][ny] = true; st.push_back({nx, ny});
                      }
                  }
              }
          }
      }
      return ans;`,
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
        pythonBody: `    coins, amount = data.get("coins", []), data.get("amount", 0)
    inf = amount + 1
    dp = [0] + [inf] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return -1 if dp[amount] == inf else dp[amount]`,
        javaBody: `
      JsonArray coinsJson = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
      List<Integer> coins = new ArrayList<>();
      for (JsonElement e : coinsJson) coins.add(e.getAsInt());
      int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
      int inf = amount + 1;
      int[] dp = new int[amount + 1];
      Arrays.fill(dp, inf); dp[0] = 0;
      for (int a = 1; a <= amount; a++) {
          for (int c : coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
      }
      return dp[amount] == inf ? -1 : dp[amount];`,
        cppBody: `
      std::vector<int> coins = data.value("coins", std::vector<int>{});
      int amount = data.value("amount", 0);
      int inf = amount + 1;
      std::vector<int> dp(amount + 1, inf); dp[0] = 0;
      for (int a = 1; a <= amount; ++a) {
          for (int c : coins) if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
      }
      return dp[amount] == inf ? -1 : dp[amount];`,
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
        pythonBody: `    from collections import Counter
    nums, k = data.get("nums", []), data.get("k", 0)
    cnt = Counter(nums)
    return sorted(x for x, _ in cnt.most_common(k))`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      int k = data.has("k") ? data.get("k").getAsInt() : 0;
      Map<Integer, Integer> cnt = new HashMap<>();
      for (JsonElement e : numsJson) cnt.put(e.getAsInt(), cnt.getOrDefault(e.getAsInt(), 0) + 1);
      List<Map.Entry<Integer, Integer>> entries = new ArrayList<>(cnt.entrySet());
      entries.sort((a, b) -> b.getValue() - a.getValue());
      List<Integer> res = new ArrayList<>();
      for (int i = 0; i < k && i < entries.size(); i++) res.add(entries.get(i).getKey());
      Collections.sort(res);
      return res;`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      int k = data.value("k", 0);
      std::unordered_map<int, int> cnt;
      for (int x : nums) ++cnt[x];
      std::vector<std::pair<int,int>> entries(cnt.begin(), cnt.end());
      std::sort(entries.begin(), entries.end(), [](auto& a, auto& b) { return a.second > b.second; });
      std::vector<int> res;
      for (int i = 0; i < k && i < static_cast<int>(entries.size()); ++i) res.push_back(entries[i].first);
      std::sort(res.begin(), res.end());
      return res;`,
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
        pythonBody: `    nums = sorted(data.get("nums", []), reverse=True)
    k = data.get("k", 1)
    return nums[k - 1]`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      List<Integer> nums = new ArrayList<>();
      for (JsonElement e : numsJson) nums.add(e.getAsInt());
      int k = data.has("k") ? data.get("k").getAsInt() : 1;
      nums.sort(Collections.reverseOrder());
      return nums.get(k - 1);`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      int k = data.value("k", 1);
      std::sort(nums.begin(), nums.end(), std::greater<int>());
      return nums[k - 1];`,
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
        pythonBody: `    nums = data.get("nums", [])
    n = len(nums)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
    suffix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suffix
        suffix *= nums[i]
    return res`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      int n = numsJson.size();
      int[] res = new int[n];
      int prefix = 1;
      for (int i = 0; i < n; i++) { res[i] = prefix; prefix *= numsJson.get(i).getAsInt(); }
      int suffix = 1;
      for (int i = n - 1; i >= 0; i--) { res[i] *= suffix; suffix *= numsJson.get(i).getAsInt(); }
      List<Integer> out = new ArrayList<>();
      for (int v : res) out.add(v);
      return out;`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      int n = static_cast<int>(nums.size());
      std::vector<int> res(n, 1);
      int prefix = 1;
      for (int i = 0; i < n; ++i) { res[i] = prefix; prefix *= nums[i]; }
      int suffix = 1;
      for (int i = n - 1; i >= 0; --i) { res[i] *= suffix; suffix *= nums[i]; }
      return res;`,
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
        pythonBody: `    matrix = [row[:] for row in data.get("matrix", [])]
    if not matrix:
        return matrix
    m, n = len(matrix), len(matrix[0])
    row0 = col0 = False
    for j in range(n):
        if matrix[0][j] == 0:
            row0 = True
    for i in range(m):
        if matrix[i][0] == 0:
            col0 = True
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][j] == 0:
                matrix[i][0] = matrix[0][j] = 0
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if row0:
        matrix[0] = [0] * n
    if col0:
        for i in range(m):
            matrix[i][0] = 0
    return matrix`,
        javaBody: `
      JsonArray matrixJson = data.getAsJsonArray("matrix");
      int m = matrixJson.size();
      int[][] matrix = new int[m][];
      for (int i = 0; i < m; i++) {
          JsonArray row = matrixJson.get(i).getAsJsonArray();
          matrix[i] = new int[row.size()];
          for (int j = 0; j < row.size(); j++) matrix[i][j] = row.get(j).getAsInt();
      }
      int n = matrix[0].length;
      boolean row0 = false, col0 = false;
      for (int j = 0; j < n; j++) if (matrix[0][j] == 0) row0 = true;
      for (int i = 0; i < m; i++) if (matrix[i][0] == 0) col0 = true;
      for (int i = 1; i < m; i++) for (int j = 1; j < n; j++)
          if (matrix[i][j] == 0) { matrix[i][0] = 0; matrix[0][j] = 0; }
      for (int i = 1; i < m; i++) for (int j = 1; j < n; j++)
          if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
      if (row0) for (int j = 0; j < n; j++) matrix[0][j] = 0;
      if (col0) for (int i = 0; i < m; i++) matrix[i][0] = 0;
      JsonArray out = new JsonArray();
      for (int[] row : matrix) { JsonArray rj = new JsonArray(); for (int v : row) rj.add(v); out.add(rj); }
      return out;`,
        cppBody: `
      auto matrix = data["matrix"].get<std::vector<std::vector<int>>>();
      if (matrix.empty()) return matrix;
      int m = static_cast<int>(matrix.size()), n = static_cast<int>(matrix[0].size());
      bool row0 = false, col0 = false;
      for (int j = 0; j < n; ++j) if (matrix[0][j] == 0) row0 = true;
      for (int i = 0; i < m; ++i) if (matrix[i][0] == 0) col0 = true;
      for (int i = 1; i < m; ++i) for (int j = 1; j < n; ++j)
          if (matrix[i][j] == 0) matrix[i][0] = matrix[0][j] = 0;
      for (int i = 1; i < m; ++i) for (int j = 1; j < n; ++j)
          if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
      if (row0) std::fill(matrix[0].begin(), matrix[0].end(), 0);
      if (col0) for (int i = 0; i < m; ++i) matrix[i][0] = 0;
      return matrix;`,
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
        pythonBody: `    from collections import defaultdict
    groups = defaultdict(list)
    for s in data.get("strs", []):
        groups[tuple(sorted(s))].append(s)
    return sorted([sorted(v) for v in groups.values()])`,
        javaBody: `
      JsonArray strsJson = data.has("strs") ? data.getAsJsonArray("strs") : new JsonArray();
      Map<String, List<String>> groups = new HashMap<>();
      for (JsonElement e : strsJson) {
          String s = e.getAsString();
          char[] arr = s.toCharArray(); Arrays.sort(arr);
          String key = new String(arr);
          groups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
      }
      List<List<String>> res = new ArrayList<>();
      for (List<String> g : groups.values()) { Collections.sort(g); res.add(g); }
      res.sort(Comparator.comparing(a -> a.get(0)));
      return res;`,
        cppBody: `
      std::vector<std::string> strs = data.value("strs", std::vector<std::string>{});
      std::map<std::string, std::vector<std::string>> groups;
      for (const std::string& s : strs) {
          std::string key = s; std::sort(key.begin(), key.end());
          groups[key].push_back(s);
      }
      std::vector<std::vector<std::string>> res;
      for (auto& [k, g] : groups) { std::sort(g.begin(), g.end()); res.push_back(g); }
      std::sort(res.begin(), res.end(), [](auto& a, auto& b) { return a[0] < b[0]; });
      return res;`,
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
        pythonBody: `    from itertools import permutations
    nums = data.get("nums", [])
    return sorted([list(p) for p in permutations(nums)])`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      List<Integer> nums = new ArrayList<>();
      for (JsonElement e : numsJson) nums.add(e.getAsInt());
      Collections.sort(nums);
      List<List<Integer>> res = new ArrayList<>();
      boolean[] used = new boolean[nums.size()];
      List<Integer> path = new ArrayList<>();
      java.util.function.Runnable dfs = new java.util.function.Runnable() {
          public void run() {
              if (path.size() == nums.size()) { res.add(new ArrayList<>(path)); return; }
              for (int i = 0; i < nums.size(); i++) {
                  if (used[i]) continue;
                  used[i] = true; path.add(nums.get(i)); run(); path.remove(path.size() - 1); used[i] = false;
              }
          }
      };
      dfs.run();
      res.sort(Comparator.comparing(a -> a.toString()));
      return res;`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      std::sort(nums.begin(), nums.end());
      std::vector<std::vector<int>> res;
      std::vector<int> path;
      std::vector<bool> used(nums.size(), false);
      std::function<void()> dfs = [&]() {
          if (path.size() == nums.size()) { res.push_back(path); return; }
          for (size_t i = 0; i < nums.size(); ++i) {
              if (used[i]) continue;
              used[i] = true; path.push_back(nums[i]); dfs(); path.pop_back(); used[i] = false;
          }
      };
      dfs();
      std::sort(res.begin(), res.end());
      return res;`,
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
        pythonBody: `    candidates, target = sorted(data.get("candidates", [])), data.get("target", 0)
    res = []
    def dfs(start, path, rem):
        if rem == 0:
            res.append(path[:]); return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > rem:
                break
            path.append(c)
            dfs(i, path, rem - c)
            path.pop()
    dfs(0, [], target)
    return sorted(res)`,
        javaBody: `
      JsonArray candJson = data.has("candidates") ? data.getAsJsonArray("candidates") : new JsonArray();
      List<Integer> candidates = new ArrayList<>();
      for (JsonElement e : candJson) candidates.add(e.getAsInt());
      Collections.sort(candidates);
      int target = data.has("target") ? data.get("target").getAsInt() : 0;
      List<List<Integer>> res = new ArrayList<>();
      List<Integer> path = new ArrayList<>();
      class Dfs {
          void go(int start, int rem) {
              if (rem == 0) { res.add(new ArrayList<>(path)); return; }
              for (int i = start; i < candidates.size(); i++) {
                  int c = candidates.get(i);
                  if (c > rem) break;
                  path.add(c); go(i, rem - c); path.remove(path.size() - 1);
              }
          }
      }
      new Dfs().go(0, target);
      res.sort(Comparator.comparing(a -> a.toString()));
      return res;`,
        cppBody: `
      std::vector<int> candidates = data.value("candidates", std::vector<int>{});
      int target = data.value("target", 0);
      std::sort(candidates.begin(), candidates.end());
      std::vector<std::vector<int>> res;
      std::vector<int> path;
      std::function<void(int,int)> dfs = [&](int start, int rem) {
          if (rem == 0) { res.push_back(path); return; }
          for (int i = start; i < static_cast<int>(candidates.size()); ++i) {
              int c = candidates[i];
              if (c > rem) break;
              path.push_back(c); dfs(i, rem - c); path.pop_back();
          }
      };
      dfs(0, target);
      std::sort(res.begin(), res.end());
      return res;`,
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
        pythonBody: `    nums = sorted(data.get("nums", []))
    res = [[]]
    for num in nums:
        res += [s + [num] for s in res]
    return sorted(res)`,
        javaBody: `
      JsonArray numsJson = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
      List<Integer> nums = new ArrayList<>();
      for (JsonElement e : numsJson) nums.add(e.getAsInt());
      Collections.sort(nums);
      List<List<Integer>> res = new ArrayList<>();
      res.add(new ArrayList<>());
      for (int num : nums) {
          int sz = res.size();
          for (int i = 0; i < sz; i++) {
              List<Integer> nxt = new ArrayList<>(res.get(i)); nxt.add(num); res.add(nxt);
          }
      }
      res.sort(Comparator.comparing(a -> a.toString()));
      return res;`,
        cppBody: `
      std::vector<int> nums = data.value("nums", std::vector<int>{});
      std::sort(nums.begin(), nums.end());
      std::vector<std::vector<int>> res = {{}};
      for (int num : nums) {
          int sz = static_cast<int>(res.size());
          for (int i = 0; i < sz; ++i) {
              auto nxt = res[i]; nxt.push_back(num); res.push_back(nxt);
          }
      }
      std::sort(res.begin(), res.end());
      return res;`,
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
        pythonBody: `    board = [row[:] for row in data.get("board", [])]
    word = data.get("word", "")
    m, n = len(board), len(board[0]) if board else 0
    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != word[i]:
            return False
        ch = board[r][c]
        board[r][c] = "#"
        ok = any(dfs(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = ch
        return ok
    return any(dfs(i, j, 0) for i in range(m) for j in range(n))`,
        javaBody: `
      JsonArray boardJson = data.getAsJsonArray("board");
      int m = boardJson.size();
      char[][] board = new char[m][];
      for (int i = 0; i < m; i++) {
          JsonArray row = boardJson.get(i).getAsJsonArray();
          board[i] = new char[row.size()];
          for (int j = 0; j < row.size(); j++) board[i][j] = row.get(j).getAsString().charAt(0);
      }
      String word = data.get("word").getAsString();
      int n = board[0].length;
      class Dfs {
          boolean go(int r, int c, int i) {
              if (i == word.length()) return true;
              if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != word.charAt(i)) return false;
              char ch = board[r][c]; board[r][c] = '#';
              boolean ok = go(r + 1, c, i + 1) || go(r - 1, c, i + 1) || go(r, c + 1, i + 1) || go(r, c - 1, i + 1);
              board[r][c] = ch; return ok;
          }
      }
      Dfs dfs = new Dfs();
      for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) if (dfs.go(i, j, 0)) return true;
      return false;`,
        cppBody: `
      auto boardJson = data["board"];
      int m = static_cast<int>(boardJson.size());
      std::vector<std::vector<char>> board(m);
      for (int i = 0; i < m; ++i) {
          for (const auto& e : boardJson[i]) board[i].push_back(e.get<std::string>()[0]);
      }
      std::string word = data["word"].get<std::string>();
      int n = static_cast<int>(board[0].size());
      std::function<bool(int,int,int)> dfs = [&](int r, int c, int i) -> bool {
          if (i == static_cast<int>(word.size())) return true;
          if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != word[i]) return false;
          char ch = board[r][c]; board[r][c] = '#';
          bool ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
          board[r][c] = ch; return ok;
      };
      for (int i = 0; i < m; ++i) for (int j = 0; j < n; ++j) if (dfs(i, j, 0)) return true;
      return false;`,
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
        pythonBody: `    s = data.get("s", "")
    if not s or s[0] == "0":
        return 0
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        one = int(s[i - 1 : i])
        two = int(s[i - 2 : i])
        if one:
            dp[i] += dp[i - 1]
        if 10 <= two <= 26:
            dp[i] += dp[i - 2]
    return dp[n]`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      if (s.isEmpty() || s.charAt(0) == '0') return 0;
      int n = s.length();
      int[] dp = new int[n + 1];
      dp[0] = dp[1] = 1;
      for (int i = 2; i <= n; i++) {
          int one = s.charAt(i - 1) - '0';
          int two = Integer.parseInt(s.substring(i - 2, i));
          if (one != 0) dp[i] += dp[i - 1];
          if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
      }
      return dp[n];`,
        cppBody: `
      std::string s = data.value("s", std::string{});
      if (s.empty() || s[0] == '0') return 0;
      int n = static_cast<int>(s.size());
      std::vector<int> dp(n + 1, 0);
      dp[0] = dp[1] = 1;
      for (int i = 2; i <= n; ++i) {
          int one = s[i - 1] - '0';
          int two = std::stoi(s.substr(i - 2, 2));
          if (one != 0) dp[i] += dp[i - 1];
          if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
      }
      return dp[n];`,
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
