import { javaSolution, cppSolution, type MultiLangSolutionMap } from "../solution-wrappers.js";

export const BATCH_01: MultiLangSolutionMap = {
  "two-sum": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "valid-parentheses": {
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
              if (st.isEmpty() || st.peek() != pairs.getOrDefault(ch, '#')) {
                  return false;
              }
              st.pop();
          }
      }
      return st.isEmpty();
    `),
    cpp: cppSolution(`
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
      return st.empty();
    `),
  },
  "best-time-to-buy-and-sell-stock": {
    java: javaSolution(`
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
      return ans;
    `),
    cpp: cppSolution(`
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
      return ans;
    `),
  },
  "valid-palindrome": {
    java: javaSolution(`
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
      return true;
    `),
    cpp: cppSolution(`
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
      return true;
    `),
  },
  "valid-anagram": {
    java: javaSolution(`
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);
    `),
    cpp: cppSolution(`
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;
    `),
  },
  "climbing-stairs": {
    java: javaSolution(`
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
      return b;
    `),
    cpp: cppSolution(`
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
      return b;
    `),
  },
  "binary-search": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "contains-duplicate": {
    java: javaSolution(`
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);
    `),
    cpp: cppSolution(`
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;
    `),
  },
  "isomorphic-strings": {
    java: javaSolution(`
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);
    `),
    cpp: cppSolution(`
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;
    `),
  },
  "ransom-note": {
    java: javaSolution(`
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);
    `),
    cpp: cppSolution(`
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;
    `),
  },
  "first-bad-version": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "sqrtx": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "find-peak-element": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "search-insert-position": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "longest-common-prefix": {
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
          if (last.count(ch) && last[ch] >= left) {
              left = last[ch] + 1;
          }
          last[ch] = right;
          best = std::max(best, right - left + 1);
      }
      return best;
    `),
  },
  "implement-strstr": {
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
          if (last.count(ch) && last[ch] >= left) {
              left = last[ch] + 1;
          }
          last[ch] = right;
          best = std::max(best, right - left + 1);
      }
      return best;
    `),
  },
  "reverse-words-in-a-string-iii": {
    java: javaSolution(`
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
      return true;
    `),
    cpp: cppSolution(`
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
      return true;
    `),
  },
  "majority-element": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "move-zeroes": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "remove-duplicates-from-sorted-array": {
    java: javaSolution(`
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
      return -1;
    `),
    cpp: cppSolution(`
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
      return -1;
    `),
  },
  "merge-sorted-array": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "roman-to-integer": {
    java: javaSolution(`
      String s = data.has("s") ? data.get("s").getAsString() : "";
      String t = data.has("t") ? data.get("t").getAsString() : "";
      Map<Character, Integer> cs = new HashMap<>();
      Map<Character, Integer> ct = new HashMap<>();
      for (int i = 0; i < s.length(); i++) cs.put(s.charAt(i), cs.getOrDefault(s.charAt(i), 0) + 1);
      for (int i = 0; i < t.length(); i++) ct.put(t.charAt(i), ct.getOrDefault(t.charAt(i), 0) + 1);
      return cs.equals(ct);
    `),
    cpp: cppSolution(`
      std::string s = data.contains("s") ? data["s"].get<std::string>() : "";
      std::string t = data.contains("t") ? data["t"].get<std::string>() : "";
      std::unordered_map<char, int> cs, ct;
      for (char ch : s) cs[ch]++;
      for (char ch : t) ct[ch]++;
      return cs == ct;
    `),
  },
  "single-number": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "missing-number": {
    java: javaSolution(`
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
      return new ArrayList<Integer>();
    `),
    cpp: cppSolution(`
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
      return json::array();
    `),
  },
  "fibonacci-number": {
    java: javaSolution(`
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
      return b;
    `),
    cpp: cppSolution(`
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
      return b;
    `),
  },
};
