export interface ProblemDefinition {
  num: number; // 1-100
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  hints: string[];
  pythonSolution: string; // full runnable Python using JSON stdin protocol
  visibleCases: [
    { input: unknown; output: unknown; explanation?: string },
    { input: unknown; output: unknown; explanation?: string }
  ];
  hiddenCases: Array<{ input: unknown; output: unknown }>; // exactly 8
}

const pySolution = (body: string): string => `import json
import sys

${body.trim()}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read() or "{}")
    result = solve(data)
    print(json.dumps(result))
`;

void pySolution;

export const PROBLEM_DEFINITIONS: ProblemDefinition[] = [
  {
    "num": 1,
    "slug": "two-sum",
    "title": "Two Sum",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "hash-table"
    ],
    "description": "Overview\nYou are given a list of integers and a target sum.\n\nGiven\n- An integer array nums\n- An integer target\n\nGoal\nReturn the indices of two distinct elements in nums whose values add up to target. You may assume exactly one valid pair exists unless stated otherwise; if no pair exists, return an empty array.\n\nNotes\n- You may not use the same element twice.\n- The answer may be returned in any order.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 2,
    "slug": "valid-parentheses",
    "title": "Valid Parentheses",
    "difficulty": "EASY",
    "topics": [
      "stack",
      "strings"
    ],
    "description": "Overview\nYou are given a string containing only bracket characters.\n\nGiven\n- A string s consisting of '(', ')', '{', '}', '[' and ']'\n\nGoal\nDetermine whether s is valid: every opening bracket must be closed by the same type of bracket in the correct order.\n\nNotes\n- An empty string is considered valid.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 10^5; chars in ()[]{}",
    "hints": [
      "Use a stack.",
      "Map each closing bracket to its opening pair."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    pairs = {')': '(', ']': '[', '}': '{'}\n    st = []\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        else:\n            if not st or st[-1] != pairs.get(ch):\n                return False\n            st.pop()\n    return not st\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "()[]{}"
        },
        "output": true,
        "explanation": "Every opener closes in order."
      },
      {
        "input": {
          "s": "(]"
        },
        "output": false,
        "explanation": "Mismatched pair."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "([{}])"
        },
        "output": true
      },
      {
        "input": {
          "s": "([)]"
        },
        "output": false
      },
      {
        "input": {
          "s": "(((("
        },
        "output": false
      },
      {
        "input": {
          "s": "]"
        },
        "output": false
      },
      {
        "input": {
          "s": "{[]}"
        },
        "output": true
      },
      {
        "input": {
          "s": "((()))[]{}"
        },
        "output": true
      },
      {
        "input": {
          "s": "(()"
        },
        "output": false
      }
    ]
  },
  {
    "num": 3,
    "slug": "best-time-to-buy-and-sell-stock",
    "title": "Best Time to Buy and Sell Stock",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "greedy"
    ],
    "description": "Overview\nYou are given daily stock prices and may complete at most one transaction.\n\nGiven\n- An integer array prices where prices[i] is the stock price on day i\n\nGoal\nReturn the maximum profit you can achieve from one purchase on one day and one sale on a later day. If no profit is possible, return 0.\n\nNotes\n- You must buy before you sell.",
    "inputFormat": "{ prices: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= prices.length <= 10^5",
    "hints": [
      "Track the minimum price seen so far.",
      "Update best profit at each day."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    prices = data.get(\"prices\", [])\n    if not prices:\n        return 0\n    min_price = prices[0]\n    ans = 0\n    for p in prices[1:]:\n        ans = max(ans, p - min_price)\n        min_price = min(min_price, p)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "prices": [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        },
        "output": 5,
        "explanation": "Buy 1, sell 6."
      },
      {
        "input": {
          "prices": [
            7,
            6,
            4,
            3,
            1
          ]
        },
        "output": 0,
        "explanation": "No profitable trade."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "prices": [
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "prices": [
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            2,
            4,
            1
          ]
        },
        "output": 2
      },
      {
        "input": {
          "prices": [
            3,
            3,
            5,
            0,
            0,
            3,
            1,
            4
          ]
        },
        "output": 4
      },
      {
        "input": {
          "prices": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            5,
            4,
            3,
            2,
            1,
            6
          ]
        },
        "output": 5
      },
      {
        "input": {
          "prices": [
            1,
            10,
            2,
            9
          ]
        },
        "output": 9
      },
      {
        "input": {
          "prices": [
            9,
            8,
            7,
            6,
            5
          ]
        },
        "output": 0
      }
    ]
  },
  {
    "num": 4,
    "slug": "valid-palindrome",
    "title": "Valid Palindrome",
    "difficulty": "EASY",
    "topics": [
      "two-pointers",
      "strings"
    ],
    "description": "Overview\nYou are given a string that may contain letters, digits, spaces, and punctuation.\n\nGiven\n- A string s\n\nGoal\nReturn true if s reads the same forward and backward after considering only alphanumeric characters and ignoring case. Otherwise, return false.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 5,
    "slug": "valid-anagram",
    "title": "Valid Anagram",
    "difficulty": "EASY",
    "topics": [
      "hash-table",
      "strings"
    ],
    "description": "Overview\nTwo strings are anagrams if they contain the same characters with the same frequencies.\n\nGiven\n- Two strings s and t\n\nGoal\nReturn true if t is an anagram of s, and false otherwise.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 6,
    "slug": "climbing-stairs",
    "title": "Climbing Stairs",
    "difficulty": "EASY",
    "topics": [
      "dynamic-programming",
      "math"
    ],
    "description": "Overview\nYou are climbing a staircase with n steps. At each move you may take 1 or 2 steps.\n\nGiven\n- An integer n representing the number of steps\n\nGoal\nReturn the number of distinct ways to reach the top.",
    "inputFormat": "{ n: number }",
    "outputFormat": "number",
    "constraints": "1 <= n <= 45",
    "hints": [
      "This is Fibonacci DP.",
      "Keep only last two states."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    n = data.get(\"n\", 0)\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "n": 2
        },
        "output": 2
      },
      {
        "input": {
          "n": 3
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "n": 1
        },
        "output": 1
      },
      {
        "input": {
          "n": 4
        },
        "output": 5
      },
      {
        "input": {
          "n": 5
        },
        "output": 8
      },
      {
        "input": {
          "n": 6
        },
        "output": 13
      },
      {
        "input": {
          "n": 7
        },
        "output": 21
      },
      {
        "input": {
          "n": 8
        },
        "output": 34
      },
      {
        "input": {
          "n": 10
        },
        "output": 89
      },
      {
        "input": {
          "n": 12
        },
        "output": 233
      }
    ]
  },
  {
    "num": 7,
    "slug": "binary-search",
    "title": "Binary Search",
    "difficulty": "EASY",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given a sorted array and a target value.\n\nGiven\n- A sorted integer array nums in non-decreasing order\n- An integer target\n\nGoal\nReturn the index of target in nums if it is present. If target is not found, return -1.\n\nNotes\n- You must write an algorithm with O(log n) runtime.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 8,
    "slug": "contains-duplicate",
    "title": "Contains Duplicate",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "hash-table"
    ],
    "description": "Overview\nYou are given an integer array and need to check for repeated values.\n\nGiven\n- An integer array nums\n\nGoal\nReturn true if any value appears at least twice in the array, and false if every element is distinct.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 9,
    "slug": "isomorphic-strings",
    "title": "Isomorphic Strings",
    "difficulty": "EASY",
    "topics": [
      "hash-table",
      "strings"
    ],
    "description": "Overview\nTwo strings are isomorphic if the characters in one string can be replaced to get the other while preserving order.\n\nGiven\n- Two strings s and t of equal length\n\nGoal\nReturn true if s and t are isomorphic, meaning there is a one-to-one mapping of characters from s to t. Otherwise, return false.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 10,
    "slug": "ransom-note",
    "title": "Ransom Note",
    "difficulty": "EASY",
    "topics": [
      "hash-table",
      "strings"
    ],
    "description": "Overview\nA ransom note is built from letters taken from a magazine.\n\nGiven\n- Two strings ransomNote and magazine\n\nGoal\nReturn true if ransomNote can be constructed using letters from magazine, where each letter in magazine may be used only once. Otherwise, return false.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 11,
    "slug": "first-bad-version",
    "title": "First Bad Version",
    "difficulty": "EASY",
    "topics": [
      "binary-search"
    ],
    "description": "Overview\nYou have n versions labeled from 1 to n, and all versions after the first bad one are also bad.\n\nGiven\n- An integer n\n- Access to a function isBadVersion(version) that returns true for bad versions\n\nGoal\nReturn the version number of the first bad version.\n\nNotes\n- Minimize the number of calls to isBadVersion.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 12,
    "slug": "sqrtx",
    "title": "Sqrt(x)",
    "difficulty": "EASY",
    "topics": [
      "math",
      "binary-search"
    ],
    "description": "Overview\nYou need the integer square root of a non-negative integer.\n\nGiven\n- A non-negative integer x\n\nGoal\nReturn the largest integer y such that y * y <= x. Do not use built-in exponent functions.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 13,
    "slug": "find-peak-element",
    "title": "Find Peak Element",
    "difficulty": "EASY",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nA peak element is strictly greater than its neighbors.\n\nGiven\n- An integer array nums where nums[i] != nums[i + 1] for all valid i\n\nGoal\nReturn the index of any peak element.\n\nNotes\n- You may assume nums[-1] = nums[n] = -infinity.\n- You must write an algorithm that runs in O(log n) time.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 14,
    "slug": "search-insert-position",
    "title": "Search Insert Position",
    "difficulty": "EASY",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given a sorted array and a target value.\n\nGiven\n- A sorted integer array nums in non-decreasing order\n- An integer target\n\nGoal\nIf target exists in nums, return its index. Otherwise, return the index where it would be inserted to keep the array sorted.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 15,
    "slug": "longest-common-prefix",
    "title": "Longest Common Prefix",
    "difficulty": "EASY",
    "topics": [
      "strings"
    ],
    "description": "Overview\nYou are given a list of strings and need their shared starting substring.\n\nGiven\n- An array of strings strs\n\nGoal\nReturn the longest common prefix string shared by all strings in strs. If there is no common prefix, return an empty string.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 16,
    "slug": "implement-strstr",
    "title": "Implement strStr",
    "difficulty": "EASY",
    "topics": [
      "strings",
      "two-pointers"
    ],
    "description": "Overview\nYou need to find the first occurrence of a needle inside a haystack.\n\nGiven\n- Two strings haystack and needle\n\nGoal\nReturn the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 17,
    "slug": "reverse-words-in-a-string-iii",
    "title": "Reverse Words in a String III",
    "difficulty": "EASY",
    "topics": [
      "strings",
      "two-pointers"
    ],
    "description": "Overview\nYou are given a sentence of words separated by spaces.\n\nGiven\n- A string s\n\nGoal\nReverse the characters in each word while preserving the original word order and whitespace positions. Leading and trailing spaces should not appear unless present in the input.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 18,
    "slug": "majority-element",
    "title": "Majority Element",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "hash-table"
    ],
    "description": "Overview\nYou are given an array where one element appears more than half the time.\n\nGiven\n- An integer array nums of length n\n\nGoal\nReturn the element that appears more than floor(n / 2) times.\n\nNotes\n- You may assume the majority element always exists.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 19,
    "slug": "move-zeroes",
    "title": "Move Zeroes",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "two-pointers"
    ],
    "description": "Overview\nYou are given an integer array containing zeros and non-zero values.\n\nGiven\n- An integer array nums\n\nGoal\nMove all zeros to the end of nums while maintaining the relative order of the non-zero elements. Perform this in-place.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 20,
    "slug": "remove-duplicates-from-sorted-array",
    "title": "Remove Duplicates from Sorted Array",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "two-pointers"
    ],
    "description": "Overview\nYou are given a sorted array that may contain duplicate values.\n\nGiven\n- A sorted integer array nums in non-decreasing order\n\nGoal\nRemove duplicates in-place so each unique value appears only once. Return k, the number of unique elements, where the first k positions of nums contain those unique values in order.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 21,
    "slug": "merge-sorted-array",
    "title": "Merge Sorted Array",
    "difficulty": "EASY",
    "topics": [
      "arrays",
      "two-pointers"
    ],
    "description": "Overview\nYou are merging two sorted arrays into the first array, which has enough trailing space.\n\nGiven\n- Two sorted integer arrays nums1 and nums2\n- Integers m and n representing the number of elements initialized in nums1 and nums2\n\nGoal\nMerge nums2 into nums1 as one sorted array in non-decreasing order. The merge must be done in-place within nums1.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 22,
    "slug": "roman-to-integer",
    "title": "Roman to Integer",
    "difficulty": "EASY",
    "topics": [
      "strings",
      "math"
    ],
    "description": "Overview\nRoman numerals use letters to represent values and are usually written largest to smallest from left to right.\n\nGiven\n- A string s representing a valid Roman numeral\n\nGoal\nReturn the integer value of the Roman numeral.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 23,
    "slug": "single-number",
    "title": "Single Number",
    "difficulty": "EASY",
    "topics": [
      "bit-manipulation",
      "arrays"
    ],
    "description": "Overview\nEvery element in the array appears twice except for one.\n\nGiven\n- An integer array nums where exactly one element appears once and every other element appears twice\n\nGoal\nReturn the element that appears only once.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 24,
    "slug": "missing-number",
    "title": "Missing Number",
    "difficulty": "EASY",
    "topics": [
      "math",
      "bit-manipulation"
    ],
    "description": "Overview\nAn array contains n distinct numbers taken from the range 0 to n.\n\nGiven\n- An integer array nums containing n distinct numbers in the range [0, n]\n\nGoal\nReturn the one number in the range [0, n] that is missing from the array.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 25,
    "slug": "fibonacci-number",
    "title": "Fibonacci Number",
    "difficulty": "EASY",
    "topics": [
      "dynamic-programming",
      "math"
    ],
    "description": "Overview\nThe Fibonacci sequence is defined recursively.\n\nGiven\n- An integer n\n\nGoal\nReturn F(n), where F(0) = 0, F(1) = 1, and F(n) = F(n - 1) + F(n - 2) for n > 1.",
    "inputFormat": "{ n: number }",
    "outputFormat": "number",
    "constraints": "1 <= n <= 45",
    "hints": [
      "This is Fibonacci DP.",
      "Keep only last two states."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    n = data.get(\"n\", 0)\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "n": 2
        },
        "output": 2
      },
      {
        "input": {
          "n": 3
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "n": 1
        },
        "output": 1
      },
      {
        "input": {
          "n": 4
        },
        "output": 5
      },
      {
        "input": {
          "n": 5
        },
        "output": 8
      },
      {
        "input": {
          "n": 6
        },
        "output": 13
      },
      {
        "input": {
          "n": 7
        },
        "output": 21
      },
      {
        "input": {
          "n": 8
        },
        "output": 34
      },
      {
        "input": {
          "n": 10
        },
        "output": 89
      },
      {
        "input": {
          "n": 12
        },
        "output": 233
      }
    ]
  },
  {
    "num": 26,
    "slug": "pascals-triangle",
    "title": "Pascal's Triangle",
    "difficulty": "EASY",
    "topics": [
      "dynamic-programming",
      "arrays"
    ],
    "description": "Overview\nPascal's triangle is built row by row from sums of adjacent values.\n\nGiven\n- An integer numRows\n\nGoal\nReturn the first numRows rows of Pascal's triangle as a list of rows, where each row is a list of integers.",
    "inputFormat": "{ n: number }",
    "outputFormat": "number",
    "constraints": "1 <= n <= 45",
    "hints": [
      "This is Fibonacci DP.",
      "Keep only last two states."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    n = data.get(\"n\", 0)\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "n": 2
        },
        "output": 2
      },
      {
        "input": {
          "n": 3
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "n": 1
        },
        "output": 1
      },
      {
        "input": {
          "n": 4
        },
        "output": 5
      },
      {
        "input": {
          "n": 5
        },
        "output": 8
      },
      {
        "input": {
          "n": 6
        },
        "output": 13
      },
      {
        "input": {
          "n": 7
        },
        "output": 21
      },
      {
        "input": {
          "n": 8
        },
        "output": 34
      },
      {
        "input": {
          "n": 10
        },
        "output": 89
      },
      {
        "input": {
          "n": 12
        },
        "output": 233
      }
    ]
  },
  {
    "num": 27,
    "slug": "flood-fill",
    "title": "Flood Fill",
    "difficulty": "EASY",
    "topics": [
      "graphs",
      "queue"
    ],
    "description": "Overview\nYou are given an image represented as a grid and a starting pixel.\n\nGiven\n- An integer matrix image representing pixel values\n- Integers sr and sc for the starting row and column\n- An integer color representing the new color\n\nGoal\nPerform a flood fill starting from image[sr][sc]: replace the starting color and all connected pixels of the same original color with color. Return the modified image.\n\nNotes\n- Two pixels are connected if they share an edge and have the same original color.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 28,
    "slug": "same-tree",
    "title": "Same Tree",
    "difficulty": "EASY",
    "topics": [
      "trees",
      "dfs"
    ],
    "description": "Overview\nYou are given the roots of two binary trees.\n\nGiven\n- The roots of two binary trees p and q\n\nGoal\nReturn true if the two trees are structurally identical and every corresponding node has the same value. Otherwise, return false.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 29,
    "slug": "symmetric-tree",
    "title": "Symmetric Tree",
    "difficulty": "EASY",
    "topics": [
      "trees",
      "dfs"
    ],
    "description": "Overview\nYou are given the root of a binary tree.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn true if the tree is symmetric around its center (the left subtree is a mirror of the right subtree). Otherwise, return false.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 30,
    "slug": "maximum-depth-of-binary-tree",
    "title": "Maximum Depth of Binary Tree",
    "difficulty": "EASY",
    "topics": [
      "trees",
      "dfs"
    ],
    "description": "Overview\nYou are given the root of a binary tree.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn the maximum depth of the tree, defined as the number of nodes along the longest path from the root down to the farthest leaf.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 31,
    "slug": "diameter-of-binary-tree",
    "title": "Diameter of Binary Tree",
    "difficulty": "EASY",
    "topics": [
      "trees",
      "dynamic-programming"
    ],
    "description": "Overview\nThe diameter of a binary tree is the length of the longest path between any two nodes in the tree.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn the diameter of the tree. The path may or may not pass through the root.\n\nNotes\n- The length of a path is measured by the number of edges between nodes.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 32,
    "slug": "linked-list-cycle",
    "title": "Linked List Cycle",
    "difficulty": "EASY",
    "topics": [
      "linked-list",
      "two-pointers"
    ],
    "description": "Overview\nYou are given the head of a singly linked list.\n\nGiven\n- The head of a linked list\n\nGoal\nReturn true if the linked list contains a cycle, and false otherwise.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 33,
    "slug": "palindrome-linked-list",
    "title": "Palindrome Linked List",
    "difficulty": "EASY",
    "topics": [
      "linked-list",
      "stack"
    ],
    "description": "Overview\nYou are given the head of a singly linked list.\n\nGiven\n- The head of a singly linked list\n\nGoal\nReturn true if the sequence of node values forms a palindrome, and false otherwise.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 34,
    "slug": "min-stack",
    "title": "Min Stack",
    "difficulty": "EASY",
    "topics": [
      "stack"
    ],
    "description": "Overview\nDesign a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nGiven\n- A sequence of operations on a MinStack data structure\n\nGoal\nImplement MinStack so that push, pop, top, and getMin each work correctly. getMin must return the smallest element currently in the stack.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 10^5; chars in ()[]{}",
    "hints": [
      "Use a stack.",
      "Map each closing bracket to its opening pair."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    pairs = {')': '(', ']': '[', '}': '{'}\n    st = []\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        else:\n            if not st or st[-1] != pairs.get(ch):\n                return False\n            st.pop()\n    return not st\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "()[]{}"
        },
        "output": true,
        "explanation": "Every opener closes in order."
      },
      {
        "input": {
          "s": "(]"
        },
        "output": false,
        "explanation": "Mismatched pair."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "([{}])"
        },
        "output": true
      },
      {
        "input": {
          "s": "([)]"
        },
        "output": false
      },
      {
        "input": {
          "s": "(((("
        },
        "output": false
      },
      {
        "input": {
          "s": "]"
        },
        "output": false
      },
      {
        "input": {
          "s": "{[]}"
        },
        "output": true
      },
      {
        "input": {
          "s": "((()))[]{}"
        },
        "output": true
      },
      {
        "input": {
          "s": "(()"
        },
        "output": false
      }
    ]
  },
  {
    "num": 35,
    "slug": "implement-queue-using-stacks",
    "title": "Implement Queue using Stacks",
    "difficulty": "EASY",
    "topics": [
      "stack",
      "queue"
    ],
    "description": "Overview\nDesign a first-in-first-out queue using only stack operations.\n\nGiven\n- A sequence of operations on a MyQueue data structure\n\nGoal\nImplement a queue that supports push, pop, peek, and empty using two stacks (or equivalent stack-based logic).",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 10^5; chars in ()[]{}",
    "hints": [
      "Use a stack.",
      "Map each closing bracket to its opening pair."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    pairs = {')': '(', ']': '[', '}': '{'}\n    st = []\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        else:\n            if not st or st[-1] != pairs.get(ch):\n                return False\n            st.pop()\n    return not st\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "()[]{}"
        },
        "output": true,
        "explanation": "Every opener closes in order."
      },
      {
        "input": {
          "s": "(]"
        },
        "output": false,
        "explanation": "Mismatched pair."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "([{}])"
        },
        "output": true
      },
      {
        "input": {
          "s": "([)]"
        },
        "output": false
      },
      {
        "input": {
          "s": "(((("
        },
        "output": false
      },
      {
        "input": {
          "s": "]"
        },
        "output": false
      },
      {
        "input": {
          "s": "{[]}"
        },
        "output": true
      },
      {
        "input": {
          "s": "((()))[]{}"
        },
        "output": true
      },
      {
        "input": {
          "s": "(()"
        },
        "output": false
      }
    ]
  },
  {
    "num": 36,
    "slug": "3sum",
    "title": "3Sum",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "two-pointers"
    ],
    "description": "Overview\nYou are given an integer array and need unique triplets that sum to zero.\n\nGiven\n- An integer array nums\n\nGoal\nReturn all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotes\n- The solution set must not contain duplicate triplets.",
    "inputFormat": "{ nums: number[] }",
    "outputFormat": "number[][] sorted lexicographically",
    "constraints": "0 <= nums.length <= 3000",
    "hints": [
      "Sort first.",
      "Fix one index and use two pointers.",
      "Skip duplicates."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = sorted(data.get(\"nums\", []))\n    res = []\n    n = len(nums)\n    for i in range(n):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        if nums[i] > 0:\n            break\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r + 1]:\n                    r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        },
        "output": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            0,
            1,
            1
          ]
        },
        "output": []
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            0,
            0,
            0
          ]
        },
        "output": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "nums": []
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            1,
            1,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            1
          ]
        },
        "output": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            3,
            -2,
            1,
            0
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        },
        "output": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            -2,
            -1
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            0,
            2,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ]
        ]
      }
    ]
  },
  {
    "num": 37,
    "slug": "longest-substring-without-repeating-characters",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "MEDIUM",
    "topics": [
      "sliding-window",
      "hash-table",
      "strings"
    ],
    "description": "Overview\nYou are given a string and need the longest contiguous substring with all unique characters.\n\nGiven\n- A string s\n\nGoal\nReturn the length of the longest substring without repeating characters.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 38,
    "slug": "container-with-most-water",
    "title": "Container With Most Water",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "two-pointers",
      "greedy"
    ],
    "description": "Overview\nYou are given vertical lines on the x-axis forming the sides of containers.\n\nGiven\n- An integer array height where height[i] is the height of the i-th line\n\nGoal\nReturn the maximum amount of water a container can store. A container is formed by choosing two lines and using the shorter height as the limiting side.",
    "inputFormat": "{ height: number[] }",
    "outputFormat": "number",
    "constraints": "2 <= height.length <= 10^5",
    "hints": [
      "Start with widest container.",
      "Move the shorter side inward."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    h = data.get(\"height\", [])\n    l, r = 0, len(h) - 1\n    best = 0\n    while l < r:\n        best = max(best, min(h[l], h[r]) * (r - l))\n        if h[l] < h[r]:\n            l += 1\n        else:\n            r -= 1\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "height": [
            1,
            8,
            6,
            2,
            5,
            4,
            8,
            3,
            7
          ]
        },
        "output": 49
      },
      {
        "input": {
          "height": [
            1,
            1
          ]
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "height": [
            4,
            3,
            2,
            1,
            4
          ]
        },
        "output": 16
      },
      {
        "input": {
          "height": [
            1,
            2,
            1
          ]
        },
        "output": 2
      },
      {
        "input": {
          "height": [
            2,
            3,
            10,
            5,
            7,
            8,
            9
          ]
        },
        "output": 36
      },
      {
        "input": {
          "height": [
            1,
            2,
            4,
            3
          ]
        },
        "output": 4
      },
      {
        "input": {
          "height": [
            6,
            4,
            3,
            1,
            4,
            6,
            99,
            62,
            1,
            2,
            6
          ]
        },
        "output": 62
      },
      {
        "input": {
          "height": [
            1,
            3,
            2,
            5,
            25,
            24,
            5
          ]
        },
        "output": 24
      },
      {
        "input": {
          "height": [
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "height": [
            8,
            7,
            2,
            1
          ]
        },
        "output": 7
      }
    ]
  },
  {
    "num": 39,
    "slug": "number-of-islands",
    "title": "Number of Islands",
    "difficulty": "MEDIUM",
    "topics": [
      "graphs",
      "queue",
      "dfs"
    ],
    "description": "Overview\nYou are given a grid map of '1's (land) and '0's (water).\n\nGiven\n- A 2D grid grid of characters '0' and '1'\n\nGoal\nReturn the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.\n\nNotes\n- You may assume all four edges of the grid are surrounded by water.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 40,
    "slug": "coin-change",
    "title": "Coin Change",
    "difficulty": "MEDIUM",
    "topics": [
      "dynamic-programming"
    ],
    "description": "Overview\nYou are given coin denominations and a target amount.\n\nGiven\n- An integer array coins representing coin denominations\n- An integer amount\n\nGoal\nReturn the fewest number of coins needed to make up amount. If the amount cannot be made up, return -1.\n\nNotes\n- You may use each coin denomination an unlimited number of times.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 41,
    "slug": "top-k-frequent-elements",
    "title": "Top K Frequent Elements",
    "difficulty": "MEDIUM",
    "topics": [
      "hash-table",
      "heap"
    ],
    "description": "Overview\nYou are given an integer array and need the most common values.\n\nGiven\n- An integer array nums\n- An integer k\n\nGoal\nReturn the k most frequent elements. The answer may be returned in any order.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 42,
    "slug": "kth-largest-element-in-an-array",
    "title": "Kth Largest Element in an Array",
    "difficulty": "MEDIUM",
    "topics": [
      "heap",
      "arrays"
    ],
    "description": "Overview\nYou are given an unsorted integer array.\n\nGiven\n- An integer array nums\n- An integer k\n\nGoal\nReturn the k-th largest element in the array.\n\nNotes\n- This is the k-th largest in sorted order, not the k-th distinct element.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 43,
    "slug": "product-of-array-except-self",
    "title": "Product of Array Except Self",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "prefix-sum"
    ],
    "description": "Overview\nYou are given an integer array and must compute products without division.\n\nGiven\n- An integer array nums\n\nGoal\nReturn an array answer such that answer[i] is the product of all elements of nums except nums[i].\n\nNotes\n- You must solve it without using division and ideally in O(n) time.\n- The product of any prefix or suffix fits in a 32-bit integer.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 44,
    "slug": "set-matrix-zeroes",
    "title": "Set Matrix Zeroes",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "hash-table"
    ],
    "description": "Overview\nYou are given an m x n integer matrix.\n\nGiven\n- An integer matrix matrix\n\nGoal\nIf an element is 0, set its entire row and column to 0. Perform this in-place using constant extra space if possible.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 45,
    "slug": "group-anagrams",
    "title": "Group Anagrams",
    "difficulty": "MEDIUM",
    "topics": [
      "hash-table",
      "strings"
    ],
    "description": "Overview\nAnagrams are words formed by rearranging the letters of another word.\n\nGiven\n- An array of strings strs\n\nGoal\nGroup the anagrams together. The answer may be returned in any order, and the strings within each group may also be in any order.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 46,
    "slug": "permutations",
    "title": "Permutations",
    "difficulty": "MEDIUM",
    "topics": [
      "backtracking",
      "arrays"
    ],
    "description": "Overview\nYou are given a collection of distinct integers.\n\nGiven\n- An integer array nums of distinct integers\n\nGoal\nReturn all possible permutations of nums. You may return the answer in any order.",
    "inputFormat": "{ nums: number[] }",
    "outputFormat": "number[][] sorted lexicographically",
    "constraints": "0 <= nums.length <= 3000",
    "hints": [
      "Sort first.",
      "Fix one index and use two pointers.",
      "Skip duplicates."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = sorted(data.get(\"nums\", []))\n    res = []\n    n = len(nums)\n    for i in range(n):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        if nums[i] > 0:\n            break\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r + 1]:\n                    r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        },
        "output": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            0,
            1,
            1
          ]
        },
        "output": []
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            0,
            0,
            0
          ]
        },
        "output": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "nums": []
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            1,
            1,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            1
          ]
        },
        "output": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            3,
            -2,
            1,
            0
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        },
        "output": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            -2,
            -1
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            0,
            2,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ]
        ]
      }
    ]
  },
  {
    "num": 47,
    "slug": "combination-sum",
    "title": "Combination Sum",
    "difficulty": "MEDIUM",
    "topics": [
      "backtracking",
      "dynamic-programming"
    ],
    "description": "Overview\nYou are given candidate numbers and a target sum.\n\nGiven\n- An array of distinct integers candidates\n- An integer target\n\nGoal\nReturn all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen unlimited times.\n\nNotes\n- The solution set must not contain duplicate combinations.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 48,
    "slug": "subsets",
    "title": "Subsets",
    "difficulty": "MEDIUM",
    "topics": [
      "backtracking",
      "bit-manipulation"
    ],
    "description": "Overview\nYou are given a set of distinct integers.\n\nGiven\n- An integer array nums of unique elements\n\nGoal\nReturn all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    "inputFormat": "{ nums: number[] }",
    "outputFormat": "number[][] sorted lexicographically",
    "constraints": "0 <= nums.length <= 3000",
    "hints": [
      "Sort first.",
      "Fix one index and use two pointers.",
      "Skip duplicates."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = sorted(data.get(\"nums\", []))\n    res = []\n    n = len(nums)\n    for i in range(n):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        if nums[i] > 0:\n            break\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r + 1]:\n                    r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        },
        "output": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            0,
            1,
            1
          ]
        },
        "output": []
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            0,
            0,
            0
          ]
        },
        "output": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "nums": []
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            1,
            1,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            1
          ]
        },
        "output": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            3,
            -2,
            1,
            0
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        },
        "output": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            -2,
            -1
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            0,
            2,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ]
        ]
      }
    ]
  },
  {
    "num": 49,
    "slug": "word-search",
    "title": "Word Search",
    "difficulty": "MEDIUM",
    "topics": [
      "backtracking",
      "graphs"
    ],
    "description": "Overview\nYou are given a grid of characters and a target word.\n\nGiven\n- A 2D board of characters\n- A string word\n\nGoal\nReturn true if word exists in the board. Words are formed by sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once per word.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 50,
    "slug": "decode-ways",
    "title": "Decode Ways",
    "difficulty": "MEDIUM",
    "topics": [
      "dynamic-programming",
      "strings"
    ],
    "description": "Overview\nA message containing letters A-Z can be encoded to numbers using the mapping A=1, B=2, ..., Z=26.\n\nGiven\n- A string s containing only digits\n\nGoal\nReturn the number of ways to decode s. If decoding is impossible, return 0.\n\nNotes\n- A leading zero in any decoded segment makes the entire string invalid.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 51,
    "slug": "house-robber",
    "title": "House Robber",
    "difficulty": "MEDIUM",
    "topics": [
      "dynamic-programming",
      "arrays"
    ],
    "description": "Overview\nYou are a robber planning to steal from houses along a street.\n\nGiven\n- An integer array nums where nums[i] is the amount of money in the i-th house\n\nGoal\nReturn the maximum amount you can rob without robbing two directly adjacent houses.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 52,
    "slug": "jump-game",
    "title": "Jump Game",
    "difficulty": "MEDIUM",
    "topics": [
      "greedy",
      "arrays"
    ],
    "description": "Overview\nYou start at the first index of an array where each element tells you the maximum jump length from that position.\n\nGiven\n- An integer array nums\n\nGoal\nReturn true if you can reach the last index starting from index 0, and false otherwise.",
    "inputFormat": "{ prices: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= prices.length <= 10^5",
    "hints": [
      "Track the minimum price seen so far.",
      "Update best profit at each day."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    prices = data.get(\"prices\", [])\n    if not prices:\n        return 0\n    min_price = prices[0]\n    ans = 0\n    for p in prices[1:]:\n        ans = max(ans, p - min_price)\n        min_price = min(min_price, p)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "prices": [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        },
        "output": 5,
        "explanation": "Buy 1, sell 6."
      },
      {
        "input": {
          "prices": [
            7,
            6,
            4,
            3,
            1
          ]
        },
        "output": 0,
        "explanation": "No profitable trade."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "prices": [
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "prices": [
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            2,
            4,
            1
          ]
        },
        "output": 2
      },
      {
        "input": {
          "prices": [
            3,
            3,
            5,
            0,
            0,
            3,
            1,
            4
          ]
        },
        "output": 4
      },
      {
        "input": {
          "prices": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            5,
            4,
            3,
            2,
            1,
            6
          ]
        },
        "output": 5
      },
      {
        "input": {
          "prices": [
            1,
            10,
            2,
            9
          ]
        },
        "output": 9
      },
      {
        "input": {
          "prices": [
            9,
            8,
            7,
            6,
            5
          ]
        },
        "output": 0
      }
    ]
  },
  {
    "num": 53,
    "slug": "partition-labels",
    "title": "Partition Labels",
    "difficulty": "MEDIUM",
    "topics": [
      "greedy",
      "strings"
    ],
    "description": "Overview\nYou are given a string of lowercase letters.\n\nGiven\n- A string s\n\nGoal\nPartition s into as many parts as possible so that each letter appears in at most one part. Return a list of the sizes of these parts.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 54,
    "slug": "daily-temperatures",
    "title": "Daily Temperatures",
    "difficulty": "MEDIUM",
    "topics": [
      "stack",
      "arrays"
    ],
    "description": "Overview\nYou are given daily temperatures and want to know how long to wait for a warmer day.\n\nGiven\n- An integer array temperatures where temperatures[i] is the temperature on day i\n\nGoal\nReturn an array answer where answer[i] is the number of days you must wait after day i for a warmer temperature. If no future day is warmer, answer[i] is 0.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 10^5; chars in ()[]{}",
    "hints": [
      "Use a stack.",
      "Map each closing bracket to its opening pair."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    pairs = {')': '(', ']': '[', '}': '{'}\n    st = []\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        else:\n            if not st or st[-1] != pairs.get(ch):\n                return False\n            st.pop()\n    return not st\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "()[]{}"
        },
        "output": true,
        "explanation": "Every opener closes in order."
      },
      {
        "input": {
          "s": "(]"
        },
        "output": false,
        "explanation": "Mismatched pair."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "([{}])"
        },
        "output": true
      },
      {
        "input": {
          "s": "([)]"
        },
        "output": false
      },
      {
        "input": {
          "s": "(((("
        },
        "output": false
      },
      {
        "input": {
          "s": "]"
        },
        "output": false
      },
      {
        "input": {
          "s": "{[]}"
        },
        "output": true
      },
      {
        "input": {
          "s": "((()))[]{}"
        },
        "output": true
      },
      {
        "input": {
          "s": "(()"
        },
        "output": false
      }
    ]
  },
  {
    "num": 55,
    "slug": "evaluate-reverse-polish-notation",
    "title": "Evaluate Reverse Polish Notation",
    "difficulty": "MEDIUM",
    "topics": [
      "stack",
      "math"
    ],
    "description": "Overview\nReverse Polish notation is a postfix expression format where operators follow their operands.\n\nGiven\n- An array of strings tokens representing an arithmetic expression in Reverse Polish notation\n\nGoal\nEvaluate the expression and return the result as an integer. Valid operators are +, -, *, and /. Division truncates toward zero.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 10^5; chars in ()[]{}",
    "hints": [
      "Use a stack.",
      "Map each closing bracket to its opening pair."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    pairs = {')': '(', ']': '[', '}': '{'}\n    st = []\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        else:\n            if not st or st[-1] != pairs.get(ch):\n                return False\n            st.pop()\n    return not st\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "()[]{}"
        },
        "output": true,
        "explanation": "Every opener closes in order."
      },
      {
        "input": {
          "s": "(]"
        },
        "output": false,
        "explanation": "Mismatched pair."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "([{}])"
        },
        "output": true
      },
      {
        "input": {
          "s": "([)]"
        },
        "output": false
      },
      {
        "input": {
          "s": "(((("
        },
        "output": false
      },
      {
        "input": {
          "s": "]"
        },
        "output": false
      },
      {
        "input": {
          "s": "{[]}"
        },
        "output": true
      },
      {
        "input": {
          "s": "((()))[]{}"
        },
        "output": true
      },
      {
        "input": {
          "s": "(()"
        },
        "output": false
      }
    ]
  },
  {
    "num": 56,
    "slug": "binary-tree-level-order-traversal",
    "title": "Binary Tree Level Order Traversal",
    "difficulty": "MEDIUM",
    "topics": [
      "trees",
      "queue"
    ],
    "description": "Overview\nYou are given the root of a binary tree.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn the level-order traversal of its node values (left to right, level by level).",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 57,
    "slug": "binary-tree-right-side-view",
    "title": "Binary Tree Right Side View",
    "difficulty": "MEDIUM",
    "topics": [
      "trees",
      "queue"
    ],
    "description": "Overview\nWhen looking at a binary tree from the right side, some nodes are visible and others are hidden.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn the values of the nodes you can see ordered from top to bottom.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 58,
    "slug": "validate-binary-search-tree",
    "title": "Validate Binary Search Tree",
    "difficulty": "MEDIUM",
    "topics": [
      "trees",
      "binary-search"
    ],
    "description": "Overview\nA valid binary search tree has ordering constraints on every subtree.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn true if the tree is a valid binary search tree, where for every node all values in the left subtree are less than the node and all values in the right subtree are greater than the node.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 59,
    "slug": "lowest-common-ancestor-of-a-binary-tree",
    "title": "Lowest Common Ancestor of a Binary Tree",
    "difficulty": "MEDIUM",
    "topics": [
      "trees",
      "dfs"
    ],
    "description": "Overview\nThe lowest common ancestor (LCA) of two nodes is the deepest node that has both nodes as descendants.\n\nGiven\n- The root of a binary tree\n- Two nodes p and q that exist in the tree\n\nGoal\nReturn the lowest common ancestor of p and q.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 60,
    "slug": "clone-graph",
    "title": "Clone Graph",
    "difficulty": "MEDIUM",
    "topics": [
      "graphs",
      "hash-table"
    ],
    "description": "Overview\nYou are given a node in a connected undirected graph where each node has a value and a list of neighbors.\n\nGiven\n- A reference to a node in a connected undirected graph\n\nGoal\nReturn a deep copy (clone) of the graph. Each cloned node must have the same value and the same neighbor relationships as the original.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 61,
    "slug": "course-schedule",
    "title": "Course Schedule",
    "difficulty": "MEDIUM",
    "topics": [
      "graphs",
      "queue"
    ],
    "description": "Overview\nThere are numCourses courses labeled from 0 to numCourses - 1, and a list of prerequisite pairs.\n\nGiven\n- An integer numCourses\n- An array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a\n\nGoal\nReturn true if you can finish all courses (that is, the prerequisite graph has no cycle), and false otherwise.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 62,
    "slug": "rotting-oranges",
    "title": "Rotting Oranges",
    "difficulty": "MEDIUM",
    "topics": [
      "graphs",
      "queue"
    ],
    "description": "Overview\nYou are given a grid where each cell is empty, a fresh orange, or a rotten orange.\n\nGiven\n- A grid where 0 is empty, 1 is fresh, and 2 is rotten\n\nGoal\nReturn the minimum number of minutes until no fresh orange remains. If it is impossible to rot every orange, return -1.\n\nNotes\n- Each minute, any fresh orange adjacent (4-directionally) to a rotten orange becomes rotten.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 63,
    "slug": "find-minimum-in-rotated-sorted-array",
    "title": "Find Minimum in Rotated Sorted Array",
    "difficulty": "MEDIUM",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given a sorted array that has been rotated at an unknown pivot.\n\nGiven\n- An integer array nums sorted in ascending order and then rotated\n\nGoal\nReturn the minimum element of the array.\n\nNotes\n- All elements are distinct.\n- You must run in O(log n) time.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 64,
    "slug": "search-in-rotated-sorted-array",
    "title": "Search in Rotated Sorted Array",
    "difficulty": "MEDIUM",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given a rotated sorted array and a target value.\n\nGiven\n- An integer array nums sorted in ascending order and then rotated\n- An integer target\n\nGoal\nReturn the index of target if it is in nums, or -1 if it is not.\n\nNotes\n- All elements in nums are distinct.\n- You must run in O(log n) time.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 65,
    "slug": "find-first-and-last-position-of-element-in-sorted-array",
    "title": "Find First and Last Position in Sorted Array",
    "difficulty": "MEDIUM",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given a sorted array that may contain duplicates.\n\nGiven\n- A sorted integer array nums in non-decreasing order\n- An integer target\n\nGoal\nReturn the starting and ending position of target in nums. If target is not found, return [-1, -1].\n\nNotes\n- You must write an algorithm with O(log n) runtime.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 66,
    "slug": "longest-consecutive-sequence",
    "title": "Longest Consecutive Sequence",
    "difficulty": "MEDIUM",
    "topics": [
      "hash-table",
      "arrays"
    ],
    "description": "Overview\nYou are given an unsorted array of integers.\n\nGiven\n- An integer array nums\n\nGoal\nReturn the length of the longest consecutive elements sequence. The sequence elements do not need to be adjacent in the original array.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 67,
    "slug": "minimum-size-subarray-sum",
    "title": "Minimum Size Subarray Sum",
    "difficulty": "MEDIUM",
    "topics": [
      "sliding-window",
      "arrays"
    ],
    "description": "Overview\nYou are given an array of positive integers and a target sum.\n\nGiven\n- An integer array nums of positive integers\n- An integer target\n\nGoal\nReturn the minimal length of a contiguous subarray whose sum is greater than or equal to target. If there is no such subarray, return 0.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 68,
    "slug": "minimum-window-substring-lite",
    "title": "Minimum Window Substring Lite",
    "difficulty": "MEDIUM",
    "topics": [
      "sliding-window",
      "strings"
    ],
    "description": "Overview\nYou are given two strings s and t.\n\nGiven\n- A string s\n- A string t\n\nGoal\nReturn the shortest substring of s that contains all characters of t (including multiplicity). If no such window exists, return an empty string.\n\nNotes\n- This is a simplified variant of the classic minimum window substring problem.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 69,
    "slug": "palindromic-substrings",
    "title": "Palindromic Substrings",
    "difficulty": "MEDIUM",
    "topics": [
      "strings",
      "dynamic-programming"
    ],
    "description": "Overview\nA palindrome reads the same forward and backward.\n\nGiven\n- A string s\n\nGoal\nReturn the number of palindromic substrings in s. Substrings with different start or end indices are counted separately even if their contents are the same.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 70,
    "slug": "longest-palindromic-substring",
    "title": "Longest Palindromic Substring",
    "difficulty": "MEDIUM",
    "topics": [
      "strings",
      "dynamic-programming"
    ],
    "description": "Overview\nA palindrome reads the same forward and backward.\n\nGiven\n- A string s\n\nGoal\nReturn the longest palindromic substring in s. If multiple answers exist, you may return any one of them.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 71,
    "slug": "sort-colors",
    "title": "Sort Colors",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "two-pointers"
    ],
    "description": "Overview\nYou are given an array with values 0, 1, and 2 representing red, white, and blue.\n\nGiven\n- An integer array nums where each element is 0, 1, or 2\n\nGoal\nSort nums in-place so that all 0s come first, then all 1s, then all 2s. Do this in one pass using constant extra space if possible.",
    "inputFormat": "{ nums: number[] }",
    "outputFormat": "number[][] sorted lexicographically",
    "constraints": "0 <= nums.length <= 3000",
    "hints": [
      "Sort first.",
      "Fix one index and use two pointers.",
      "Skip duplicates."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = sorted(data.get(\"nums\", []))\n    res = []\n    n = len(nums)\n    for i in range(n):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        if nums[i] > 0:\n            break\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r + 1]:\n                    r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        },
        "output": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            0,
            1,
            1
          ]
        },
        "output": []
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            0,
            0,
            0
          ]
        },
        "output": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "nums": []
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            1,
            1,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            1
          ]
        },
        "output": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            3,
            -2,
            1,
            0
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        },
        "output": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            -2,
            -1
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            0,
            2,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ]
        ]
      }
    ]
  },
  {
    "num": 72,
    "slug": "spiral-matrix",
    "title": "Spiral Matrix",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays"
    ],
    "description": "Overview\nYou are given an m x n matrix.\n\nGiven\n- A matrix matrix\n\nGoal\nReturn all elements of the matrix in spiral order, starting from the top-left corner and moving right, down, left, and up.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 73,
    "slug": "rotate-image",
    "title": "Rotate Image",
    "difficulty": "MEDIUM",
    "topics": [
      "arrays",
      "math"
    ],
    "description": "Overview\nYou are given an n x n 2D matrix representing an image.\n\nGiven\n- An n x n integer matrix matrix\n\nGoal\nRotate the image 90 degrees clockwise in-place.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 74,
    "slug": "find-all-anagrams-in-a-string",
    "title": "Find All Anagrams in a String",
    "difficulty": "MEDIUM",
    "topics": [
      "sliding-window",
      "hash-table",
      "strings"
    ],
    "description": "Overview\nAn anagram is a permutation of another string with the same characters.\n\nGiven\n- Two strings s and p\n\nGoal\nReturn a list of all start indices of anagrams of p in s. The answer may be returned in any order.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 75,
    "slug": "task-scheduler",
    "title": "Task Scheduler",
    "difficulty": "MEDIUM",
    "topics": [
      "heap",
      "greedy"
    ],
    "description": "Overview\nYou are given a list of tasks labeled A to Z and a cooldown period n.\n\nGiven\n- A character array tasks representing tasks to execute\n- An integer n representing the cooldown between identical tasks\n\nGoal\nReturn the least number of time units needed to finish all tasks. The CPU can execute one task per unit or remain idle.",
    "inputFormat": "{ prices: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= prices.length <= 10^5",
    "hints": [
      "Track the minimum price seen so far.",
      "Update best profit at each day."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    prices = data.get(\"prices\", [])\n    if not prices:\n        return 0\n    min_price = prices[0]\n    ans = 0\n    for p in prices[1:]:\n        ans = max(ans, p - min_price)\n        min_price = min(min_price, p)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "prices": [
            7,
            1,
            5,
            3,
            6,
            4
          ]
        },
        "output": 5,
        "explanation": "Buy 1, sell 6."
      },
      {
        "input": {
          "prices": [
            7,
            6,
            4,
            3,
            1
          ]
        },
        "output": 0,
        "explanation": "No profitable trade."
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "prices": [
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "prices": [
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            2,
            4,
            1
          ]
        },
        "output": 2
      },
      {
        "input": {
          "prices": [
            3,
            3,
            5,
            0,
            0,
            3,
            1,
            4
          ]
        },
        "output": 4
      },
      {
        "input": {
          "prices": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "prices": [
            5,
            4,
            3,
            2,
            1,
            6
          ]
        },
        "output": 5
      },
      {
        "input": {
          "prices": [
            1,
            10,
            2,
            9
          ]
        },
        "output": 9
      },
      {
        "input": {
          "prices": [
            9,
            8,
            7,
            6,
            5
          ]
        },
        "output": 0
      }
    ]
  },
  {
    "num": 76,
    "slug": "integer-to-roman",
    "title": "Integer to Roman",
    "difficulty": "MEDIUM",
    "topics": [
      "math",
      "strings"
    ],
    "description": "Overview\nRoman numerals are built from symbols with fixed values.\n\nGiven\n- An integer num in the range [1, 3999]\n\nGoal\nReturn the Roman numeral representation of num using the standard subtractive notation.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 77,
    "slug": "powx-n",
    "title": "Pow(x, n)",
    "difficulty": "MEDIUM",
    "topics": [
      "math",
      "binary-search"
    ],
    "description": "Overview\nYou need to compute a real power efficiently.\n\nGiven\n- A double x\n- An integer n\n\nGoal\nReturn x raised to the power n. Implement this in O(log n) time.\n\nNotes\n- n may be negative, in which case you compute 1 / x^|n|.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 78,
    "slug": "my-calendar-i",
    "title": "My Calendar I",
    "difficulty": "MEDIUM",
    "topics": [
      "binary-search",
      "trees"
    ],
    "description": "Overview\nDesign a calendar that can book time intervals without overlap.\n\nGiven\n- A sequence of book operations, each with start and end times\n\nGoal\nImplement MyCalendar so that book(start, end) adds the half-open interval [start, end) if it does not overlap any existing booking, and returns whether the booking succeeded.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 79,
    "slug": "design-hashmap",
    "title": "Design HashMap",
    "difficulty": "MEDIUM",
    "topics": [
      "hash-table"
    ],
    "description": "Overview\nDesign a basic hash map without using built-in hash map libraries.\n\nGiven\n- A sequence of put, get, and remove operations\n\nGoal\nImplement a MyHashMap that supports inserting a key-value pair, returning the value for a key, and removing a key.",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number[2] indices, or [] if none",
    "constraints": "2 <= nums.length <= 10^5; values fit 32-bit signed int.",
    "hints": [
      "Store seen values in a hash map.",
      "Check complement before storing current index."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    seen = {}\n    for i, x in enumerate(nums):\n        need = target - x\n        if need in seen:\n            return [seen[need], i]\n        seen[x] = i\n    return []\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            2,
            7,
            11,
            15
          ],
          "target": 9
        },
        "output": [
          0,
          1
        ],
        "explanation": "2 + 7 = 9"
      },
      {
        "input": {
          "nums": [
            3,
            2,
            4
          ],
          "target": 6
        },
        "output": [
          1,
          2
        ],
        "explanation": "2 + 4 = 6"
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "output": [
          0,
          1
        ]
      },
      {
        "input": {
          "nums": [
            1,
            5,
            3,
            7
          ],
          "target": 8
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            -2,
            -3,
            -4,
            -5
          ],
          "target": -8
        },
        "output": [
          2,
          4
        ]
      },
      {
        "input": {
          "nums": [
            0,
            4,
            3,
            0
          ],
          "target": 0
        },
        "output": [
          0,
          3
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            3,
            4
          ],
          "target": 10
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            5,
            75,
            25
          ],
          "target": 100
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            2,
            5,
            5,
            11
          ],
          "target": 10
        },
        "output": [
          1,
          2
        ]
      },
      {
        "input": {
          "nums": [
            10,
            -2,
            8,
            1
          ],
          "target": 9
        },
        "output": [
          2,
          3
        ]
      }
    ]
  },
  {
    "num": 80,
    "slug": "design-add-and-search-words-data-structure",
    "title": "Design Add and Search Words Data Structure",
    "difficulty": "MEDIUM",
    "topics": [
      "trie",
      "strings"
    ],
    "description": "Overview\nDesign a data structure for storing words that supports exact and wildcard search.\n\nGiven\n- addWord operations for strings\n- search operations where '.' matches any single letter\n\nGoal\nImplement WordDictionary so addWord adds a word and search returns true if the word (or a matching wildcard pattern) exists in the structure.",
    "inputFormat": "{ s: string, t: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length, t.length <= 10^5",
    "hints": [
      "Count character frequencies.",
      "Lengths must match first."
    ],
    "pythonSolution": "import json\nimport sys\n\nfrom collections import Counter\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    t = data.get(\"t\", \"\")\n    return Counter(s) == Counter(t)\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "anagram",
          "t": "nagaram"
        },
        "output": true
      },
      {
        "input": {
          "s": "rat",
          "t": "car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": "",
          "t": ""
        },
        "output": true
      },
      {
        "input": {
          "s": "a",
          "t": "aa"
        },
        "output": false
      },
      {
        "input": {
          "s": "listen",
          "t": "silent"
        },
        "output": true
      },
      {
        "input": {
          "s": "triangle",
          "t": "integral"
        },
        "output": true
      },
      {
        "input": {
          "s": "hello",
          "t": "bello"
        },
        "output": false
      },
      {
        "input": {
          "s": "aabbcc",
          "t": "abcabc"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyx"
        },
        "output": true
      },
      {
        "input": {
          "s": "xxy",
          "t": "xyz"
        },
        "output": false
      }
    ]
  },
  {
    "num": 81,
    "slug": "trapping-rain-water",
    "title": "Trapping Rain Water",
    "difficulty": "HARD",
    "topics": [
      "two-pointers",
      "stack",
      "arrays"
    ],
    "description": "Overview\nElevation bars are placed side by side, and rain is trapped between them.\n\nGiven\n- An integer array height representing bar heights\n\nGoal\nReturn how much water can be trapped after raining.",
    "inputFormat": "{ height: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= height.length <= 2*10^5",
    "hints": [
      "Use two pointers and running max boundaries.",
      "Water at index depends on smaller boundary."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    h = data.get(\"height\", [])\n    l, r = 0, len(h) - 1\n    left_max = right_max = 0\n    ans = 0\n    while l <= r:\n        if left_max <= right_max:\n            left_max = max(left_max, h[l])\n            ans += left_max - h[l]\n            l += 1\n        else:\n            right_max = max(right_max, h[r])\n            ans += right_max - h[r]\n            r -= 1\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "height": [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        },
        "output": 6
      },
      {
        "input": {
          "height": [
            4,
            2,
            0,
            3,
            2,
            5
          ]
        },
        "output": 9
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "height": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            1,
            2,
            3
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            3,
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            2,
            0,
            2
          ]
        },
        "output": 2
      },
      {
        "input": {
          "height": [
            3,
            0,
            0,
            2,
            0,
            4
          ]
        },
        "output": 10
      },
      {
        "input": {
          "height": [
            5,
            4,
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "height": [
            2,
            1,
            0,
            1,
            3
          ]
        },
        "output": 4
      },
      {
        "input": {
          "height": [
            0,
            7,
            1,
            4,
            6
          ]
        },
        "output": 7
      }
    ]
  },
  {
    "num": 82,
    "slug": "median-of-two-sorted-arrays",
    "title": "Median of Two Sorted Arrays",
    "difficulty": "HARD",
    "topics": [
      "binary-search",
      "arrays"
    ],
    "description": "Overview\nYou are given two sorted arrays.\n\nGiven\n- Two sorted integer arrays nums1 and nums2\n\nGoal\nReturn the median of the two sorted arrays combined.\n\nNotes\n- The overall run time complexity should be O(log (m + n)).",
    "inputFormat": "{ nums1: number[], nums2: number[] }",
    "outputFormat": "number",
    "constraints": "0 <= m,n <= 10^5; m + n >= 1",
    "hints": [
      "Binary search on smaller array partition.",
      "Left max <= right min condition."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    a = data.get(\"nums1\", [])\n    b = data.get(\"nums2\", [])\n    if len(a) > len(b):\n        a, b = b, a\n    m, n = len(a), len(b)\n    total = m + n\n    half = (total + 1) // 2\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        aL = a[i - 1] if i > 0 else float('-inf')\n        aR = a[i] if i < m else float('inf')\n        bL = b[j - 1] if j > 0 else float('-inf')\n        bR = b[j] if j < n else float('inf')\n        if aL <= bR and bL <= aR:\n            if total % 2:\n                return max(aL, bL)\n            return (max(aL, bL) + min(aR, bR)) / 2\n        if aL > bR:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums1": [
            1,
            3
          ],
          "nums2": [
            2
          ]
        },
        "output": 2
      },
      {
        "input": {
          "nums1": [
            1,
            2
          ],
          "nums2": [
            3,
            4
          ]
        },
        "output": 2.5
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums1": [],
          "nums2": [
            1
          ]
        },
        "output": 1
      },
      {
        "input": {
          "nums1": [
            2
          ],
          "nums2": []
        },
        "output": 2
      },
      {
        "input": {
          "nums1": [
            0,
            0
          ],
          "nums2": [
            0,
            0
          ]
        },
        "output": 0
      },
      {
        "input": {
          "nums1": [
            1
          ],
          "nums2": [
            2,
            3,
            4
          ]
        },
        "output": 2.5
      },
      {
        "input": {
          "nums1": [
            1,
            2,
            3
          ],
          "nums2": [
            4,
            5,
            6
          ]
        },
        "output": 3.5
      },
      {
        "input": {
          "nums1": [
            100
          ],
          "nums2": [
            1,
            2,
            3,
            4,
            5
          ]
        },
        "output": 3.5
      },
      {
        "input": {
          "nums1": [
            1,
            3,
            8,
            9,
            15
          ],
          "nums2": [
            7,
            11,
            18,
            19,
            21,
            25
          ]
        },
        "output": 11
      },
      {
        "input": {
          "nums1": [
            23,
            26,
            31,
            35
          ],
          "nums2": [
            3,
            5,
            7,
            9,
            11,
            16
          ]
        },
        "output": 13.5
      }
    ]
  },
  {
    "num": 83,
    "slug": "minimum-window-substring",
    "title": "Minimum Window Substring",
    "difficulty": "HARD",
    "topics": [
      "sliding-window",
      "hash-table",
      "strings"
    ],
    "description": "Overview\nYou are given two strings s and t.\n\nGiven\n- A string s\n- A string t\n\nGoal\nReturn the minimum window substring of s such that every character in t (including duplicates) is included in the window. If no such substring exists, return an empty string.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 84,
    "slug": "merge-k-sorted-lists",
    "title": "Merge K Sorted Lists",
    "difficulty": "HARD",
    "topics": [
      "linked-list",
      "heap"
    ],
    "description": "Overview\nYou are given k linked lists, each sorted in ascending order.\n\nGiven\n- An array lists of the heads of k sorted linked lists\n\nGoal\nMerge all lists into one sorted linked list and return its head.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 85,
    "slug": "largest-rectangle-in-histogram",
    "title": "Largest Rectangle in Histogram",
    "difficulty": "HARD",
    "topics": [
      "stack",
      "arrays"
    ],
    "description": "Overview\nYou are given the heights of bars in a histogram.\n\nGiven\n- An integer array heights where heights[i] is the height of the i-th bar\n\nGoal\nReturn the area of the largest rectangle in the histogram. Each bar has width 1.",
    "inputFormat": "{ height: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= height.length <= 2*10^5",
    "hints": [
      "Use two pointers and running max boundaries.",
      "Water at index depends on smaller boundary."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    h = data.get(\"height\", [])\n    l, r = 0, len(h) - 1\n    left_max = right_max = 0\n    ans = 0\n    while l <= r:\n        if left_max <= right_max:\n            left_max = max(left_max, h[l])\n            ans += left_max - h[l]\n            l += 1\n        else:\n            right_max = max(right_max, h[r])\n            ans += right_max - h[r]\n            r -= 1\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "height": [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        },
        "output": 6
      },
      {
        "input": {
          "height": [
            4,
            2,
            0,
            3,
            2,
            5
          ]
        },
        "output": 9
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "height": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            1,
            2,
            3
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            3,
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            2,
            0,
            2
          ]
        },
        "output": 2
      },
      {
        "input": {
          "height": [
            3,
            0,
            0,
            2,
            0,
            4
          ]
        },
        "output": 10
      },
      {
        "input": {
          "height": [
            5,
            4,
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "height": [
            2,
            1,
            0,
            1,
            3
          ]
        },
        "output": 4
      },
      {
        "input": {
          "height": [
            0,
            7,
            1,
            4,
            6
          ]
        },
        "output": 7
      }
    ]
  },
  {
    "num": 86,
    "slug": "word-ladder",
    "title": "Word Ladder",
    "difficulty": "HARD",
    "topics": [
      "graphs",
      "queue",
      "strings"
    ],
    "description": "Overview\nYou are transforming a begin word into an end word one letter at a time.\n\nGiven\n- Two words beginWord and endWord\n- A word list wordList\n\nGoal\nReturn the length of the shortest transformation sequence from beginWord to endWord, changing only one letter at a time and using only words from wordList. If no sequence exists, return 0.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 87,
    "slug": "edit-distance",
    "title": "Edit Distance",
    "difficulty": "HARD",
    "topics": [
      "dynamic-programming",
      "strings"
    ],
    "description": "Overview\nYou are given two strings and allowed three operations: insert, delete, or replace a character.\n\nGiven\n- Two strings word1 and word2\n\nGoal\nReturn the minimum number of operations required to convert word1 into word2.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 88,
    "slug": "n-queens",
    "title": "N-Queens",
    "difficulty": "HARD",
    "topics": [
      "backtracking"
    ],
    "description": "Overview\nThe n-queens puzzle places n queens on an n x n board so no two queens attack each other.\n\nGiven\n- An integer n\n\nGoal\nReturn all distinct solutions to the n-queens puzzle. Each solution is a board configuration represented as strings, where 'Q' marks a queen and '.' marks an empty cell.",
    "inputFormat": "{ nums: number[] }",
    "outputFormat": "number[][] sorted lexicographically",
    "constraints": "0 <= nums.length <= 3000",
    "hints": [
      "Sort first.",
      "Fix one index and use two pointers.",
      "Skip duplicates."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = sorted(data.get(\"nums\", []))\n    res = []\n    n = len(nums)\n    for i in range(n):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        if nums[i] > 0:\n            break\n        l, r = i + 1, n - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s == 0:\n                res.append([nums[i], nums[l], nums[r]])\n                l += 1\n                r -= 1\n                while l < r and nums[l] == nums[l - 1]:\n                    l += 1\n                while l < r and nums[r] == nums[r + 1]:\n                    r -= 1\n            elif s < 0:\n                l += 1\n            else:\n                r -= 1\n    return res\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            1,
            2,
            -1,
            -4
          ]
        },
        "output": [
          [
            -1,
            -1,
            2
          ],
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            0,
            1,
            1
          ]
        },
        "output": []
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            0,
            0,
            0
          ]
        },
        "output": [
          [
            0,
            0,
            0
          ]
        ]
      },
      {
        "input": {
          "nums": []
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            1,
            1,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            1
          ]
        },
        "output": [
          [
            -1,
            0,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            3,
            -2,
            1,
            0
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -4,
            -2,
            -2,
            -2,
            0,
            1,
            2,
            2,
            2,
            3,
            3,
            4,
            4,
            6,
            6
          ]
        },
        "output": [
          [
            -4,
            -2,
            6
          ],
          [
            -4,
            0,
            4
          ],
          [
            -4,
            1,
            3
          ],
          [
            -4,
            2,
            2
          ],
          [
            -2,
            -2,
            4
          ],
          [
            -2,
            0,
            2
          ],
          [
            -2,
            1,
            1
          ]
        ]
      },
      {
        "input": {
          "nums": [
            1,
            2,
            -2,
            -1
          ]
        },
        "output": []
      },
      {
        "input": {
          "nums": [
            -2,
            0,
            0,
            2,
            2
          ]
        },
        "output": [
          [
            -2,
            0,
            2
          ]
        ]
      }
    ]
  },
  {
    "num": 89,
    "slug": "regular-expression-matching",
    "title": "Regular Expression Matching",
    "difficulty": "HARD",
    "topics": [
      "dynamic-programming",
      "strings"
    ],
    "description": "Overview\nYou are matching a string against a pattern that may include '.' and '*'.\n\nGiven\n- A string s\n- A pattern p\n\nGoal\nReturn true if p matches all of s. '.' matches any single character. '*' matches zero or more of the preceding element.\n\nNotes\n- The matching must cover the entire string s.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 90,
    "slug": "serialize-and-deserialize-binary-tree",
    "title": "Serialize and Deserialize Binary Tree",
    "difficulty": "HARD",
    "topics": [
      "trees",
      "queue"
    ],
    "description": "Overview\nDesign an algorithm to convert a binary tree to a string and back.\n\nGiven\n- A binary tree to serialize\n- A serialized string to deserialize\n\nGoal\nImplement Codec so serialize converts a tree to a string and deserialize reconstructs the original tree structure from that string.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 91,
    "slug": "maximal-rectangle",
    "title": "Maximal Rectangle",
    "difficulty": "HARD",
    "topics": [
      "stack",
      "dynamic-programming"
    ],
    "description": "Overview\nYou are given a binary matrix of '0' and '1' characters.\n\nGiven\n- A rows x cols binary matrix matrix\n\nGoal\nReturn the area of the largest rectangle containing only '1's.",
    "inputFormat": "{ height: number[] }",
    "outputFormat": "number",
    "constraints": "1 <= height.length <= 2*10^5",
    "hints": [
      "Use two pointers and running max boundaries.",
      "Water at index depends on smaller boundary."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    h = data.get(\"height\", [])\n    l, r = 0, len(h) - 1\n    left_max = right_max = 0\n    ans = 0\n    while l <= r:\n        if left_max <= right_max:\n            left_max = max(left_max, h[l])\n            ans += left_max - h[l]\n            l += 1\n        else:\n            right_max = max(right_max, h[r])\n            ans += right_max - h[r]\n            r -= 1\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "height": [
            0,
            1,
            0,
            2,
            1,
            0,
            1,
            3,
            2,
            1,
            2,
            1
          ]
        },
        "output": 6
      },
      {
        "input": {
          "height": [
            4,
            2,
            0,
            3,
            2,
            5
          ]
        },
        "output": 9
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "height": [
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            1,
            2,
            3
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            3,
            2,
            1
          ]
        },
        "output": 0
      },
      {
        "input": {
          "height": [
            2,
            0,
            2
          ]
        },
        "output": 2
      },
      {
        "input": {
          "height": [
            3,
            0,
            0,
            2,
            0,
            4
          ]
        },
        "output": 10
      },
      {
        "input": {
          "height": [
            5,
            4,
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "height": [
            2,
            1,
            0,
            1,
            3
          ]
        },
        "output": 4
      },
      {
        "input": {
          "height": [
            0,
            7,
            1,
            4,
            6
          ]
        },
        "output": 7
      }
    ]
  },
  {
    "num": 92,
    "slug": "sliding-window-maximum",
    "title": "Sliding Window Maximum",
    "difficulty": "HARD",
    "topics": [
      "queue",
      "heap",
      "sliding-window"
    ],
    "description": "Overview\nYou are given an array and a window size k.\n\nGiven\n- An integer array nums\n- An integer k\n\nGoal\nReturn an array containing the maximum value in each sliding window of size k as it moves from left to right.",
    "inputFormat": "{ height: number[] }",
    "outputFormat": "number",
    "constraints": "2 <= height.length <= 10^5",
    "hints": [
      "Start with widest container.",
      "Move the shorter side inward."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    h = data.get(\"height\", [])\n    l, r = 0, len(h) - 1\n    best = 0\n    while l < r:\n        best = max(best, min(h[l], h[r]) * (r - l))\n        if h[l] < h[r]:\n            l += 1\n        else:\n            r -= 1\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "height": [
            1,
            8,
            6,
            2,
            5,
            4,
            8,
            3,
            7
          ]
        },
        "output": 49
      },
      {
        "input": {
          "height": [
            1,
            1
          ]
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "height": [
            4,
            3,
            2,
            1,
            4
          ]
        },
        "output": 16
      },
      {
        "input": {
          "height": [
            1,
            2,
            1
          ]
        },
        "output": 2
      },
      {
        "input": {
          "height": [
            2,
            3,
            10,
            5,
            7,
            8,
            9
          ]
        },
        "output": 36
      },
      {
        "input": {
          "height": [
            1,
            2,
            4,
            3
          ]
        },
        "output": 4
      },
      {
        "input": {
          "height": [
            6,
            4,
            3,
            1,
            4,
            6,
            99,
            62,
            1,
            2,
            6
          ]
        },
        "output": 62
      },
      {
        "input": {
          "height": [
            1,
            3,
            2,
            5,
            25,
            24,
            5
          ]
        },
        "output": 24
      },
      {
        "input": {
          "height": [
            1,
            2
          ]
        },
        "output": 1
      },
      {
        "input": {
          "height": [
            8,
            7,
            2,
            1
          ]
        },
        "output": 7
      }
    ]
  },
  {
    "num": 93,
    "slug": "substring-with-concatenation-of-all-words",
    "title": "Substring with Concatenation of All Words",
    "difficulty": "HARD",
    "topics": [
      "sliding-window",
      "hash-table"
    ],
    "description": "Overview\nYou are given a string and a list of words of equal length.\n\nGiven\n- A string s\n- An array of strings words\n\nGoal\nReturn all starting indices in s where s contains a concatenation of each word in words exactly once and without intervening characters.",
    "inputFormat": "{ s: string }",
    "outputFormat": "number",
    "constraints": "0 <= s.length <= 10^5",
    "hints": [
      "Use sliding window.",
      "Track last index of each character."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "abcabcbb"
        },
        "output": 3
      },
      {
        "input": {
          "s": "bbbbb"
        },
        "output": 1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": ""
        },
        "output": 0
      },
      {
        "input": {
          "s": "pwwkew"
        },
        "output": 3
      },
      {
        "input": {
          "s": "dvdf"
        },
        "output": 3
      },
      {
        "input": {
          "s": "abba"
        },
        "output": 2
      },
      {
        "input": {
          "s": "tmmzuxt"
        },
        "output": 5
      },
      {
        "input": {
          "s": "anviaj"
        },
        "output": 5
      },
      {
        "input": {
          "s": "abcdef"
        },
        "output": 6
      },
      {
        "input": {
          "s": "aaab"
        },
        "output": 2
      }
    ]
  },
  {
    "num": 94,
    "slug": "binary-tree-maximum-path-sum",
    "title": "Binary Tree Maximum Path Sum",
    "difficulty": "HARD",
    "topics": [
      "trees",
      "dynamic-programming"
    ],
    "description": "Overview\nA path in a binary tree is any sequence of nodes where each pair of adjacent nodes has an edge.\n\nGiven\n- The root of a binary tree\n\nGoal\nReturn the maximum path sum of any non-empty path. A path may start and end at any nodes and does not need to pass through the root.",
    "inputFormat": "{ grid: string[][] }",
    "outputFormat": "number",
    "constraints": "1 <= m,n <= 300",
    "hints": [
      "DFS/BFS from each unvisited land cell.",
      "Mark visited cells."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    grid = data.get(\"grid\", [])\n    if not grid:\n        return 0\n    m, n = len(grid), len(grid[0])\n    vis = [[False] * n for _ in range(m)]\n\n    def dfs(r, c):\n        st = [(r, c)]\n        vis[r][c] = True\n        while st:\n            x, y = st.pop()\n            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                nx, ny = x + dx, y + dy\n                if 0 <= nx < m and 0 <= ny < n and not vis[nx][ny] and grid[nx][ny] == '1':\n                    vis[nx][ny] = True\n                    st.append((nx, ny))\n\n    ans = 0\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == '1' and not vis[i][j]:\n                ans += 1\n                dfs(i, j)\n    return ans\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "1",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "0",
              "0"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "1",
              "1",
              "0",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "1",
              "0",
              "0"
            ],
            [
              "0",
              "0",
              "0",
              "1",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "grid": []
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0",
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1"
            ],
            [
              "1",
              "1"
            ]
          ]
        },
        "output": 1
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        },
        "output": 2
      },
      {
        "input": {
          "grid": [
            [
              "0",
              "0"
            ],
            [
              "0",
              "0"
            ]
          ]
        },
        "output": 0
      },
      {
        "input": {
          "grid": [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "1",
              "0",
              "1"
            ]
          ]
        },
        "output": 3
      }
    ]
  },
  {
    "num": 95,
    "slug": "burst-balloons",
    "title": "Burst Balloons",
    "difficulty": "HARD",
    "topics": [
      "dynamic-programming"
    ],
    "description": "Overview\nYou are given n balloons indexed from 0 to n - 1, each with a number on it.\n\nGiven\n- An integer array nums where nums[i] represents the number on balloon i\n\nGoal\nReturn the maximum coins you can collect by bursting all balloons. When you burst balloon i, you earn nums[i - 1] * nums[i] * nums[i + 1] coins, using 1 for out-of-bounds neighbors.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 96,
    "slug": "count-of-smaller-numbers-after-self",
    "title": "Count of Smaller Numbers After Self",
    "difficulty": "HARD",
    "topics": [
      "binary-search",
      "bit-manipulation"
    ],
    "description": "Overview\nFor each position in an array, you want to know how many later elements are smaller.\n\nGiven\n- An integer array nums\n\nGoal\nReturn an array counts where counts[i] is the number of elements to the right of i that are smaller than nums[i].",
    "inputFormat": "{ nums: number[], target: number }",
    "outputFormat": "number",
    "constraints": "nums sorted ascending; up to 10^5 elements",
    "hints": [
      "Maintain [lo, hi] boundaries.",
      "Use mid = lo + (hi-lo)//2."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    nums = data.get(\"nums\", [])\n    target = data.get(\"target\", 0)\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 9
        },
        "output": 4
      },
      {
        "input": {
          "nums": [
            -1,
            0,
            3,
            5,
            9,
            12
          ],
          "target": 2
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums": [
            1
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 0
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 7
        },
        "output": 3
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 1
        },
        "output": 0
      },
      {
        "input": {
          "nums": [
            1,
            3,
            5,
            7
          ],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [],
          "target": 4
        },
        "output": -1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": -2
        },
        "output": 1
      },
      {
        "input": {
          "nums": [
            -5,
            -2,
            0,
            10
          ],
          "target": 11
        },
        "output": -1
      }
    ]
  },
  {
    "num": 97,
    "slug": "find-median-from-data-stream",
    "title": "Find Median from Data Stream",
    "difficulty": "HARD",
    "topics": [
      "heap"
    ],
    "description": "Overview\nDesign a data structure that supports adding numbers and finding the median efficiently.\n\nGiven\n- A stream of integers added over time\n\nGoal\nImplement MedianFinder so addNum inserts a number and findMedian returns the median of all elements seen so far.",
    "inputFormat": "{ nums1: number[], nums2: number[] }",
    "outputFormat": "number",
    "constraints": "0 <= m,n <= 10^5; m + n >= 1",
    "hints": [
      "Binary search on smaller array partition.",
      "Left max <= right min condition."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    a = data.get(\"nums1\", [])\n    b = data.get(\"nums2\", [])\n    if len(a) > len(b):\n        a, b = b, a\n    m, n = len(a), len(b)\n    total = m + n\n    half = (total + 1) // 2\n    lo, hi = 0, m\n    while lo <= hi:\n        i = (lo + hi) // 2\n        j = half - i\n        aL = a[i - 1] if i > 0 else float('-inf')\n        aR = a[i] if i < m else float('inf')\n        bL = b[j - 1] if j > 0 else float('-inf')\n        bR = b[j] if j < n else float('inf')\n        if aL <= bR and bL <= aR:\n            if total % 2:\n                return max(aL, bL)\n            return (max(aL, bL) + min(aR, bR)) / 2\n        if aL > bR:\n            hi = i - 1\n        else:\n            lo = i + 1\n    return 0\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "nums1": [
            1,
            3
          ],
          "nums2": [
            2
          ]
        },
        "output": 2
      },
      {
        "input": {
          "nums1": [
            1,
            2
          ],
          "nums2": [
            3,
            4
          ]
        },
        "output": 2.5
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "nums1": [],
          "nums2": [
            1
          ]
        },
        "output": 1
      },
      {
        "input": {
          "nums1": [
            2
          ],
          "nums2": []
        },
        "output": 2
      },
      {
        "input": {
          "nums1": [
            0,
            0
          ],
          "nums2": [
            0,
            0
          ]
        },
        "output": 0
      },
      {
        "input": {
          "nums1": [
            1
          ],
          "nums2": [
            2,
            3,
            4
          ]
        },
        "output": 2.5
      },
      {
        "input": {
          "nums1": [
            1,
            2,
            3
          ],
          "nums2": [
            4,
            5,
            6
          ]
        },
        "output": 3.5
      },
      {
        "input": {
          "nums1": [
            100
          ],
          "nums2": [
            1,
            2,
            3,
            4,
            5
          ]
        },
        "output": 3.5
      },
      {
        "input": {
          "nums1": [
            1,
            3,
            8,
            9,
            15
          ],
          "nums2": [
            7,
            11,
            18,
            19,
            21,
            25
          ]
        },
        "output": 11
      },
      {
        "input": {
          "nums1": [
            23,
            26,
            31,
            35
          ],
          "nums2": [
            3,
            5,
            7,
            9,
            11,
            16
          ]
        },
        "output": 13.5
      }
    ]
  },
  {
    "num": 98,
    "slug": "word-break-ii",
    "title": "Word Break II",
    "difficulty": "HARD",
    "topics": [
      "dynamic-programming",
      "backtracking",
      "trie"
    ],
    "description": "Overview\nYou are given a string and a dictionary of words.\n\nGiven\n- A string s\n- A list of strings wordDict\n\nGoal\nReturn all sentences formed by adding spaces in s such that each word is in wordDict. The same word may be reused. You may return the answer in any order.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  },
  {
    "num": 99,
    "slug": "palindrome-pairs",
    "title": "Palindrome Pairs",
    "difficulty": "HARD",
    "topics": [
      "trie",
      "strings",
      "hash-table"
    ],
    "description": "Overview\nYou are given a list of unique non-empty words.\n\nGiven\n- An array of unique strings words\n\nGoal\nReturn all pairs of indices (i, j) such that the concatenation of words[i] + words[j] is a palindrome.",
    "inputFormat": "{ s: string }",
    "outputFormat": "boolean",
    "constraints": "1 <= s.length <= 2*10^5",
    "hints": [
      "Use two pointers from both ends.",
      "Skip non-alphanumeric characters."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    s = data.get(\"s\", \"\")\n    i, j = 0, len(s) - 1\n    while i < j:\n        while i < j and not s[i].isalnum():\n            i += 1\n        while i < j and not s[j].isalnum():\n            j -= 1\n        if s[i].lower() != s[j].lower():\n            return False\n        i += 1\n        j -= 1\n    return True\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "s": "A man, a plan, a canal: Panama"
        },
        "output": true
      },
      {
        "input": {
          "s": "race a car"
        },
        "output": false
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "s": " "
        },
        "output": true
      },
      {
        "input": {
          "s": "0P"
        },
        "output": false
      },
      {
        "input": {
          "s": "abba"
        },
        "output": true
      },
      {
        "input": {
          "s": "abc"
        },
        "output": false
      },
      {
        "input": {
          "s": "No lemon, no melon"
        },
        "output": true
      },
      {
        "input": {
          "s": "Was it a car or a cat I saw?"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab_a"
        },
        "output": true
      },
      {
        "input": {
          "s": "ab@a"
        },
        "output": true
      }
    ]
  },
  {
    "num": 100,
    "slug": "minimum-cost-to-cut-a-stick",
    "title": "Minimum Cost to Cut a Stick",
    "difficulty": "HARD",
    "topics": [
      "dynamic-programming",
      "math"
    ],
    "description": "Overview\nYou have a stick of length n and a list of positions where cuts must be made.\n\nGiven\n- An integer n representing stick length\n- An integer array cuts listing required cut positions\n\nGoal\nReturn the minimum total cost to perform all cuts. The cost of a cut equals the current length of the stick being cut.\n\nNotes\n- The order of cuts can be chosen to minimize total cost.\n- After each cut, the stick splits into independent pieces.",
    "inputFormat": "{ coins: number[], amount: number }",
    "outputFormat": "number",
    "constraints": "1 <= coins.length <= 20; 0 <= amount <= 10^4",
    "hints": [
      "Use bottom-up DP.",
      "dp[a] = min(dp[a], dp[a-c] + 1)."
    ],
    "pythonSolution": "import json\nimport sys\n\ndef solve(data):\n    coins = data.get(\"coins\", [])\n    amount = data.get(\"amount\", 0)\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return -1 if dp[amount] == inf else dp[amount]\n\nif __name__ == \"__main__\":\n    data = json.loads(sys.stdin.read() or \"{}\")\n    result = solve(data)\n    print(json.dumps(result))\n",
    "visibleCases": [
      {
        "input": {
          "coins": [
            1,
            2,
            5
          ],
          "amount": 11
        },
        "output": 3
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 3
        },
        "output": -1
      }
    ],
    "hiddenCases": [
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            1
          ],
          "amount": 2
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            2,
            5,
            10,
            1
          ],
          "amount": 27
        },
        "output": 4
      },
      {
        "input": {
          "coins": [
            186,
            419,
            83,
            408
          ],
          "amount": 6249
        },
        "output": 20
      },
      {
        "input": {
          "coins": [
            2
          ],
          "amount": 0
        },
        "output": 0
      },
      {
        "input": {
          "coins": [
            3,
            7
          ],
          "amount": 5
        },
        "output": -1
      },
      {
        "input": {
          "coins": [
            2,
            4,
            6
          ],
          "amount": 8
        },
        "output": 2
      },
      {
        "input": {
          "coins": [
            5,
            7,
            8
          ],
          "amount": 15
        },
        "output": 2
      }
    ]
  }
] as ProblemDefinition[];
