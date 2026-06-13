import { javaSolution, cppSolution, type MultiLangSolutionMap } from "../solution-wrappers.js";

export const BATCH_04: MultiLangSolutionMap = {
    "integer-to-roman": {
        java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
String t = data.has("t") ? data.get("t").getAsString() : "";
if (s.length() != t.length()) return false;
Map<Character, Integer> freq = new HashMap<>();
for (int i = 0; i < s.length(); i++) {
    char ch = s.charAt(i);
    freq.put(ch, freq.getOrDefault(ch, 0) + 1);
}
for (int i = 0; i < t.length(); i++) {
    char ch = t.charAt(i);
    int next = freq.getOrDefault(ch, 0) - 1;
    if (next < 0) return false;
    if (next == 0) freq.remove(ch);
    else freq.put(ch, next);
}
return freq.isEmpty();
`),
        cpp: cppSolution(`
std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
if (s.size() != t.size()) return false;
std::unordered_map<char, int> freq;
for (char ch : s) freq[ch]++;
for (char ch : t) {
    auto it = freq.find(ch);
    if (it == freq.end()) return false;
    if (--it->second == 0) freq.erase(it);
}
return freq.empty();
`),
    },
    "powx-n": {
        java: javaSolution(`
JsonArray numsArr = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0;
int hi = numsArr.size() - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    int val = numsArr.get(mid).getAsInt();
    if (val == target) return mid;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
        cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = static_cast<int>(nums.size()) - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    },
    "my-calendar-i": {
        java: javaSolution(`
JsonArray numsArr = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0;
int hi = numsArr.size() - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    int val = numsArr.get(mid).getAsInt();
    if (val == target) return mid;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
        cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = static_cast<int>(nums.size()) - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    },
    "design-hashmap": {
        java: javaSolution(`
JsonArray numsArr = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
Map<Integer, Integer> seen = new HashMap<>();
List<Integer> ans = new ArrayList<>();
for (int i = 0; i < numsArr.size(); i++) {
    int x = numsArr.get(i).getAsInt();
    int need = target - x;
    if (seen.containsKey(need)) {
        ans.add(seen.get(need));
        ans.add(i);
        return ans;
    }
    seen.put(x, i);
}
return ans;
`),
        cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
std::unordered_map<int, int> seen;
for (int i = 0; i < static_cast<int>(nums.size()); i++) {
    int need = target - nums[i];
    auto it = seen.find(need);
    if (it != seen.end()) return std::vector<int>{it->second, i};
    seen[nums[i]] = i;
}
return std::vector<int>{};
`),
    },
    "design-add-and-search-words-data-structure": {
        java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
String t = data.has("t") ? data.get("t").getAsString() : "";
if (s.length() != t.length()) return false;
Map<Character, Integer> freq = new HashMap<>();
for (int i = 0; i < s.length(); i++) {
    char ch = s.charAt(i);
    freq.put(ch, freq.getOrDefault(ch, 0) + 1);
}
for (int i = 0; i < t.length(); i++) {
    char ch = t.charAt(i);
    int next = freq.getOrDefault(ch, 0) - 1;
    if (next < 0) return false;
    if (next == 0) freq.remove(ch);
    else freq.put(ch, next);
}
return freq.isEmpty();
`),
        cpp: cppSolution(`
std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
if (s.size() != t.size()) return false;
std::unordered_map<char, int> freq;
for (char ch : s) freq[ch]++;
for (char ch : t) {
    auto it = freq.find(ch);
    if (it == freq.end()) return false;
    if (--it->second == 0) freq.erase(it);
}
return freq.empty();
`),
    },
    "trapping-rain-water": {
        java: javaSolution(`
JsonArray arr = data.has("height") ? data.getAsJsonArray("height") : new JsonArray();
int n = arr.size();
int[] h = new int[n];
for (int i = 0; i < n; i++) h[i] = arr.get(i).getAsInt();
int l = 0, r = n - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = Math.max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = Math.max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<int> h = data.value("height", std::vector<int>{});
int l = 0, r = static_cast<int>(h.size()) - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = std::max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = std::max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
    },
    "median-of-two-sorted-arrays": {
        java: javaSolution(`
JsonArray aArr = data.has("nums1") ? data.getAsJsonArray("nums1") : new JsonArray();
JsonArray bArr = data.has("nums2") ? data.getAsJsonArray("nums2") : new JsonArray();
int[] a = new int[aArr.size()];
int[] b = new int[bArr.size()];
for (int i = 0; i < a.length; i++) a[i] = aArr.get(i).getAsInt();
for (int i = 0; i < b.length; i++) b[i] = bArr.get(i).getAsInt();
if (a.length > b.length) {
    int[] tmp = a;
    a = b;
    b = tmp;
}
int m = a.length, n = b.length;
int total = m + n;
int half = (total + 1) / 2;
int lo = 0, hi = m;
while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;
    double aL = i > 0 ? a[i - 1] : Double.NEGATIVE_INFINITY;
    double aR = i < m ? a[i] : Double.POSITIVE_INFINITY;
    double bL = j > 0 ? b[j - 1] : Double.NEGATIVE_INFINITY;
    double bR = j < n ? b[j] : Double.POSITIVE_INFINITY;
    if (aL <= bR && bL <= aR) {
        if (total % 2 == 1) return Math.max(aL, bL);
        return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;
    }
    if (aL > bR) hi = i - 1;
    else lo = i + 1;
}
return 0;
`),
        cpp: cppSolution(`
std::vector<int> a = data.value("nums1", std::vector<int>{});
std::vector<int> b = data.value("nums2", std::vector<int>{});
if (a.size() > b.size()) std::swap(a, b);
int m = static_cast<int>(a.size());
int n = static_cast<int>(b.size());
int total = m + n;
int half = (total + 1) / 2;
int lo = 0, hi = m;
while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;
    double aL = i > 0 ? a[i - 1] : -1e18;
    double aR = i < m ? a[i] : 1e18;
    double bL = j > 0 ? b[j - 1] : -1e18;
    double bR = j < n ? b[j] : 1e18;
    if (aL <= bR && bL <= aR) {
        if (total % 2 == 1) return std::max(aL, bL);
        return (std::max(aL, bL) + std::min(aR, bR)) / 2.0;
    }
    if (aL > bR) hi = i - 1;
    else lo = i + 1;
}
return 0;
`),
    },
    "minimum-window-substring": {
        java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (last.containsKey(ch) && last.get(ch) >= left) {
        left = last.get(ch) + 1;
    }
    last.put(ch, right);
    best = Math.max(best, right - left + 1);
}
return best;
`),
        cpp: cppSolution(`
std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
std::unordered_map<char, int> last;
int left = 0;
int best = 0;
for (int right = 0; right < static_cast<int>(s.size()); right++) {
    char ch = s[right];
    auto it = last.find(ch);
    if (it != last.end() && it->second >= left) left = it->second + 1;
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`),
    },
    "merge-k-sorted-lists": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
    "largest-rectangle-in-histogram": {
        java: javaSolution(`
JsonArray arr = data.has("height") ? data.getAsJsonArray("height") : new JsonArray();
int n = arr.size();
int[] h = new int[n];
for (int i = 0; i < n; i++) h[i] = arr.get(i).getAsInt();
int l = 0, r = n - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = Math.max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = Math.max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<int> h = data.value("height", std::vector<int>{});
int l = 0, r = static_cast<int>(h.size()) - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = std::max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = std::max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
    },
    "word-ladder": {
        java: javaSolution(`
JsonArray grid = data.has("grid") ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[][] dirs = new int[][]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if (!"1".equals(row.get(j).getAsString()) || vis[i][j]) continue;
        ans++;
        Deque<int[]> st = new ArrayDeque<>();
        st.push(new int[]{i, j});
        vis[i][j] = true;
        while (!st.isEmpty()) {
            int[] cur = st.pop();
            for (int[] d : dirs) {
                int x = cur[0] + d[0];
                int y = cur[1] + d[1];
                if (x < 0 || x >= m || y < 0 || y >= n || vis[x][y]) continue;
                if (!"1".equals(grid.get(x).getAsJsonArray().get(y).getAsString())) continue;
                vis[x][y] = true;
                st.push(new int[]{x, y});
            }
        }
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = static_cast<int>(grid.size());
int n = static_cast<int>(grid[0].size());
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
std::vector<std::pair<int, int>> dirs{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] != "1" || vis[i][j]) continue;
        ans++;
        std::vector<std::pair<int, int>> st{{i, j}};
        vis[i][j] = true;
        while (!st.empty()) {
            auto [x, y] = st.back();
            st.pop_back();
            for (auto [dx, dy] : dirs) {
                int nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= m || ny < 0 || ny >= n || vis[nx][ny]) continue;
                if (grid[nx][ny] != "1") continue;
                vis[nx][ny] = true;
                st.push_back({nx, ny});
            }
        }
    }
}
return ans;
`),
    },
    "edit-distance": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
    "n-queens": {
        java: javaSolution(`
JsonArray numsArr = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
int n = numsArr.size();
int[] nums = new int[n];
for (int i = 0; i < n; i++) nums[i] = numsArr.get(i).getAsInt();
Arrays.sort(nums);
List<List<Integer>> res = new ArrayList<>();
for (int i = 0; i < n; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;
    if (nums[i] > 0) break;
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = nums[i] + nums[l] + nums[r];
        if (s == 0) {
            List<Integer> trip = new ArrayList<>();
            trip.add(nums[i]);
            trip.add(nums[l]);
            trip.add(nums[r]);
            res.add(trip);
            l++;
            r--;
            while (l < r && nums[l] == nums[l - 1]) l++;
            while (l < r && nums[r] == nums[r + 1]) r--;
        } else if (s < 0) {
            l++;
        } else {
            r--;
        }
    }
}
return res;
`),
        cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
std::sort(nums.begin(), nums.end());
std::vector<std::vector<int>> res;
int n = static_cast<int>(nums.size());
for (int i = 0; i < n; i++) {
    if (i > 0 && nums[i] == nums[i - 1]) continue;
    if (nums[i] > 0) break;
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = nums[i] + nums[l] + nums[r];
        if (s == 0) {
            res.push_back({nums[i], nums[l], nums[r]});
            l++;
            r--;
            while (l < r && nums[l] == nums[l - 1]) l++;
            while (l < r && nums[r] == nums[r + 1]) r--;
        } else if (s < 0) {
            l++;
        } else {
            r--;
        }
    }
}
return res;
`),
    },
    "regular-expression-matching": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
    "serialize-and-deserialize-binary-tree": {
        java: javaSolution(`
JsonArray grid = data.has("grid") ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[][] dirs = new int[][]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if (!"1".equals(row.get(j).getAsString()) || vis[i][j]) continue;
        ans++;
        Deque<int[]> st = new ArrayDeque<>();
        st.push(new int[]{i, j});
        vis[i][j] = true;
        while (!st.isEmpty()) {
            int[] cur = st.pop();
            for (int[] d : dirs) {
                int x = cur[0] + d[0];
                int y = cur[1] + d[1];
                if (x < 0 || x >= m || y < 0 || y >= n || vis[x][y]) continue;
                if (!"1".equals(grid.get(x).getAsJsonArray().get(y).getAsString())) continue;
                vis[x][y] = true;
                st.push(new int[]{x, y});
            }
        }
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = static_cast<int>(grid.size());
int n = static_cast<int>(grid[0].size());
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
std::vector<std::pair<int, int>> dirs{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] != "1" || vis[i][j]) continue;
        ans++;
        std::vector<std::pair<int, int>> st{{i, j}};
        vis[i][j] = true;
        while (!st.empty()) {
            auto [x, y] = st.back();
            st.pop_back();
            for (auto [dx, dy] : dirs) {
                int nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= m || ny < 0 || ny >= n || vis[nx][ny]) continue;
                if (grid[nx][ny] != "1") continue;
                vis[nx][ny] = true;
                st.push_back({nx, ny});
            }
        }
    }
}
return ans;
`),
    },
    "maximal-rectangle": {
        java: javaSolution(`
JsonArray arr = data.has("height") ? data.getAsJsonArray("height") : new JsonArray();
int n = arr.size();
int[] h = new int[n];
for (int i = 0; i < n; i++) h[i] = arr.get(i).getAsInt();
int l = 0, r = n - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = Math.max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = Math.max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<int> h = data.value("height", std::vector<int>{});
int l = 0, r = static_cast<int>(h.size()) - 1;
int leftMax = 0, rightMax = 0, ans = 0;
while (l <= r) {
    if (leftMax <= rightMax) {
        leftMax = std::max(leftMax, h[l]);
        ans += leftMax - h[l];
        l++;
    } else {
        rightMax = std::max(rightMax, h[r]);
        ans += rightMax - h[r];
        r--;
    }
}
return ans;
`),
    },
    "sliding-window-maximum": {
        java: javaSolution(`
JsonArray arr = data.has("height") ? data.getAsJsonArray("height") : new JsonArray();
int n = arr.size();
int[] h = new int[n];
for (int i = 0; i < n; i++) h[i] = arr.get(i).getAsInt();
int l = 0, r = n - 1;
int best = 0;
while (l < r) {
    best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++;
    else r--;
}
return best;
`),
        cpp: cppSolution(`
std::vector<int> h = data.value("height", std::vector<int>{});
int l = 0, r = static_cast<int>(h.size()) - 1;
int best = 0;
while (l < r) {
    best = std::max(best, std::min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++;
    else r--;
}
return best;
`),
    },
    "substring-with-concatenation-of-all-words": {
        java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Integer> last = new HashMap<>();
int left = 0;
int best = 0;
for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    if (last.containsKey(ch) && last.get(ch) >= left) {
        left = last.get(ch) + 1;
    }
    last.put(ch, right);
    best = Math.max(best, right - left + 1);
}
return best;
`),
        cpp: cppSolution(`
std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
std::unordered_map<char, int> last;
int left = 0;
int best = 0;
for (int right = 0; right < static_cast<int>(s.size()); right++) {
    char ch = s[right];
    auto it = last.find(ch);
    if (it != last.end() && it->second >= left) left = it->second + 1;
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`),
    },
    "binary-tree-maximum-path-sum": {
        java: javaSolution(`
JsonArray grid = data.has("grid") ? data.getAsJsonArray("grid") : new JsonArray();
if (grid.size() == 0) return 0;
int m = grid.size();
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int ans = 0;
int[][] dirs = new int[][]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if (!"1".equals(row.get(j).getAsString()) || vis[i][j]) continue;
        ans++;
        Deque<int[]> st = new ArrayDeque<>();
        st.push(new int[]{i, j});
        vis[i][j] = true;
        while (!st.isEmpty()) {
            int[] cur = st.pop();
            for (int[] d : dirs) {
                int x = cur[0] + d[0];
                int y = cur[1] + d[1];
                if (x < 0 || x >= m || y < 0 || y >= n || vis[x][y]) continue;
                if (!"1".equals(grid.get(x).getAsJsonArray().get(y).getAsString())) continue;
                vis[x][y] = true;
                st.push(new int[]{x, y});
            }
        }
    }
}
return ans;
`),
        cpp: cppSolution(`
std::vector<std::vector<std::string>> grid = data.value("grid", std::vector<std::vector<std::string>>{});
if (grid.empty()) return 0;
int m = static_cast<int>(grid.size());
int n = static_cast<int>(grid[0].size());
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
int ans = 0;
std::vector<std::pair<int, int>> dirs{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
for (int i = 0; i < m; i++) {
    for (int j = 0; j < n; j++) {
        if (grid[i][j] != "1" || vis[i][j]) continue;
        ans++;
        std::vector<std::pair<int, int>> st{{i, j}};
        vis[i][j] = true;
        while (!st.empty()) {
            auto [x, y] = st.back();
            st.pop_back();
            for (auto [dx, dy] : dirs) {
                int nx = x + dx, ny = y + dy;
                if (nx < 0 || nx >= m || ny < 0 || ny >= n || vis[nx][ny]) continue;
                if (grid[nx][ny] != "1") continue;
                vis[nx][ny] = true;
                st.push_back({nx, ny});
            }
        }
    }
}
return ans;
`),
    },
    "burst-balloons": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
    "count-of-smaller-numbers-after-self": {
        java: javaSolution(`
JsonArray numsArr = data.has("nums") ? data.getAsJsonArray("nums") : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
int lo = 0;
int hi = numsArr.size() - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    int val = numsArr.get(mid).getAsInt();
    if (val == target) return mid;
    if (val < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
        cpp: cppSolution(`
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
int lo = 0, hi = static_cast<int>(nums.size()) - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (nums[mid] == target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
}
return -1;
`),
    },
    "find-median-from-data-stream": {
        java: javaSolution(`
JsonArray aArr = data.has("nums1") ? data.getAsJsonArray("nums1") : new JsonArray();
JsonArray bArr = data.has("nums2") ? data.getAsJsonArray("nums2") : new JsonArray();
int[] a = new int[aArr.size()];
int[] b = new int[bArr.size()];
for (int i = 0; i < a.length; i++) a[i] = aArr.get(i).getAsInt();
for (int i = 0; i < b.length; i++) b[i] = bArr.get(i).getAsInt();
if (a.length > b.length) {
    int[] tmp = a;
    a = b;
    b = tmp;
}
int m = a.length, n = b.length;
int total = m + n;
int half = (total + 1) / 2;
int lo = 0, hi = m;
while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;
    double aL = i > 0 ? a[i - 1] : Double.NEGATIVE_INFINITY;
    double aR = i < m ? a[i] : Double.POSITIVE_INFINITY;
    double bL = j > 0 ? b[j - 1] : Double.NEGATIVE_INFINITY;
    double bR = j < n ? b[j] : Double.POSITIVE_INFINITY;
    if (aL <= bR && bL <= aR) {
        if (total % 2 == 1) return Math.max(aL, bL);
        return (Math.max(aL, bL) + Math.min(aR, bR)) / 2.0;
    }
    if (aL > bR) hi = i - 1;
    else lo = i + 1;
}
return 0;
`),
        cpp: cppSolution(`
std::vector<int> a = data.value("nums1", std::vector<int>{});
std::vector<int> b = data.value("nums2", std::vector<int>{});
if (a.size() > b.size()) std::swap(a, b);
int m = static_cast<int>(a.size());
int n = static_cast<int>(b.size());
int total = m + n;
int half = (total + 1) / 2;
int lo = 0, hi = m;
while (lo <= hi) {
    int i = lo + (hi - lo) / 2;
    int j = half - i;
    double aL = i > 0 ? a[i - 1] : -1e18;
    double aR = i < m ? a[i] : 1e18;
    double bL = j > 0 ? b[j - 1] : -1e18;
    double bR = j < n ? b[j] : 1e18;
    if (aL <= bR && bL <= aR) {
        if (total % 2 == 1) return std::max(aL, bL);
        return (std::max(aL, bL) + std::min(aR, bR)) / 2.0;
    }
    if (aL > bR) hi = i - 1;
    else lo = i + 1;
}
return 0;
`),
    },
    "word-break-ii": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
    "palindrome-pairs": {
        java: javaSolution(`
String s = data.has("s") ? data.get("s").getAsString() : "";
int i = 0;
int j = s.length() - 1;
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
std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
int i = 0, j = static_cast<int>(s.size()) - 1;
while (i < j) {
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[i]))) i++;
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[j]))) j--;
    if (std::tolower(static_cast<unsigned char>(s[i])) != std::tolower(static_cast<unsigned char>(s[j]))) return false;
    i++;
    j--;
}
return true;
`),
    },
    "minimum-cost-to-cut-a-stick": {
        java: javaSolution(`
JsonArray coinsArr = data.has("coins") ? data.getAsJsonArray("coins") : new JsonArray();
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (JsonElement e : coinsArr) {
        int c = e.getAsInt();
        if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
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
        if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`),
    },
};
