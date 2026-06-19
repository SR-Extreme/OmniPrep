import type { ProblemSpec } from "./types.js";

export const BATCH_01_SPECS: ProblemSpec[] = [
    {
        num: 1,
        slug: "two-sum",
        title: "Two Sum",
        difficulty: "EASY",
        topics: ["arrays", "hash-table"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number[2] indices, or [] if none",
        constraints: "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
        hints: [
            "Store seen values in a hash map.",
            "Check complement before storing current index.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    target = data.get("target", 0)
    seen = {}
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int target = data.has("target") ? data.get("target").getAsInt() : 0;
      Map<Integer, Integer> seen = new HashMap<>();
      for (int i = 0; i < numsArr.size(); i++) {
          int x = numsArr.get(i).getAsInt();
          int need = target - x;
          if (seen.containsKey(need)) {
              return Arrays.asList(seen.get(need), i);
          }
          seen.put(x, i);
      }
      return new ArrayList<Integer>();`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int target = data.contains("target") ? data["target"].get<int>() : 0;
      std::unordered_map<int, int> seen;
      for (int i = 0; i < static_cast<int>(nums.size()); i++) {
          int x = nums[i];
          int need = target - x;
          if (seen.count(need)) {
              return json::array({seen[need], i});
          }
          seen[x] = i;
      }
      return json::array();`,
        visibleCases: [
            {
                input: { nums: [2, 7, 11, 15], target: 9 },
                output: [0, 1],
                explanation: "2 + 7 = 9",
            },
            {
                input: { nums: [3, 2, 4], target: 6 },
                output: [1, 2],
                explanation: "2 + 4 = 6",
            },
        ],
        hiddenCases: [
            { input: { nums: [3, 3], target: 6 }, output: [0, 1] },
            { input: { nums: [1, 5, 4, 7], target: 8 }, output: [0, 3] },
            { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, output: [2, 4] },
            { input: { nums: [0, 4, 3, 0], target: 0 }, output: [0, 3] },
            { input: { nums: [1, 2, 3, 4], target: 10 }, output: [] },
            { input: { nums: [5, 75, 25], target: 100 }, output: [1, 2] },
            { input: { nums: [2, 5, 5, 11], target: 10 }, output: [1, 2] },
            { input: { nums: [10, -2, 8, 1], target: 9 }, output: [2, 3] },
        ],
    },
    {
        num: 2,
        slug: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "EASY",
        topics: ["stack", "strings"],
        inputFormat: "{ s: string }",
        outputFormat: "boolean",
        constraints: "1 <= s.length <= 10^5; chars in ()[]{}",
        hints: [
            "Use a stack.",
            "Map each closing bracket to its opening pair.",
        ],
        pythonBody: `    s = data.get("s", "")
    pairs = {')': '(', ']': '[', '}': '{'}
    st = []
    for ch in s:
        if ch in "([{":
            st.append(ch)
        else:
            if not st or st[-1] != pairs.get(ch):
                return False
            st.pop()
    return not st`,
        javaBody: `
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
              if (st.isEmpty() || st.peek() != pairs.getOrDefault(ch, '#')) {
                  return false;
              }
              st.pop();
          }
      }
      return st.isEmpty();`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::unordered_map<char, char> pairs{{')', '('}, {']', '['}, {'}', '{'}};
      std::vector<char> st;
      for (char ch : s) {
          if (ch == '(' || ch == '[' || ch == '{') {
              st.push_back(ch);
          } else {
              if (st.empty() || st.back() != pairs[ch]) {
                  return false;
              }
              st.pop_back();
          }
      }
      return st.empty();`,
        visibleCases: [
            {
                input: { s: "()[]{}" },
                output: true,
                explanation: "Every opener closes in order.",
            },
            {
                input: { s: "(]" },
                output: false,
                explanation: "Mismatched pair.",
            },
        ],
        hiddenCases: [
            { input: { s: "" }, output: true },
            { input: { s: "([{}])" }, output: true },
            { input: { s: "([)]" }, output: false },
            { input: { s: "((((" }, output: false },
            { input: { s: "]" }, output: false },
            { input: { s: "{[]}" }, output: true },
            { input: { s: "((()))[]{}" }, output: true },
            { input: { s: "(()" }, output: false },
        ],
    },
    {
        num: 3,
        slug: "best-time-to-buy-and-sell-stock",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "EASY",
        topics: ["arrays", "greedy"],
        inputFormat: "{ prices: number[] }",
        outputFormat: "number",
        constraints: "1 <= prices.length <= 10^5",
        hints: [
            "Track the minimum price seen so far.",
            "Update best profit at each day.",
        ],
        pythonBody: `    prices = data.get("prices", [])
    if not prices:
        return 0
    min_price = prices[0]
    ans = 0
    for p in prices[1:]:
        ans = max(ans, p - min_price)
        min_price = min(min_price, p)
    return ans`,
        javaBody: `
      JsonArray pricesArr = data.has("prices") && data.get("prices").isJsonArray() ? data.getAsJsonArray("prices") : new JsonArray();
      if (pricesArr.size() == 0) {
          return 0;
      }
      int minPrice = pricesArr.get(0).getAsInt();
      int ans = 0;
      for (int i = 1; i < pricesArr.size(); i++) {
          int p = pricesArr.get(i).getAsInt();
          ans = Math.max(ans, p - minPrice);
          minPrice = Math.min(minPrice, p);
      }
      return ans;`,
        cppBody: `
      std::vector<int> prices = data.contains("prices") && data["prices"].is_array()
          ? data["prices"].get<std::vector<int>>()
          : std::vector<int>{};
      if (prices.empty()) {
          return 0;
      }
      int minPrice = prices[0];
      int ans = 0;
      for (int i = 1; i < static_cast<int>(prices.size()); i++) {
          int p = prices[i];
          ans = std::max(ans, p - minPrice);
          minPrice = std::min(minPrice, p);
      }
      return ans;`,
        visibleCases: [
            {
                input: { prices: [7, 1, 5, 3, 6, 4] },
                output: 5,
                explanation: "Buy at 1, sell at 6.",
            },
            {
                input: { prices: [7, 6, 4, 3, 1] },
                output: 0,
                explanation: "No profitable trade.",
            },
        ],
        hiddenCases: [
            { input: { prices: [1, 2] }, output: 1 },
            { input: { prices: [2, 1] }, output: 0 },
            { input: { prices: [2, 4, 1] }, output: 2 },
            { input: { prices: [3, 3, 5, 0, 0, 3, 1, 4] }, output: 4 },
            { input: { prices: [1] }, output: 0 },
            { input: { prices: [5, 4, 3, 2, 1, 6] }, output: 5 },
            { input: { prices: [1, 10, 2, 9] }, output: 9 },
            { input: { prices: [9, 8, 7, 6, 5] }, output: 0 },
        ],
    },
    {
        num: 4,
        slug: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "EASY",
        topics: ["two-pointers", "strings"],
        inputFormat: "{ s: string }",
        outputFormat: "boolean",
        constraints: "1 <= s.length <= 2*10^5",
        hints: [
            "Use two pointers from both ends.",
            "Skip non-alphanumeric characters.",
        ],
        pythonBody: `    s = data.get("s", "")
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():
            return False
        i += 1
        j -= 1
    return True`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      int i = 0;
      int j = s.length() - 1;
      while (i < j) {
          while (i < j && !Character.isLetterOrDigit(s.charAt(i))) i++;
          while (i < j && !Character.isLetterOrDigit(s.charAt(j))) j--;
          if (Character.toLowerCase(s.charAt(i)) != Character.toLowerCase(s.charAt(j))) {
              return false;
          }
          i++;
          j--;
      }
      return true;`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      auto isAlnum = [](char c) {
          return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
      };
      auto toLower = [](char c) {
          return (c >= 'A' && c <= 'Z') ? static_cast<char>(c - 'A' + 'a') : c;
      };
      int i = 0;
      int j = static_cast<int>(s.size()) - 1;
      while (i < j) {
          while (i < j && !isAlnum(s[i])) i++;
          while (i < j && !isAlnum(s[j])) j--;
          if (toLower(s[i]) != toLower(s[j])) {
              return false;
          }
          i++;
          j--;
      }
      return true;`,
        visibleCases: [
            {
                input: { s: "A man, a plan, a canal: Panama" },
                output: true,
                explanation: "Reads the same forward and backward ignoring case and punctuation.",
            },
            {
                input: { s: "race a car" },
                output: false,
                explanation: "Not a palindrome after filtering.",
            },
        ],
        hiddenCases: [
            { input: { s: " " }, output: true },
            { input: { s: "0P" }, output: false },
            { input: { s: "abba" }, output: true },
            { input: { s: "abc" }, output: false },
            { input: { s: "No lemon, no melon" }, output: true },
            { input: { s: "Was it a car or a cat I saw?" }, output: true },
            { input: { s: "ab_a" }, output: true },
            { input: { s: "ab@a" }, output: true },
        ],
    },
    {
        num: 5,
        slug: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "EASY",
        topics: ["hash-table", "strings"],
        inputFormat: "{ s: string, t: string }",
        outputFormat: "boolean",
        constraints: "1 <= s.length, t.length <= 10^5",
        hints: [
            "Count character frequencies.",
            "Lengths must match first.",
        ],
        pythonBody: `    from collections import Counter
    s = data.get("s", "")
    t = data.get("t", "")
    return Counter(s) == Counter(t)`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;`,
        visibleCases: [
            {
                input: { s: "anagram", t: "nagaram" },
                output: true,
                explanation: "Same characters with equal frequencies.",
            },
            {
                input: { s: "rat", t: "car" },
                output: false,
                explanation: "Different character sets.",
            },
        ],
        hiddenCases: [
            { input: { s: "", t: "" }, output: true },
            { input: { s: "a", t: "aa" }, output: false },
            { input: { s: "listen", t: "silent" }, output: true },
            { input: { s: "triangle", t: "integral" }, output: true },
            { input: { s: "hello", t: "bello" }, output: false },
            { input: { s: "aabbcc", t: "abcabc" }, output: true },
            { input: { s: "xxy", t: "xyx" }, output: true },
            { input: { s: "xxy", t: "xyz" }, output: false },
        ],
    },
    {
        num: 6,
        slug: "climbing-stairs",
        title: "Climbing Stairs",
        difficulty: "EASY",
        topics: ["dynamic-programming", "math"],
        inputFormat: "{ n: number }",
        outputFormat: "number",
        constraints: "1 <= n <= 45",
        hints: [
            "Ways to reach step n equal ways(n-1) + ways(n-2).",
            "Keep only the last two states.",
        ],
        pythonBody: `    n = data.get("n", 0)
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
        javaBody: `
      int n = data.has("n") ? data.get("n").getAsInt() : 0;
      if (n <= 2) {
          return n;
      }
      int a = 1;
      int b = 2;
      for (int i = 3; i <= n; i++) {
          int c = a + b;
          a = b;
          b = c;
      }
      return b;`,
        cppBody: `
      int n = data.contains("n") ? data["n"].get<int>() : 0;
      if (n <= 2) {
          return n;
      }
      int a = 1, b = 2;
      for (int i = 3; i <= n; i++) {
          int c = a + b;
          a = b;
          b = c;
      }
      return b;`,
        visibleCases: [
            {
                input: { n: 2 },
                output: 2,
                explanation: "1+1 or 2.",
            },
            {
                input: { n: 3 },
                output: 3,
                explanation: "1+1+1, 1+2, or 2+1.",
            },
        ],
        hiddenCases: [
            { input: { n: 1 }, output: 1 },
            { input: { n: 4 }, output: 5 },
            { input: { n: 5 }, output: 8 },
            { input: { n: 6 }, output: 13 },
            { input: { n: 7 }, output: 21 },
            { input: { n: 8 }, output: 34 },
            { input: { n: 10 }, output: 89 },
            { input: { n: 12 }, output: 233 },
        ],
    },
    {
        num: 7,
        slug: "binary-search",
        title: "Binary Search",
        difficulty: "EASY",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number",
        constraints: "nums sorted ascending; up to 10^5 elements",
        hints: [
            "Maintain [lo, hi] boundaries.",
            "Use mid = lo + (hi-lo)//2.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    target = data.get("target", 0)
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int target = data.has("target") ? data.get("target").getAsInt() : 0;
      int lo = 0, hi = numsArr.size() - 1;
      while (lo <= hi) {
          int mid = (lo + hi) / 2;
          int val = numsArr.get(mid).getAsInt();
          if (val == target) return mid;
          if (val < target) lo = mid + 1;
          else hi = mid - 1;
      }
      return -1;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int target = data.contains("target") ? data["target"].get<int>() : 0;
      int lo = 0, hi = static_cast<int>(nums.size()) - 1;
      while (lo <= hi) {
          int mid = (lo + hi) / 2;
          if (nums[mid] == target) return mid;
          if (nums[mid] < target) lo = mid + 1;
          else hi = mid - 1;
      }
      return -1;`,
        visibleCases: [
            {
                input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
                output: 4,
                explanation: "9 is at index 4.",
            },
            {
                input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 },
                output: -1,
                explanation: "2 is not in the array.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1], target: 1 }, output: 0 },
            { input: { nums: [1], target: 0 }, output: -1 },
            { input: { nums: [1, 3, 5, 7], target: 7 }, output: 3 },
            { input: { nums: [1, 3, 5, 7], target: 1 }, output: 0 },
            { input: { nums: [1, 3, 5, 7], target: 4 }, output: -1 },
            { input: { nums: [], target: 4 }, output: -1 },
            { input: { nums: [-5, -2, 0, 10], target: -2 }, output: 1 },
            { input: { nums: [-5, -2, 0, 10], target: 11 }, output: -1 },
        ],
    },
    {
        num: 8,
        slug: "contains-duplicate",
        title: "Contains Duplicate",
        difficulty: "EASY",
        topics: ["arrays", "hash-table"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "boolean",
        constraints: "1 <= nums.length <= 10^5; values fit 32-bit signed int.",
        hints: [
            "Track values you have already seen.",
            "A set makes duplicate detection O(1).",
        ],
        pythonBody: `    nums = data.get("nums", [])
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      Set<Integer> seen = new HashSet<>();
      for (int i = 0; i < numsArr.size(); i++) {
          int x = numsArr.get(i).getAsInt();
          if (seen.contains(x)) {
              return true;
          }
          seen.add(x);
      }
      return false;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      std::unordered_set<int> seen;
      for (int x : nums) {
          if (seen.count(x)) {
              return true;
          }
          seen.insert(x);
      }
      return false;`,
        visibleCases: [
            {
                input: { nums: [1, 2, 3, 1] },
                output: true,
                explanation: "1 appears twice.",
            },
            {
                input: { nums: [1, 2, 3, 4] },
                output: false,
                explanation: "All elements are distinct.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1, 1] }, output: true },
            { input: { nums: [1] }, output: false },
            { input: { nums: [] }, output: false },
            { input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 1] }, output: true },
            { input: { nums: [-1, -2, -3, -1] }, output: true },
            { input: { nums: [0, 0] }, output: true },
            { input: { nums: [5, 5, 5] }, output: true },
            { input: { nums: [10, 20, 30, 40] }, output: false },
        ],
    },
    {
        num: 9,
        slug: "isomorphic-strings",
        title: "Isomorphic Strings",
        difficulty: "EASY",
        topics: ["hash-table", "strings"],
        inputFormat: "{ s: string, t: string }",
        outputFormat: "boolean",
        constraints: "1 <= s.length, t.length <= 10^5; s and t have equal length",
        hints: [
            "Map characters from s to t and back.",
            "Reject if any mapping conflicts.",
        ],
        pythonBody: `    s = data.get("s", "")
    t = data.get("t", "")
    if len(s) != len(t):
        return False
    s2t, t2s = {}, {}
    for a, b in zip(s, t):
        if a in s2t and s2t[a] != b:
            return False
        if b in t2s and t2s[b] != a:
            return False
        s2t[a] = b
        t2s[b] = a
    return True`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      if (s.length() != t.length()) {
          return false;
      }
      Map<Character, Character> s2t = new HashMap<>();
      Map<Character, Character> t2s = new HashMap<>();
      for (int i = 0; i < s.length(); i++) {
          char a = s.charAt(i);
          char b = t.charAt(i);
          if (s2t.containsKey(a) && s2t.get(a) != b) return false;
          if (t2s.containsKey(b) && t2s.get(b) != a) return false;
          s2t.put(a, b);
          t2s.put(b, a);
      }
      return true;`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      if (s.size() != t.size()) {
          return false;
      }
      std::unordered_map<char, char> s2t, t2s;
      for (size_t i = 0; i < s.size(); i++) {
          char a = s[i];
          char b = t[i];
          if (s2t.count(a) && s2t[a] != b) return false;
          if (t2s.count(b) && t2s[b] != a) return false;
          s2t[a] = b;
          t2s[b] = a;
      }
      return true;`,
        visibleCases: [
            {
                input: { s: "egg", t: "add" },
                output: true,
                explanation: "e->a and g->d preserves order.",
            },
            {
                input: { s: "foo", t: "bar" },
                output: false,
                explanation: "o cannot map to both a and r.",
            },
        ],
        hiddenCases: [
            { input: { s: "", t: "" }, output: true },
            { input: { s: "a", t: "a" }, output: true },
            { input: { s: "paper", t: "title" }, output: true },
            { input: { s: "badc", t: "baba" }, output: false },
            { input: { s: "ab", t: "aa" }, output: false },
            { input: { s: "abc", t: "def" }, output: true },
            { input: { s: "13", t: "42" }, output: true },
            { input: { s: "abba", t: "cdce" }, output: false },
        ],
    },
    {
        num: 10,
        slug: "ransom-note",
        title: "Ransom Note",
        difficulty: "EASY",
        topics: ["hash-table", "strings"],
        inputFormat: "{ ransomNote: string, magazine: string }",
        outputFormat: "boolean",
        constraints: "1 <= ransomNote.length, magazine.length <= 10^5",
        hints: [
            "Count letters available in magazine.",
            "Decrement counts as you use each ransom letter.",
        ],
        pythonBody: `    from collections import Counter
    ransom = data.get("ransomNote", "")
    magazine = data.get("magazine", "")
    counts = Counter(magazine)
    for ch in ransom:
        if counts[ch] <= 0:
            return False
        counts[ch] -= 1
    return True`,
        javaBody: `
      String ransom = data.has("ransomNote") ? data.get("ransomNote").getAsString() : "";
      String magazine = data.has("magazine") ? data.get("magazine").getAsString() : "";
      Map<Character, Integer> counts = new HashMap<>();
      for (int i = 0; i < magazine.length(); i++) {
          char ch = magazine.charAt(i);
          counts.put(ch, counts.getOrDefault(ch, 0) + 1);
      }
      for (int i = 0; i < ransom.length(); i++) {
          char ch = ransom.charAt(i);
          int left = counts.getOrDefault(ch, 0);
          if (left <= 0) return false;
          counts.put(ch, left - 1);
      }
      return true;`,
        cppBody: `
      std::string ransom = data.contains("ransomNote") ? data["ransomNote"].get<std::string>() : "";
      std::string magazine = data.contains("magazine") ? data["magazine"].get<std::string>() : "";
      std::unordered_map<char, int> counts;
      for (char ch : magazine) counts[ch]++;
      for (char ch : ransom) {
          if (--counts[ch] < 0) return false;
      }
      return true;`,
        visibleCases: [
            {
                input: { ransomNote: "a", magazine: "b" },
                output: false,
                explanation: "Magazine has no 'a'.",
            },
            {
                input: { ransomNote: "aa", magazine: "aab" },
                output: true,
                explanation: "Magazine has two a's.",
            },
        ],
        hiddenCases: [
            { input: { ransomNote: "", magazine: "abc" }, output: true },
            { input: { ransomNote: "aa", magazine: "ab" }, output: false },
            { input: { ransomNote: "aa", magazine: "aa" }, output: true },
            { input: { ransomNote: "aab", magazine: "baa" }, output: true },
            { input: { ransomNote: "xyz", magazine: "xy" }, output: false },
            { input: { ransomNote: "a", magazine: "a" }, output: true },
            { input: { ransomNote: "bg", magazine: "efjdfdfjhhaiiahbaiaeahxcaaief" }, output: false },
            { input: { ransomNote: "apple", magazine: "aple" }, output: false },
        ],
    },
    {
        num: 11,
        slug: "first-bad-version",
        title: "First Bad Version",
        difficulty: "EASY",
        topics: ["binary-search"],
        inputFormat: "{ n: number, bad: number }",
        outputFormat: "number",
        constraints: "1 <= bad <= n <= 2^31 - 1; versions after the first bad are also bad",
        hints: [
            "Binary search on version numbers 1..n.",
            "If mid is bad, search left including mid.",
        ],
        pythonBody: `    n = data.get("n", 0)
    bad = data.get("bad", n)
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if mid >= bad:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        javaBody: `
      int n = data.has("n") ? data.get("n").getAsInt() : 0;
      int bad = data.has("bad") ? data.get("bad").getAsInt() : n;
      int lo = 1, hi = n;
      while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          if (mid >= bad) {
              hi = mid;
          } else {
              lo = mid + 1;
          }
      }
      return lo;`,
        cppBody: `
      int n = data.contains("n") ? data["n"].get<int>() : 0;
      int bad = data.contains("bad") ? data["bad"].get<int>() : n;
      int lo = 1, hi = n;
      while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          if (mid >= bad) {
              hi = mid;
          } else {
              lo = mid + 1;
          }
      }
      return lo;`,
        visibleCases: [
            {
                input: { n: 5, bad: 4 },
                output: 4,
                explanation: "Version 4 is the first bad version.",
            },
            {
                input: { n: 1, bad: 1 },
                output: 1,
                explanation: "Only version is bad.",
            },
        ],
        hiddenCases: [
            { input: { n: 10, bad: 10 }, output: 10 },
            { input: { n: 10, bad: 1 }, output: 1 },
            { input: { n: 2126753390, bad: 1702766719 }, output: 1702766719 },
            { input: { n: 2, bad: 2 }, output: 2 },
            { input: { n: 2, bad: 1 }, output: 1 },
            { input: { n: 100, bad: 50 }, output: 50 },
            { input: { n: 7, bad: 3 }, output: 3 },
            { input: { n: 8, bad: 8 }, output: 8 },
        ],
    },
    {
        num: 12,
        slug: "sqrtx",
        title: "Sqrt(x)",
        difficulty: "EASY",
        topics: ["math", "binary-search"],
        inputFormat: "{ x: number }",
        outputFormat: "number",
        constraints: "0 <= x <= 2^31 - 1",
        hints: [
            "Binary search on answer y in [0, x].",
            "Keep the largest y with y * y <= x.",
        ],
        pythonBody: `    x = data.get("x", 0)
    if x < 2:
        return x
    lo, hi = 1, x // 2
    ans = 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans`,
        javaBody: `
      int x = data.has("x") ? data.get("x").getAsInt() : 0;
      if (x < 2) {
          return x;
      }
      int lo = 1, hi = x / 2;
      int ans = 1;
      while (lo <= hi) {
          int mid = lo + (hi - lo) / 2;
          if ((long) mid * mid <= x) {
              ans = mid;
              lo = mid + 1;
          } else {
              hi = mid - 1;
          }
      }
      return ans;`,
        cppBody: `
      int x = data.contains("x") ? data["x"].get<int>() : 0;
      if (x < 2) {
          return x;
      }
      int lo = 1, hi = x / 2;
      int ans = 1;
      while (lo <= hi) {
          int mid = lo + (hi - lo) / 2;
          if (1LL * mid * mid <= x) {
              ans = mid;
              lo = mid + 1;
          } else {
              hi = mid - 1;
          }
      }
      return ans;`,
        visibleCases: [
            {
                input: { x: 4 },
                output: 2,
                explanation: "2 * 2 = 4.",
            },
            {
                input: { x: 8 },
                output: 2,
                explanation: "2^2 = 4 <= 8 and 3^2 = 9 > 8.",
            },
        ],
        hiddenCases: [
            { input: { x: 0 }, output: 0 },
            { input: { x: 1 }, output: 1 },
            { input: { x: 9 }, output: 3 },
            { input: { x: 15 }, output: 3 },
            { input: { x: 16 }, output: 4 },
            { input: { x: 2147483647 }, output: 46340 },
            { input: { x: 100 }, output: 10 },
            { input: { x: 26 }, output: 5 },
        ],
    },
    {
        num: 13,
        slug: "find-peak-element",
        title: "Find Peak Element",
        difficulty: "EASY",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 10^5; nums[i] != nums[i+1] for valid i",
        hints: [
            "Compare nums[mid] with nums[mid+1].",
            "Move toward the larger neighbor.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int lo = 0, hi = numsArr.size() - 1;
      while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          int cur = numsArr.get(mid).getAsInt();
          int nxt = numsArr.get(mid + 1).getAsInt();
          if (cur < nxt) {
              lo = mid + 1;
          } else {
              hi = mid;
          }
      }
      return lo;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int lo = 0, hi = static_cast<int>(nums.size()) - 1;
      while (lo < hi) {
          int mid = lo + (hi - lo) / 2;
          if (nums[mid] < nums[mid + 1]) {
              lo = mid + 1;
          } else {
              hi = mid;
          }
      }
      return lo;`,
        visibleCases: [
            {
                input: { nums: [1, 2, 3, 1] },
                output: 2,
                explanation: "3 is a peak at index 2.",
            },
            {
                input: { nums: [1, 2, 1, 3, 5, 6, 4] },
                output: 5,
                explanation: "6 is a peak at index 5.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1] }, output: 0 },
            { input: { nums: [1, 2] }, output: 1 },
            { input: { nums: [2, 1] }, output: 0 },
            { input: { nums: [1, 2, 3, 4, 5] }, output: 4 },
            { input: { nums: [5, 4, 3, 2, 1] }, output: 0 },
            { input: { nums: [1, 3, 2] }, output: 1 },
            { input: { nums: [3, 2, 1, 4, 5, 6, 7, 8, 9, 1] }, output: 8 },
            { input: { nums: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] }, output: 0 },
        ],
    },
    {
        num: 14,
        slug: "search-insert-position",
        title: "Search Insert Position",
        difficulty: "EASY",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums: number[], target: number }",
        outputFormat: "number",
        constraints: "nums sorted ascending; 1 <= nums.length <= 10^4",
        hints: [
            "Binary search for target.",
            "If absent, lo ends at the insert position.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    target = data.get("target", 0)
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return lo`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int target = data.has("target") ? data.get("target").getAsInt() : 0;
      int lo = 0, hi = numsArr.size() - 1;
      while (lo <= hi) {
          int mid = (lo + hi) / 2;
          int val = numsArr.get(mid).getAsInt();
          if (val == target) return mid;
          if (val < target) lo = mid + 1;
          else hi = mid - 1;
      }
      return lo;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int target = data.contains("target") ? data["target"].get<int>() : 0;
      int lo = 0, hi = static_cast<int>(nums.size()) - 1;
      while (lo <= hi) {
          int mid = (lo + hi) / 2;
          if (nums[mid] == target) return mid;
          if (nums[mid] < target) lo = mid + 1;
          else hi = mid - 1;
      }
      return lo;`,
        visibleCases: [
            {
                input: { nums: [1, 3, 5, 6], target: 5 },
                output: 2,
                explanation: "5 is found at index 2.",
            },
            {
                input: { nums: [1, 3, 5, 6], target: 2 },
                output: 1,
                explanation: "2 would be inserted at index 1.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1, 3, 5, 6], target: 7 }, output: 4 },
            { input: { nums: [1, 3, 5, 6], target: 0 }, output: 0 },
            { input: { nums: [1], target: 1 }, output: 0 },
            { input: { nums: [1], target: 0 }, output: 0 },
            { input: { nums: [1, 3], target: 2 }, output: 1 },
            { input: { nums: [1, 3], target: 4 }, output: 2 },
            { input: { nums: [1, 3, 5, 7], target: 6 }, output: 3 },
            { input: { nums: [1, 3, 5, 7], target: 3 }, output: 1 },
        ],
    },
    {
        num: 15,
        slug: "longest-common-prefix",
        title: "Longest Common Prefix",
        difficulty: "EASY",
        topics: ["strings"],
        inputFormat: "{ strs: string[] }",
        outputFormat: "string",
        constraints: "1 <= strs.length <= 200; 0 <= strs[i].length <= 200",
        hints: [
            "Start with the first string as prefix.",
            "Shrink prefix until all strings share it.",
        ],
        pythonBody: `    strs = data.get("strs", [])
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`,
        javaBody: `
      JsonArray strsArr = data.has("strs") && data.get("strs").isJsonArray() ? data.getAsJsonArray("strs") : new JsonArray();
      if (strsArr.size() == 0) {
          return "";
      }
      String prefix = strsArr.get(0).getAsString();
      for (int i = 1; i < strsArr.size(); i++) {
          String s = strsArr.get(i).getAsString();
          while (!s.startsWith(prefix)) {
              prefix = prefix.substring(0, prefix.length() - 1);
              if (prefix.isEmpty()) {
                  return "";
              }
          }
      }
      return prefix;`,
        cppBody: `
      std::vector<std::string> strs;
      if (data.contains("strs") && data["strs"].is_array()) {
          for (const auto& item : data["strs"]) {
              strs.push_back(item.get<std::string>());
          }
      }
      if (strs.empty()) {
          return "";
      }
      std::string prefix = strs[0];
      for (size_t i = 1; i < strs.size(); i++) {
          while (strs[i].find(prefix) != 0) {
              prefix.pop_back();
              if (prefix.empty()) {
                  return "";
              }
          }
      }
      return prefix;`,
        visibleCases: [
            {
                input: { strs: ["flower", "flow", "flight"] },
                output: "fl",
                explanation: "fl is shared by all three strings.",
            },
            {
                input: { strs: ["dog", "racecar", "car"] },
                output: "",
                explanation: "No common prefix.",
            },
        ],
        hiddenCases: [
            { input: { strs: ["a"] }, output: "a" },
            { input: { strs: ["ab", "a"] }, output: "a" },
            { input: { strs: ["", "b"] }, output: "" },
            { input: { strs: ["abab", "aba", "abc"] }, output: "ab" },
            { input: { strs: ["reflower", "flow", "flight"] }, output: "" },
            { input: { strs: ["c", "c"] }, output: "c" },
            { input: { strs: ["interspecies", "interstellar", "interstate"] }, output: "inters" },
            { input: { strs: ["throne", "throne"] }, output: "throne" },
        ],
    },
    {
        num: 16,
        slug: "implement-strstr",
        title: "Implement strStr",
        difficulty: "EASY",
        topics: ["strings", "two-pointers"],
        inputFormat: "{ haystack: string, needle: string }",
        outputFormat: "number",
        constraints: "0 <= haystack.length, needle.length <= 10^4",
        hints: [
            "Empty needle occurs at index 0.",
            "Check each start index in haystack.",
        ],
        pythonBody: `    haystack = data.get("haystack", "")
    needle = data.get("needle", "")
    if not needle:
        return 0
    n, m = len(haystack), len(needle)
    for i in range(n - m + 1):
        if haystack[i : i + m] == needle:
            return i
    return -1`,
        javaBody: `
      String haystack = data.has("haystack") ? data.get("haystack").getAsString() : "";
      String needle = data.has("needle") ? data.get("needle").getAsString() : "";
      if (needle.isEmpty()) {
          return 0;
      }
      int n = haystack.length();
      int m = needle.length();
      for (int i = 0; i <= n - m; i++) {
          if (haystack.startsWith(needle, i)) {
              return i;
          }
      }
      return -1;`,
        cppBody: `
      std::string haystack = data.contains("haystack") ? data["haystack"].get<std::string>() : "";
      std::string needle = data.contains("needle") ? data["needle"].get<std::string>() : "";
      if (needle.empty()) {
          return 0;
      }
      int n = static_cast<int>(haystack.size());
      int m = static_cast<int>(needle.size());
      for (int i = 0; i <= n - m; i++) {
          if (haystack.compare(i, m, needle) == 0) {
              return i;
          }
      }
      return -1;`,
        visibleCases: [
            {
                input: { haystack: "sadbutsad", needle: "sad" },
                output: 0,
                explanation: "sad starts at index 0.",
            },
            {
                input: { haystack: "leetcode", needle: "leeto" },
                output: -1,
                explanation: "leeto is not a substring.",
            },
        ],
        hiddenCases: [
            { input: { haystack: "", needle: "" }, output: 0 },
            { input: { haystack: "a", needle: "" }, output: 0 },
            { input: { haystack: "hello", needle: "ll" }, output: 2 },
            { input: { haystack: "aaaa", needle: "bba" }, output: -1 },
            { input: { haystack: "mississippi", needle: "issip" }, output: 4 },
            { input: { haystack: "abc", needle: "c" }, output: 2 },
            { input: { haystack: "abc", needle: "abcd" }, output: -1 },
            { input: { haystack: "abcabc", needle: "cab" }, output: 2 },
        ],
    },
    {
        num: 17,
        slug: "reverse-words-in-a-string-iii",
        title: "Reverse Words in a String III",
        difficulty: "EASY",
        topics: ["strings", "two-pointers"],
        inputFormat: "{ s: string }",
        outputFormat: "string",
        constraints: "1 <= s.length <= 5*10^4; s contains printable ASCII and spaces",
        hints: [
            "Reverse each word in place.",
            "Single spaces separate words.",
        ],
        pythonBody: `    s = list(data.get("s", ""))
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] != " ":
            j += 1
        s[i:j] = reversed(s[i:j])
        i = j + 1
    return "".join(s)`,
        javaBody: `
      char[] s = (data.has("s") ? data.get("s").getAsString() : "").toCharArray();
      int i = 0;
      while (i < s.length) {
          int j = i;
          while (j < s.length && s[j] != ' ') {
              j++;
          }
          int lo = i, hi = j - 1;
          while (lo < hi) {
              char tmp = s[lo];
              s[lo] = s[hi];
              s[hi] = tmp;
              lo++;
              hi--;
          }
          i = j + 1;
      }
      return new String(s);`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      int i = 0;
      while (i < static_cast<int>(s.size())) {
          int j = i;
          while (j < static_cast<int>(s.size()) && s[j] != ' ') {
              j++;
          }
          std::reverse(s.begin() + i, s.begin() + j);
          i = j + 1;
      }
      return s;`,
        visibleCases: [
            {
                input: { s: "Let's take LeetCode contest" },
                output: "s'teL ekat edoCteeL tsetnoc",
                explanation: "Each word is reversed in place.",
            },
            {
                input: { s: "God Ding" },
                output: "doG gniD",
                explanation: "Two words reversed separately.",
            },
        ],
        hiddenCases: [
            { input: { s: "a" }, output: "a" },
            { input: { s: "ab" }, output: "ba" },
            { input: { s: "a good   example" }, output: "a doog   elpmaxe" },
            { input: { s: "hello" }, output: "olleh" },
            { input: { s: "hi there" }, output: "ih ereht" },
            { input: { s: "L" }, output: "L" },
            { input: { s: "test word" }, output: "tset drow" },
            { input: { s: "abc def ghi" }, output: "cba fed ihg" },
        ],
    },
    {
        num: 18,
        slug: "majority-element",
        title: "Majority Element",
        difficulty: "EASY",
        topics: ["arrays", "hash-table"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 5*10^4; majority element always exists",
        hints: [
            "Boyer-Moore tracks a candidate and count.",
            "Cancel equal pairs; survivor is majority.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    cand = None
    count = 0
    for x in nums:
        if count == 0:
            cand = x
            count = 1
        elif x == cand:
            count += 1
        else:
            count -= 1
    return cand`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      Integer cand = null;
      int count = 0;
      for (int i = 0; i < numsArr.size(); i++) {
          int x = numsArr.get(i).getAsInt();
          if (count == 0) {
              cand = x;
              count = 1;
          } else if (x == cand) {
              count++;
          } else {
              count--;
          }
      }
      return cand;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int cand = 0;
      int count = 0;
      for (int x : nums) {
          if (count == 0) {
              cand = x;
              count = 1;
          } else if (x == cand) {
              count++;
          } else {
              count--;
          }
      }
      return cand;`,
        visibleCases: [
            {
                input: { nums: [3, 2, 3] },
                output: 3,
                explanation: "3 appears more than half the time.",
            },
            {
                input: { nums: [2, 2, 1, 1, 1, 2, 2] },
                output: 2,
                explanation: "2 is the majority element.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [6, 5, 5] }, output: 5 },
            { input: { nums: [1, 1, 1, 2] }, output: 1 },
            { input: { nums: [4, 4, 4, 2, 4] }, output: 4 },
            { input: { nums: [7, 7, 7, 7, 1, 7] }, output: 7 },
            { input: { nums: [10, 10, 10, 10, 10, 5] }, output: 10 },
            { input: { nums: [1, 2, 1, 1] }, output: 1 },
            { input: { nums: [5, 5, 5, 5, 6, 5] }, output: 5 },
        ],
    },
    {
        num: 19,
        slug: "move-zeroes",
        title: "Move Zeroes",
        difficulty: "EASY",
        topics: ["arrays", "two-pointers"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[]",
        constraints: "1 <= nums.length <= 10^4; values fit 32-bit signed int",
        hints: [
            "Write non-zero values from left to right.",
            "Fill remaining positions with zero.",
        ],
        pythonBody: `    nums = list(data.get("nums", []))
    write = 0
    for x in nums:
        if x != 0:
            nums[write] = x
            write += 1
    while write < len(nums):
        nums[write] = 0
        write += 1
    return nums`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int[] nums = new int[numsArr.size()];
      for (int i = 0; i < numsArr.size(); i++) {
          nums[i] = numsArr.get(i).getAsInt();
      }
      int write = 0;
      for (int x : nums) {
          if (x != 0) {
              nums[write++] = x;
          }
      }
      while (write < nums.length) {
          nums[write++] = 0;
      }
      List<Integer> out = new ArrayList<>();
      for (int x : nums) out.add(x);
      return out;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int write = 0;
      for (int x : nums) {
          if (x != 0) {
              nums[write++] = x;
          }
      }
      while (write < static_cast<int>(nums.size())) {
          nums[write++] = 0;
      }
      return nums;`,
        visibleCases: [
            {
                input: { nums: [0, 1, 0, 3, 12] },
                output: [1, 3, 12, 0, 0],
                explanation: "Non-zeros shift left preserving order.",
            },
            {
                input: { nums: [0] },
                output: [0],
                explanation: "Single zero stays in place.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1] }, output: [1] },
            { input: { nums: [1, 0] }, output: [1, 0] },
            { input: { nums: [0, 0, 1] }, output: [1, 0, 0] },
            { input: { nums: [4, 2, 4, 0, 0, 3, 0, 5, 1, 0] }, output: [4, 2, 4, 3, 5, 1, 0, 0, 0, 0] },
            { input: { nums: [0, 0, 0] }, output: [0, 0, 0] },
            { input: { nums: [2, 1] }, output: [2, 1] },
            { input: { nums: [0, 2, 0, 0, 1] }, output: [2, 1, 0, 0, 0] },
            { input: { nums: [1, 2, 3] }, output: [1, 2, 3] },
        ],
    },
    {
        num: 20,
        slug: "remove-duplicates-from-sorted-array",
        title: "Remove Duplicates from Sorted Array",
        difficulty: "EASY",
        topics: ["arrays", "two-pointers"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 3*10^4; nums sorted non-decreasing",
        hints: [
            "Use write pointer for unique values.",
            "Skip duplicates while scanning.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    if not nums:
        return 0
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return k`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      if (numsArr.size() == 0) {
          return 0;
      }
      int k = 1;
      for (int i = 1; i < numsArr.size(); i++) {
          int val = numsArr.get(i).getAsInt();
          if (val != numsArr.get(k - 1).getAsInt()) {
              numsArr.set(k, numsArr.get(i));
              k++;
          }
      }
      return k;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      if (nums.empty()) {
          return 0;
      }
      int k = 1;
      for (int i = 1; i < static_cast<int>(nums.size()); i++) {
          if (nums[i] != nums[k - 1]) {
              nums[k++] = nums[i];
          }
      }
      return k;`,
        visibleCases: [
            {
                input: { nums: [1, 1, 2] },
                output: 2,
                explanation: "Unique prefix is [1, 2].",
            },
            {
                input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] },
                output: 5,
                explanation: "Five unique values in order.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [1, 1, 1, 1] }, output: 1 },
            { input: { nums: [1, 2, 3] }, output: 3 },
            { input: { nums: [1, 2, 2] }, output: 2 },
            { input: { nums: [-1, 0, 0, 0, 0, 3, 3] }, output: 3 },
            { input: { nums: [1, 1, 2, 2, 3] }, output: 3 },
            { input: { nums: [5, 5, 6, 7, 7, 8] }, output: 4 },
            { input: { nums: [0, 0, 0, 1] }, output: 2 },
        ],
    },
    {
        num: 21,
        slug: "merge-sorted-array",
        title: "Merge Sorted Array",
        difficulty: "EASY",
        topics: ["arrays", "two-pointers"],
        inputFormat: "{ nums1: number[], m: number, nums2: number[], n: number }",
        outputFormat: "number[]",
        constraints: "nums1.length == m + n; 0 <= m, n <= 200",
        hints: [
            "Merge from the back to avoid overwriting.",
            "Compare largest remaining elements.",
        ],
        pythonBody: `    nums1 = list(data.get("nums1", []))
    m = data.get("m", 0)
    nums2 = data.get("nums2", [])
    n = data.get("n", 0)
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1
    return nums1[: m + n]`,
        javaBody: `
      JsonArray nums1Arr = data.has("nums1") && data.get("nums1").isJsonArray() ? data.getAsJsonArray("nums1") : new JsonArray();
      int m = data.has("m") ? data.get("m").getAsInt() : 0;
      JsonArray nums2Arr = data.has("nums2") && data.get("nums2").isJsonArray() ? data.getAsJsonArray("nums2") : new JsonArray();
      int n = data.has("n") ? data.get("n").getAsInt() : 0;
      int[] nums1 = new int[nums1Arr.size()];
      for (int i = 0; i < nums1Arr.size(); i++) nums1[i] = nums1Arr.get(i).getAsInt();
      int[] nums2 = new int[nums2Arr.size()];
      for (int i = 0; i < nums2Arr.size(); i++) nums2[i] = nums2Arr.get(i).getAsInt();
      int i = m - 1, j = n - 1, k = m + n - 1;
      while (j >= 0) {
          if (i >= 0 && nums1[i] > nums2[j]) {
              nums1[k--] = nums1[i--];
          } else {
              nums1[k--] = nums2[j--];
          }
      }
      List<Integer> out = new ArrayList<>();
      for (int t = 0; t < m + n; t++) out.add(nums1[t]);
      return out;`,
        cppBody: `
      std::vector<int> nums1 = data.contains("nums1") && data["nums1"].is_array()
          ? data["nums1"].get<std::vector<int>>()
          : std::vector<int>{};
      int m = data.contains("m") ? data["m"].get<int>() : 0;
      std::vector<int> nums2 = data.contains("nums2") && data["nums2"].is_array()
          ? data["nums2"].get<std::vector<int>>()
          : std::vector<int>{};
      int n = data.contains("n") ? data["n"].get<int>() : 0;
      int i = m - 1, j = n - 1, k = m + n - 1;
      while (j >= 0) {
          if (i >= 0 && nums1[i] > nums2[j]) {
              nums1[k--] = nums1[i--];
          } else {
              nums1[k--] = nums2[j--];
          }
      }
      nums1.resize(m + n);
      return nums1;`,
        visibleCases: [
            {
                input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
                output: [1, 2, 2, 3, 5, 6],
                explanation: "Merged sorted result in nums1.",
            },
            {
                input: { nums1: [1], m: 1, nums2: [], n: 0 },
                output: [1],
                explanation: "nums2 is empty.",
            },
        ],
        hiddenCases: [
            { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, output: [1] },
            { input: { nums1: [2, 0], m: 1, nums2: [1], n: 1 }, output: [1, 2] },
            { input: { nums1: [4, 5, 6, 0, 0, 0], m: 3, nums2: [1, 2, 3], n: 3 }, output: [1, 2, 3, 4, 5, 6] },
            { input: { nums1: [1, 2, 4, 5, 6, 0], m: 5, nums2: [3], n: 1 }, output: [1, 2, 3, 4, 5, 6] },
            { input: { nums1: [1, 0], m: 1, nums2: [2], n: 1 }, output: [1, 2] },
            { input: { nums1: [0, 0, 0], m: 0, nums2: [1, 2, 3], n: 3 }, output: [1, 2, 3] },
            { input: { nums1: [1, 2, 3, 0, 0], m: 3, nums2: [4, 5], n: 2 }, output: [1, 2, 3, 4, 5] },
            { input: { nums1: [2, 0, 0], m: 1, nums2: [1, 3], n: 2 }, output: [1, 2, 3] },
        ],
    },
    {
        num: 22,
        slug: "roman-to-integer",
        title: "Roman to Integer",
        difficulty: "EASY",
        topics: ["strings", "math"],
        inputFormat: "{ s: string }",
        outputFormat: "number",
        constraints: "1 <= s.length <= 15; s is a valid Roman numeral",
        hints: [
            "Map each symbol to a value.",
            "Subtract when a smaller value precedes a larger one.",
        ],
        pythonBody: `    s = data.get("s", "")
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        if i + 1 < len(s) and vals[ch] < vals[s[i + 1]]:
            total -= vals[ch]
        else:
            total += vals[ch]
    return total`,
        javaBody: `
      String s = data.has("s") ? data.get("s").getAsString() : "";
      Map<Character, Integer> vals = new HashMap<>();
      vals.put('I', 1); vals.put('V', 5); vals.put('X', 10); vals.put('L', 50);
      vals.put('C', 100); vals.put('D', 500); vals.put('M', 1000);
      int total = 0;
      for (int i = 0; i < s.length(); i++) {
          int cur = vals.get(s.charAt(i));
          if (i + 1 < s.length() && cur < vals.get(s.charAt(i + 1))) {
              total -= cur;
          } else {
              total += cur;
          }
      }
      return total;`,
        cppBody: `
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::unordered_map<char, int> vals{{'I',1},{'V',5},{'X',10},{'L',50},{'C',100},{'D',500},{'M',1000}};
      int total = 0;
      for (int i = 0; i < static_cast<int>(s.size()); i++) {
          int cur = vals[s[i]];
          if (i + 1 < static_cast<int>(s.size()) && cur < vals[s[i + 1]]) {
              total -= cur;
          } else {
              total += cur;
          }
      }
      return total;`,
        visibleCases: [
            {
                input: { s: "III" },
                output: 3,
                explanation: "I + I + I = 3.",
            },
            {
                input: { s: "LVIII" },
                output: 58,
                explanation: "L + V + III = 58.",
            },
        ],
        hiddenCases: [
            { input: { s: "IV" }, output: 4 },
            { input: { s: "IX" }, output: 9 },
            { input: { s: "MCMXCIV" }, output: 1994 },
            { input: { s: "X" }, output: 10 },
            { input: { s: "XL" }, output: 40 },
            { input: { s: "XC" }, output: 90 },
            { input: { s: "CD" }, output: 400 },
            { input: { s: "CM" }, output: 900 },
        ],
    },
    {
        num: 23,
        slug: "single-number",
        title: "Single Number",
        difficulty: "EASY",
        topics: ["bit-manipulation", "arrays"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 3*10^4; exactly one element appears once",
        hints: [
            "XOR pairs cancel out.",
            "XOR all numbers together.",
        ],
        pythonBody: `    ans = 0
    for x in data.get("nums", []):
        ans ^= x
    return ans`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int ans = 0;
      for (int i = 0; i < numsArr.size(); i++) {
          ans ^= numsArr.get(i).getAsInt();
      }
      return ans;`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int ans = 0;
      for (int x : nums) {
          ans ^= x;
      }
      return ans;`,
        visibleCases: [
            {
                input: { nums: [2, 2, 1] },
                output: 1,
                explanation: "1 appears once.",
            },
            {
                input: { nums: [4, 1, 2, 1, 2] },
                output: 4,
                explanation: "4 appears once.",
            },
        ],
        hiddenCases: [
            { input: { nums: [1] }, output: 1 },
            { input: { nums: [0, 1, 0] }, output: 1 },
            { input: { nums: [7, 3, 5, 3, 5] }, output: 7 },
            { input: { nums: [-1, -1, -2] }, output: -2 },
            { input: { nums: [10, 20, 10] }, output: 20 },
            { input: { nums: [99, 42, 99] }, output: 42 },
            { input: { nums: [6, 6, 8, 8, 9] }, output: 9 },
            { input: { nums: [100000, 200000, 100000] }, output: 200000 },
        ],
    },
    {
        num: 24,
        slug: "missing-number",
        title: "Missing Number",
        difficulty: "EASY",
        topics: ["math", "bit-manipulation"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "n == nums.length; nums has n distinct values in [0, n]",
        hints: [
            "Sum of 0..n minus sum(nums).",
            "XOR index with each value also works.",
        ],
        pythonBody: `    nums = data.get("nums", [])
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`,
        javaBody: `
      JsonArray numsArr = data.has("nums") && data.get("nums").isJsonArray() ? data.getAsJsonArray("nums") : new JsonArray();
      int n = numsArr.size();
      long sum = 0;
      for (int i = 0; i < numsArr.size(); i++) {
          sum += numsArr.get(i).getAsInt();
      }
      return (int) (n * (long) (n + 1) / 2 - sum);`,
        cppBody: `
      std::vector<int> nums = data.contains("nums") && data["nums"].is_array()
          ? data["nums"].get<std::vector<int>>()
          : std::vector<int>{};
      int n = static_cast<int>(nums.size());
      long long sum = 0;
      for (int x : nums) sum += x;
      return static_cast<int>(1LL * n * (n + 1) / 2 - sum);`,
        visibleCases: [
            {
                input: { nums: [3, 0, 1] },
                output: 2,
                explanation: "2 is missing from [0, 3].",
            },
            {
                input: { nums: [0, 1] },
                output: 2,
                explanation: "2 is missing from [0, 2].",
            },
        ],
        hiddenCases: [
            { input: { nums: [9, 6, 4, 2, 3, 5, 7, 0, 1] }, output: 8 },
            { input: { nums: [0] }, output: 1 },
            { input: { nums: [1] }, output: 0 },
            { input: { nums: [2, 0] }, output: 1 },
            { input: { nums: [4, 0, 1, 2] }, output: 3 },
            { input: { nums: [5, 0, 1, 2, 3] }, output: 4 },
            { input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, output: 0 },
            { input: { nums: [0, 2, 3] }, output: 1 },
        ],
    },
    {
        num: 25,
        slug: "fibonacci-number",
        title: "Fibonacci Number",
        difficulty: "EASY",
        topics: ["dynamic-programming", "math"],
        inputFormat: "{ n: number }",
        outputFormat: "number",
        constraints: "0 <= n <= 30",
        hints: [
            "F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).",
            "Iterate with two variables.",
        ],
        pythonBody: `    n = data.get("n", 0)
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
        javaBody: `
      int n = data.has("n") ? data.get("n").getAsInt() : 0;
      if (n <= 1) {
          return n;
      }
      int a = 0, b = 1;
      for (int i = 2; i <= n; i++) {
          int c = a + b;
          a = b;
          b = c;
      }
      return b;`,
        cppBody: `
      int n = data.contains("n") ? data["n"].get<int>() : 0;
      if (n <= 1) {
          return n;
      }
      int a = 0, b = 1;
      for (int i = 2; i <= n; i++) {
          int c = a + b;
          a = b;
          b = c;
      }
      return b;`,
        visibleCases: [
            {
                input: { n: 2 },
                output: 1,
                explanation: "F(2) = F(1) + F(0) = 1.",
            },
            {
                input: { n: 3 },
                output: 2,
                explanation: "F(3) = F(2) + F(1) = 2.",
            },
        ],
        hiddenCases: [
            { input: { n: 0 }, output: 0 },
            { input: { n: 1 }, output: 1 },
            { input: { n: 4 }, output: 3 },
            { input: { n: 5 }, output: 5 },
            { input: { n: 6 }, output: 8 },
            { input: { n: 7 }, output: 13 },
            { input: { n: 10 }, output: 55 },
            { input: { n: 12 }, output: 144 },
        ],
    },
];
