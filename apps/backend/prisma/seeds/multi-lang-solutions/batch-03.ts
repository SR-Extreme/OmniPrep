import { javaSolution, cppSolution, type MultiLangSolutionMap } from "../solution-wrappers.js";

export const BATCH_03: MultiLangSolutionMap = {
  "house-robber": {
    java: javaSolution(`
JsonArray coinsA = data.has("coins") && data.get("coins").isJsonArray() ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement el : coinsA) {
        int c = el.getAsInt();
        if (c <= a) {
            dp[a] = Math.min(dp[a], dp[a - c] + 1);
        }
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    cpp: cppSolution(`
std::vector<int> coins = data.value("coins", std::vector<int>{});
int amount = data.value("amount", 0);
int inf = amount + 1;
std::vector<int> dp(amount + 1, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (int c : coins) {
        if (c <= a) {
            dp[a] = std::min(dp[a], dp[a - c] + 1);
        }
    }
}
return dp[amount] == inf ? json(-1) : json(dp[amount]);
`)
  },
  "jump-game": {
    java: javaSolution(`
JsonArray pricesA = data.has("prices") && data.get("prices").isJsonArray() ? data.getAsJsonArray("prices") : new JsonArray();
if (pricesA.size() == 0) return 0;
int minPrice = pricesA.get(0).getAsInt();
int ans = 0;
for (int i = 1; i < pricesA.size(); i++) {
    int p = pricesA.get(i).getAsInt();
    ans = Math.max(ans, p - minPrice);
    minPrice = Math.min(minPrice, p);
}
return ans;
`),
    cpp: cppSolution(`
std::vector<int> prices = data.value("prices", std::vector<int>{});
if (prices.empty()) return 0;
int minPrice = prices[0];
int ans = 0;
for (size_t i = 1; i < prices.size(); i++) {
    int p = prices[i];
    ans = std::max(ans, p - minPrice);
    minPrice = std::min(minPrice, p);
}
return ans;
`)
  },
  "partition-labels": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.put(ch, right);
    best = Math.max(best, right - left + 1);
}
return best;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::unordered_map<char, int> last;
int left = 0;
int best = 0;
for (int right = 0; right < (int)s.size(); right++) {
    char ch = s[right];
    if (last.count(ch) && last[ch] >= left) left = last[ch] + 1;
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`)
  },
  "daily-temperatures": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Character> pairs = new HashMap<>();
pairs.put(')', '(');
pairs.put(']', '[');
pairs.put('}', '{');
Deque<Character> st = new ArrayDeque<>();
for (int i = 0; i < s.length(); i++) {
    char ch = s.charAt(i);
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push(ch);
    } else {
        if (st.isEmpty() || st.peek() != pairs.getOrDefault(ch, '#')) return false;
        st.pop();
    }
}
return st.isEmpty();
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
std::vector<char> st;
for (char ch : s) {
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push_back(ch);
    } else {
        if (st.empty() || st.back() != pairs[ch]) return false;
        st.pop_back();
    }
}
return st.empty();
`)
  },
  "evaluate-reverse-polish-notation": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Character> pairs = new HashMap<>();
pairs.put(')', '(');
pairs.put(']', '[');
pairs.put('}', '{');
Deque<Character> st = new ArrayDeque<>();
for (int i = 0; i < s.length(); i++) {
    char ch = s.charAt(i);
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push(ch);
    } else {
        if (st.isEmpty() || st.peek() != pairs.getOrDefault(ch, '#')) return false;
        st.pop();
    }
}
return st.isEmpty();
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
std::vector<char> st;
for (char ch : s) {
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push_back(ch);
    } else {
        if (st.empty() || st.back() != pairs[ch]) return false;
        st.pop_back();
    }
}
return st.empty();
`)
  },
  "binary-tree-level-order-traversal": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "binary-tree-right-side-view": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "validate-binary-search-tree": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0, hi = numsA.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    int v = numsA.get(mid).getAsInt();
    if (v == target) return mid;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = (int)nums.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`)
  },
  "lowest-common-ancestor-of-a-binary-tree": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "clone-graph": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "course-schedule": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "rotting-oranges": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "find-minimum-in-rotated-sorted-array": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0, hi = numsA.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    int v = numsA.get(mid).getAsInt();
    if (v == target) return mid;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = (int)nums.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`)
  },
  "search-in-rotated-sorted-array": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0, hi = numsA.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    int v = numsA.get(mid).getAsInt();
    if (v == target) return mid;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = (int)nums.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`)
  },
  "find-first-and-last-position-of-element-in-sorted-array": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0, hi = numsA.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    int v = numsA.get(mid).getAsInt();
    if (v == target) return mid;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = (int)nums.size() - 1;
while (lo <= hi) {
    int mid = (lo + hi) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`)
  },
  "longest-consecutive-sequence": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < numsA.size(); i++) {
    int x = numsA.get(i).getAsInt();
    int need = target - x;
    if (seen.containsKey(need)) return Arrays.asList(seen.get(need), i);
    seen.put(x, i);
}
return new ArrayList<Integer>();
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
std::unordered_map<int, int> seen;
for (int i = 0; i < (int)nums.size(); i++) {
    int x = nums[i];
    int need = target - x;
    if (seen.count(need)) return json::array({seen[need], i});
    seen[x] = i;
}
return json::array();
`)
  },
  "minimum-size-subarray-sum": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.put(ch, right);
    best = Math.max(best, right - left + 1);
}
return best;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::unordered_map<char, int> last;
int left = 0;
int best = 0;
for (int right = 0; right < (int)s.size(); right++) {
    char ch = s[right];
    if (last.count(ch) && last[ch] >= left) left = last[ch] + 1;
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`)
  },
  "minimum-window-substring-lite": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (last.containsKey(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.put(ch, right);
    best = Math.max(best, right - left + 1);
}
return best;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::unordered_map<char, int> last;
int left = 0;
int best = 0;
for (int right = 0; right < (int)s.size(); right++) {
    char ch = s[right];
    if (last.count(ch) && last[ch] >= left) left = last[ch] + 1;
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`)
  },
  "palindromic-substrings": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
int i = 0, j = s.length() - 1;
while (i < j) {
    while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
    while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
    if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
    i++;
    j--;
}
return true;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
int i = 0, j = (int)s.size() - 1;
while (i < j) {
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[i]))) i++;
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[j]))) j--;
    if (std::tolower(static_cast<unsigned char>(s[i])) != std::tolower(static_cast<unsigned char>(s[j]))) return false;
    i++;
    j--;
}
return true;
`)
  },
  "longest-palindromic-substring": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
int i = 0, j = s.length() - 1;
while (i < j) {
    while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
    while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
    if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) return false;
    i++;
    j--;
}
return true;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
int i = 0, j = (int)s.size() - 1;
while (i < j) {
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[i]))) i++;
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[j]))) j--;
    if (std::tolower(static_cast<unsigned char>(s[i])) != std::tolower(static_cast<unsigned char>(s[j]))) return false;
    i++;
    j--;
}
return true;
`)
  },
  "sort-colors": {
    java: javaSolution(`
JsonArray numsA = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
int n = numsA.size();
int[] nums = new int[n];
for (int i = 0; i < n; i++) nums[i] = numsA.get(i).getAsInt();
Arrays.sort(nums);
List<List<Integer>> res = new ArrayList<>();
for (int i = 0; i < n; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;
    if (nums[i] > 0) break;
    int l = i + 1, r = n - 1;
    while (l < r) {
        int sum = nums[i] + nums[l] + nums[r];
        if (sum == 0) {
            res.add(Arrays.asList(nums[i], nums[l], nums[r]));
            l++;
            r--;
            while (l < r && nums[l] == nums[l - 1]) l++;
            while (l < r && nums[r] == nums[r + 1]) r--;
        } else if (sum < 0) l++;
        else r--;
    }
}
return res;
`),
    cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
std::sort(nums.begin(), nums.end());
json res = json::array();
int n = (int)nums.size();
for (int i = 0; i < n; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;
    if (nums[i] > 0) break;
    int l = i + 1, r = n - 1;
    while (l < r) {
        int sum = nums[i] + nums[l] + nums[r];
        if (sum == 0) {
            res.push_back({nums[i], nums[l], nums[r]});
            l++;
            r--;
            while (l < r && nums[l] == nums[l - 1]) l++;
            while (l < r && nums[r] == nums[r + 1]) r--;
        } else if (sum < 0) {
            l++;
        } else {
            r--;
        }
    }
}
return res;
`)
  },
  "spiral-matrix": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "rotate-image": {
    java: javaSolution(`
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray() ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[] dr = new int[] {1, -1, 0, 0};
int[] dc = new int[] {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if ("1".equals(row.get(j).getAsString()) && !vis[i][j]) {
            ans++;
            Deque<int[]> st = new ArrayDeque<>();
            st.push(new int[] {i, j});
            vis[i][j] = true;
            while (!st.isEmpty()) {
                int[] cur = st.pop();
                for (int k = 0; k < 4; k++) {
                    int nr = cur[0] + dr[k];
                    int nc = cur[1] + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc]) {
                        JsonArray nrow = grid.get(nr).getAsJsonArray();
                        if ("1".equals(nrow.get(nc).getAsString())) {
                            vis[nr][nc] = true;
                            st.push(new int[] {nr, nc});
                        }
                    }
                }
            }
        }
    }
}
return ans;
`),
    cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = (int)grid.size();
int n = (int)grid[0].size();
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
int dr[4] = {1, -1, 0, 0};
int dc[4] = {0, 0, 1, -1};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == "1" && !vis[i][j]) {
            ans++;
            std::vector<std::pair<int, int>> st;
            st.push_back({i, j});
            vis[i][j] = true;
            while (!st.empty()) {
                auto [r, c] = st.back();
                st.pop_back();
                for (int k = 0; k < 4; k++) {
                    int nr = r + dr[k], nc = c + dc[k];
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n && !vis[nr][nc] && grid[nr][nc] == "1") {
                        vis[nr][nc] = true;
                        st.push_back({nr, nc});
                    }
                }
            }
        }
    }
}
return ans;
`)
  },
  "find-all-anagrams-in-a-string": {
    java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
String t = data.has("t") ? data.get("t").getAsString() : "";
if (s.length() != t.length()) return false;
int[] cnt = new int[256];
for (int i = 0; i < s.length(); i++) cnt[s.charAt(i)]++;
for (int i = 0; i < t.length(); i++) cnt[t.charAt(i)]--;
for (int x : cnt) if (x != 0) return false;
return true;
`),
    cpp: cppSolution(`
std::string s = data.value("s", std::string(""));
std::string t = data.value("t", std::string(""));
if (s.size() != t.size()) return false;
std::vector<int> cnt(256, 0);
for (char c : s) cnt[(unsigned char)c]++;
for (char c : t) cnt[(unsigned char)c]--;
for (int v : cnt) if (v != 0) return false;
return true;
`)
  },
  "task-scheduler": {
    java: javaSolution(`
JsonArray pricesA = data.has("prices") && data.get("prices").isJsonArray() ? data.getAsJsonArray("prices") : new JsonArray();
if (pricesA.size() == 0) return 0;
int minPrice = pricesA.get(0).getAsInt();
int ans = 0;
for (int i = 1; i < pricesA.size(); i++) {
    int p = pricesA.get(i).getAsInt();
    ans = Math.max(ans, p - minPrice);
    minPrice = Math.min(minPrice, p);
}
return ans;
`),
    cpp: cppSolution(`
std::vector<int> prices = data.value("prices", std::vector<int>{});
if (prices.empty()) return 0;
int minPrice = prices[0];
int ans = 0;
for (size_t i = 1; i < prices.size(); i++) {
    int p = prices[i];
    ans = std::max(ans, p - minPrice);
    minPrice = std::min(minPrice, p);
}
return ans;
`)
  }
};
