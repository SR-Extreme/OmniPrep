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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Check whether brackets are balanced and properly nested.",
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
    "description": "Return maximum profit from one buy and one sell.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Count distinct ways to climb n stairs with 1 or 2 steps.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Count distinct ways to climb n stairs with 1 or 2 steps.",
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
    "description": "Count distinct ways to climb n stairs with 1 or 2 steps.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Check whether brackets are balanced and properly nested.",
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
    "description": "Check whether brackets are balanced and properly nested.",
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
    "description": "Return all unique triplets that sum to zero.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Maximum water container area from vertical lines.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Return all unique triplets that sum to zero.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Return all unique triplets that sum to zero.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Return maximum profit from one buy and one sell.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Check whether brackets are balanced and properly nested.",
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
    "description": "Check whether brackets are balanced and properly nested.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Return all unique triplets that sum to zero.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Return maximum profit from one buy and one sell.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find two distinct indices whose values sum to target.",
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
    "description": "Determine whether two strings are anagrams.",
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
    "description": "Compute trapped rain water given bar heights.",
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
    "description": "Find median of two sorted arrays in logarithmic partition style.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Compute trapped rain water given bar heights.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Return all unique triplets that sum to zero.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Compute trapped rain water given bar heights.",
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
    "description": "Maximum water container area from vertical lines.",
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
    "description": "Length of longest substring without repeating characters.",
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
    "description": "Count connected components of '1' cells in a grid.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Find target index in a sorted array, else -1.",
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
    "description": "Find median of two sorted arrays in logarithmic partition style.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
    "description": "Check if a string is palindrome ignoring non-alphanumeric and case.",
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
    "description": "Minimum coins needed to make amount, or -1.",
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
