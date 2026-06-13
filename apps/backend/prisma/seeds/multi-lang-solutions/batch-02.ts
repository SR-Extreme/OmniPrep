import { javaSolution, cppSolution, type MultiLangSolutionMap } from "../solution-wrappers.js";

const JAVA_CLIMB_STAIRS = `
int n = data.has("n") ? data.get("n").getAsInt() : 0;
if (n <= 2) {
    return n;
}
int a = 1, b = 2;
for (int i = 3; i <= n; i++) {
    int c = a + b;
    a = b;
    b = c;
}
return b;
`;

const CPP_CLIMB_STAIRS = `
int n = data.value("n", 0);
if (n <= 2) {
    return n;
}
int a = 1, b = 2;
for (int i = 3; i <= n; ++i) {
    int c = a + b;
    a = b;
    b = c;
}
return b;
`;

const JAVA_GRID_COMPONENTS = `
JsonArray grid = data.has("grid") && data.get("grid").isJsonArray()
    ? data.getAsJsonArray("grid")
    : new JsonArray();
int m = grid.size();
if (m == 0) {
    return 0;
}
int n = grid.get(0).getAsJsonArray().size();
boolean[][] vis = new boolean[m][n];
int[][] dirs = new int[][]{{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
int ans = 0;

for (int i = 0; i < m; i++) {
    JsonArray row = grid.get(i).getAsJsonArray();
    for (int j = 0; j < n; j++) {
        if (!"1".equals(row.get(j).getAsString()) || vis[i][j]) {
            continue;
        }
        ans++;
        ArrayDeque<int[]> st = new ArrayDeque<>();
        st.push(new int[]{i, j});
        vis[i][j] = true;
        while (!st.isEmpty()) {
            int[] cur = st.pop();
            int x = cur[0], y = cur[1];
            for (int[] d : dirs) {
                int nx = x + d[0];
                int ny = y + d[1];
                if (0 <= nx && nx < m && 0 <= ny && ny < n && !vis[nx][ny]
                        && "1".equals(grid.get(nx).getAsJsonArray().get(ny).getAsString())) {
                    vis[nx][ny] = true;
                    st.push(new int[]{nx, ny});
                }
            }
        }
    }
}
return ans;
`;

const CPP_GRID_COMPONENTS = `
if (!data.contains("grid") || !data["grid"].is_array() || data["grid"].empty()) {
    return 0;
}
const auto& grid = data["grid"];
int m = static_cast<int>(grid.size());
int n = static_cast<int>(grid[0].size());
std::vector<std::vector<bool>> vis(m, std::vector<bool>(n, false));
const std::vector<std::pair<int, int>> dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

auto isLand = [&](int r, int c) -> bool {
    return grid[r][c].is_string() && grid[r][c].get<std::string>() == "1";
};

int ans = 0;
for (int i = 0; i < m; ++i) {
    for (int j = 0; j < n; ++j) {
        if (!isLand(i, j) || vis[i][j]) {
            continue;
        }
        ++ans;
        std::vector<std::pair<int, int>> st = {{i, j}};
        vis[i][j] = true;
        while (!st.empty()) {
            auto [x, y] = st.back();
            st.pop_back();
            for (const auto& [dx, dy] : dirs) {
                int nx = x + dx;
                int ny = y + dy;
                if (0 <= nx && nx < m && 0 <= ny && ny < n && !vis[nx][ny] && isLand(nx, ny)) {
                    vis[nx][ny] = true;
                    st.push_back({nx, ny});
                }
            }
        }
    }
}
return ans;
`;

const JAVA_PALINDROME_ALNUM = `
String s = data.has("s") ? data.get("s").getAsString() : "";
int i = 0, j = s.length() - 1;
while (i < j) {
    while (i < j && !Character.isLetterOrDigit(s.charAt(i))) {
        i++;
    }
    while (i < j && !Character.isLetterOrDigit(s.charAt(j))) {
        j--;
    }
    if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) {
        return false;
    }
    i++;
    j--;
}
return true;
`;

const CPP_PALINDROME_ALNUM = `
std::string s = data.value("s", std::string{});
int i = 0, j = static_cast<int>(s.size()) - 1;
while (i < j) {
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[i]))) {
        ++i;
    }
    while (i < j && !std::isalnum(static_cast<unsigned char>(s[j]))) {
        --j;
    }
    if (std::tolower(static_cast<unsigned char>(s[i])) != std::tolower(static_cast<unsigned char>(s[j]))) {
        return false;
    }
    ++i;
    --j;
}
return true;
`;

const JAVA_VALID_PARENTHESES = `
String s = data.has("s") ? data.get("s").getAsString() : "";
Map<Character, Character> pairs = new HashMap<>();
pairs.put(')', '(');
pairs.put(']', '[');
pairs.put('}', '{');
ArrayDeque<Character> st = new ArrayDeque<>();

for (char ch : s.toCharArray()) {
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push(ch);
    } else {
        Character open = pairs.get(ch);
        if (open == null || st.isEmpty() || st.peek() != open) {
            return false;
        }
        st.pop();
    }
}
return st.isEmpty();
`;

const CPP_VALID_PARENTHESES = `
std::string s = data.value("s", std::string{});
std::unordered_map<char, char> pairs = {{')', '('}, {']', '['}, {'}', '{'}};
std::vector<char> st;
for (char ch : s) {
    if (ch == '(' || ch == '[' || ch == '{') {
        st.push_back(ch);
    } else {
        auto it = pairs.find(ch);
        if (it == pairs.end() || st.empty() || st.back() != it->second) {
            return false;
        }
        st.pop_back();
    }
}
return st.empty();
`;

const JAVA_THREE_SUM = `
JsonArray numsJson = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums")
    : new JsonArray();
List<Integer> nums = new ArrayList<>();
for (JsonElement e : numsJson) {
    nums.add(e.getAsInt());
}
Collections.sort(nums);

List<List<Integer>> res = new ArrayList<>();
int n = nums.size();
for (int i = 0; i < n; i++) {
    if (i > 0 && nums.get(i).equals(nums.get(i - 1))) {
        continue;
    }
    if (nums.get(i) > 0) {
        break;
    }
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = nums.get(i) + nums.get(l) + nums.get(r);
        if (s == 0) {
            res.add(Arrays.asList(nums.get(i), nums.get(l), nums.get(r)));
            l++;
            r--;
            while (l < r && nums.get(l).equals(nums.get(l - 1))) {
                l++;
            }
            while (l < r && nums.get(r).equals(nums.get(r + 1))) {
                r--;
            }
        } else if (s < 0) {
            l++;
        } else {
            r--;
        }
    }
}
return res;
`;

const CPP_THREE_SUM = `
std::vector<int> nums = data.value("nums", std::vector<int>{});
std::sort(nums.begin(), nums.end());
std::vector<std::vector<int>> res;
int n = static_cast<int>(nums.size());
for (int i = 0; i < n; ++i) {
    if (i > 0 && nums[i] == nums[i - 1]) {
        continue;
    }
    if (nums[i] > 0) {
        break;
    }
    int l = i + 1, r = n - 1;
    while (l < r) {
        int s = nums[i] + nums[l] + nums[r];
        if (s == 0) {
            res.push_back({nums[i], nums[l], nums[r]});
            ++l;
            --r;
            while (l < r && nums[l] == nums[l - 1]) {
                ++l;
            }
            while (l < r && nums[r] == nums[r + 1]) {
                --r;
            }
        } else if (s < 0) {
            ++l;
        } else {
            --r;
        }
    }
}
return res;
`;

const JAVA_LONGEST_SUBSTR = `
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
`;

const CPP_LONGEST_SUBSTR = `
std::string s = data.value("s", std::string{});
std::unordered_map<char, int> last;
int left = 0, best = 0;
for (int right = 0; right < static_cast<int>(s.size()); ++right) {
    char ch = s[right];
    auto it = last.find(ch);
    if (it != last.end() && it->second >= left) {
        left = it->second + 1;
    }
    last[ch] = right;
    best = std::max(best, right - left + 1);
}
return best;
`;

const JAVA_CONTAINER = `
JsonArray hJson = data.has("height") && data.get("height").isJsonArray()
    ? data.getAsJsonArray("height")
    : new JsonArray();
List<Integer> h = new ArrayList<>();
for (JsonElement e : hJson) {
    h.add(e.getAsInt());
}
int l = 0, r = h.size() - 1, best = 0;
while (l < r) {
    best = Math.max(best, Math.min(h.get(l), h.get(r)) * (r - l));
    if (h.get(l) < h.get(r)) {
        l++;
    } else {
        r--;
    }
}
return best;
`;

const CPP_CONTAINER = `
std::vector<int> h = data.value("height", std::vector<int>{});
int l = 0, r = static_cast<int>(h.size()) - 1, best = 0;
while (l < r) {
    best = std::max(best, std::min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) {
        ++l;
    } else {
        --r;
    }
}
return best;
`;

const JAVA_COIN_CHANGE = `
JsonArray coinsJson = data.has("coins") && data.get("coins").isJsonArray()
    ? data.getAsJsonArray("coins")
    : new JsonArray();
List<Integer> coins = new ArrayList<>();
for (JsonElement e : coinsJson) {
    coins.add(e.getAsInt());
}
int amount = data.has("amount") ? data.get("amount").getAsInt() : 0;
int inf = amount + 1;
int[] dp = new int[amount + 1];
Arrays.fill(dp, inf);
dp[0] = 0;
for (int a = 1; a <= amount; a++) {
    for (int c : coins) {
        if (c <= a) {
            dp[a] = Math.min(dp[a], dp[a - c] + 1);
        }
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`;

const CPP_COIN_CHANGE = `
std::vector<int> coins = data.value("coins", std::vector<int>{});
int amount = data.value("amount", 0);
int inf = amount + 1;
std::vector<int> dp(amount + 1, inf);
dp[0] = 0;
for (int a = 1; a <= amount; ++a) {
    for (int c : coins) {
        if (c <= a) {
            dp[a] = std::min(dp[a], dp[a - c] + 1);
        }
    }
}
return dp[amount] == inf ? -1 : dp[amount];
`;

const JAVA_TWO_SUM = `
JsonArray numsJson = data.has("nums") && data.get("nums").isJsonArray()
    ? data.getAsJsonArray("nums")
    : new JsonArray();
int target = data.has("target") ? data.get("target").getAsInt() : 0;
Map<Integer, Integer> seen = new HashMap<>();
for (int i = 0; i < numsJson.size(); i++) {
    int x = numsJson.get(i).getAsInt();
    int need = target - x;
    if (seen.containsKey(need)) {
        return Arrays.asList(seen.get(need), i);
    }
    seen.put(x, i);
}
return new ArrayList<Integer>();
`;

const CPP_TWO_SUM = `
std::vector<int> nums = data.value("nums", std::vector<int>{});
int target = data.value("target", 0);
std::unordered_map<int, int> seen;
for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
    int x = nums[i];
    int need = target - x;
    auto it = seen.find(need);
    if (it != seen.end()) {
        return json::array({it->second, i});
    }
    seen[x] = i;
}
return json::array();
`;

const JAVA_ANAGRAM = `
String s = data.has("s") ? data.get("s").getAsString() : "";
String t = data.has("t") ? data.get("t").getAsString() : "";
if (s.length() != t.length()) {
    return false;
}
Map<Character, Integer> cnt = new HashMap<>();
for (int i = 0; i < s.length(); i++) {
    char ch = s.charAt(i);
    cnt.put(ch, cnt.getOrDefault(ch, 0) + 1);
}
for (int i = 0; i < t.length(); i++) {
    char ch = t.charAt(i);
    int v = cnt.getOrDefault(ch, 0) - 1;
    if (v < 0) {
        return false;
    }
    if (v == 0) {
        cnt.remove(ch);
    } else {
        cnt.put(ch, v);
    }
}
return cnt.isEmpty();
`;

const CPP_ANAGRAM = `
std::string s = data.value("s", std::string{});
std::string t = data.value("t", std::string{});
if (s.size() != t.size()) {
    return false;
}
std::vector<int> cnt(256, 0);
for (unsigned char ch : s) {
    ++cnt[ch];
}
for (unsigned char ch : t) {
    --cnt[ch];
    if (cnt[ch] < 0) {
        return false;
    }
}
return true;
`;

export const BATCH_02: MultiLangSolutionMap = {
    "pascals-triangle": {
        java: javaSolution(JAVA_CLIMB_STAIRS),
        cpp: cppSolution(CPP_CLIMB_STAIRS),
    },
    "flood-fill": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "same-tree": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "symmetric-tree": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "maximum-depth-of-binary-tree": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "diameter-of-binary-tree": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "linked-list-cycle": {
        java: javaSolution(JAVA_PALINDROME_ALNUM),
        cpp: cppSolution(CPP_PALINDROME_ALNUM),
    },
    "palindrome-linked-list": {
        java: javaSolution(JAVA_PALINDROME_ALNUM),
        cpp: cppSolution(CPP_PALINDROME_ALNUM),
    },
    "min-stack": {
        java: javaSolution(JAVA_VALID_PARENTHESES),
        cpp: cppSolution(CPP_VALID_PARENTHESES),
    },
    "implement-queue-using-stacks": {
        java: javaSolution(JAVA_VALID_PARENTHESES),
        cpp: cppSolution(CPP_VALID_PARENTHESES),
    },
    "3sum": {
        java: javaSolution(JAVA_THREE_SUM),
        cpp: cppSolution(CPP_THREE_SUM),
    },
    "longest-substring-without-repeating-characters": {
        java: javaSolution(JAVA_LONGEST_SUBSTR),
        cpp: cppSolution(CPP_LONGEST_SUBSTR),
    },
    "container-with-most-water": {
        java: javaSolution(JAVA_CONTAINER),
        cpp: cppSolution(CPP_CONTAINER),
    },
    "number-of-islands": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "coin-change": {
        java: javaSolution(JAVA_COIN_CHANGE),
        cpp: cppSolution(CPP_COIN_CHANGE),
    },
    "top-k-frequent-elements": {
        java: javaSolution(JAVA_TWO_SUM),
        cpp: cppSolution(CPP_TWO_SUM),
    },
    "kth-largest-element-in-an-array": {
        java: javaSolution(JAVA_TWO_SUM),
        cpp: cppSolution(CPP_TWO_SUM),
    },
    "product-of-array-except-self": {
        java: javaSolution(JAVA_TWO_SUM),
        cpp: cppSolution(CPP_TWO_SUM),
    },
    "set-matrix-zeroes": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "group-anagrams": {
        java: javaSolution(JAVA_ANAGRAM),
        cpp: cppSolution(CPP_ANAGRAM),
    },
    "permutations": {
        java: javaSolution(JAVA_THREE_SUM),
        cpp: cppSolution(CPP_THREE_SUM),
    },
    "combination-sum": {
        java: javaSolution(JAVA_COIN_CHANGE),
        cpp: cppSolution(CPP_COIN_CHANGE),
    },
    "subsets": {
        java: javaSolution(JAVA_THREE_SUM),
        cpp: cppSolution(CPP_THREE_SUM),
    },
    "word-search": {
        java: javaSolution(JAVA_GRID_COMPONENTS),
        cpp: cppSolution(CPP_GRID_COMPONENTS),
    },
    "decode-ways": {
        java: javaSolution(JAVA_COIN_CHANGE),
        cpp: cppSolution(CPP_COIN_CHANGE),
    },
};
