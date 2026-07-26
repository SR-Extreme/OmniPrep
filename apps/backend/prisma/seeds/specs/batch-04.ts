import type { ProblemSpec } from "./types.js";

export const BATCH_04_SPECS: ProblemSpec[] = [
    {
        num: 76,
        slug: "integer-to-roman",
        title: "Integer to Roman",
        difficulty: "MEDIUM",
        topics: ["math", "strings"],
        inputFormat: "{ num: number }",
        outputFormat: "string",
        constraints: "1 <= num <= 3999",
        hints: ["Use subtractive pairs like 4 -> IV.", "Process values largest to smallest."],
        visibleCases: [
            { input: {"num": 3}, output: "III", explanation: "3 = III" },
            { input: {"num": 4}, output: "IV", explanation: "Subtractive IV" },
        ],
        hiddenCases: [
            { input: {"num": 1}, output: "I" },
            { input: {"num": 9}, output: "IX" },
            { input: {"num": 58}, output: "LVIII" },
            { input: {"num": 1994}, output: "MCMXCIV" },
            { input: {"num": 27}, output: "XXVII" },
            { input: {"num": 3999}, output: "MMMCMXCIX" },
            { input: {"num": 944}, output: "CMXLIV" },
            { input: {"num": 49}, output: "XLIX" },
        ],
    },
    {
        num: 77,
        slug: "powx-n",
        title: "Pow(x, n)",
        difficulty: "MEDIUM",
        topics: ["math", "binary-search"],
        inputFormat: "{ x: number, n: number }",
        outputFormat: "number",
        constraints: "-100.0 <= x <= 100.0; -2^31 <= n <= 2^31 - 1",
        hints: ["Use binary exponentiation.", "Handle negative n by inverting x."],
        visibleCases: [
            { input: {"x": 2, "n": 10}, output: 1024, explanation: "2^10" },
            { input: {"x": 2.1, "n": 3}, output: 9.261000000000001 },
        ],
        hiddenCases: [
            { input: {"x": 2, "n": -2}, output: 0.25 },
            { input: {"x": 1, "n": 2147483647}, output: 1 },
            { input: {"x": 2, "n": 0}, output: 1 },
            { input: {"x": 0, "n": 5}, output: 0 },
            { input: {"x": 1, "n": -5}, output: 1 },
            { input: {"x": 3, "n": 4}, output: 81 },
            { input: {"x": 0.5, "n": 3}, output: 0.125 },
            { input: {"x": -2, "n": 3}, output: -8 },
        ],
    },
    {
        num: 78,
        slug: "my-calendar-i",
        title: "My Calendar I",
        difficulty: "MEDIUM",
        topics: ["binary-search", "trees"],
        inputFormat: "{ ops: (\"book\")[], args: [number, number][] }",
        outputFormat: "boolean[] (one per book)",
        constraints: "0 <= start < end <= 10^9; at most 1000 book calls",
        hints: ["Store booked intervals.", "Reject overlap on half-open [start, end)."],
        visibleCases: [
            { input: {"ops": ["book", "book", "book"], "args": [[10, 20], [15, 25], [20, 30]]}, output: [true, false, true], explanation: "Second overlaps" },
            { input: {"ops": ["book", "book"], "args": [[47, 50], [47, 50]]}, output: [true, false] },
        ],
        hiddenCases: [
            { input: {"ops": ["book"], "args": [[5, 10]]}, output: [true] },
            { input: {"ops": ["book", "book"], "args": [[10, 20], [20, 30]]}, output: [true, true] },
            { input: {"ops": ["book", "book", "book"], "args": [[1, 5], [5, 10], [3, 7]]}, output: [true, true, false] },
            { input: {"ops": ["book", "book"], "args": [[0, 10], [10, 20]]}, output: [true, true] },
            { input: {"ops": ["book", "book", "book"], "args": [[20, 30], [10, 20], [15, 25]]}, output: [true, true, false] },
            { input: {"ops": ["book"], "args": [[1, 1000000]]}, output: [true] },
            { input: {"ops": ["book", "book"], "args": [[1, 2], [2, 3]]}, output: [true, true] },
            { input: {"ops": ["book", "book", "book"], "args": [[5, 15], [10, 20], [12, 18]]}, output: [true, false, false] },
        ],
    },
    {
        num: 79,
        slug: "design-hashmap",
        title: "Design HashMap",
        difficulty: "MEDIUM",
        topics: ["hash-table"],
        inputFormat: "{ ops: (\"put\"|\"get\"|\"remove\")[], args: number[][] }",
        outputFormat: "(number | null)[] (one per get)",
        constraints: "At most 10^4 operations; keys and values in [-10^6, 10^6]",
        hints: ["Use an array of buckets or open addressing.", "Return null when a key is missing."],
        visibleCases: [
            { input: {"ops": ["put", "get", "put", "get", "remove", "get"], "args": [[1, 1], [1], [2, 2], [2], [1], [2]]}, output: [1, 2, 2], explanation: "Standard get/put/remove" },
            { input: {"ops": ["put", "get", "put", "get", "get", "put", "get", "remove", "get"], "args": [[1, 1], [1], [2, 2], [2], [3], [4, 4], [4], [4], [4]]}, output: [1, 2, null, 4, null] },
        ],
        hiddenCases: [
            { input: {"ops": ["get"], "args": [[1]]}, output: [null] },
            { input: {"ops": ["put", "get"], "args": [[0, 0], [0]]}, output: [0] },
            { input: {"ops": ["put", "put", "get", "get"], "args": [[1, 10], [2, 20], [1], [2]]}, output: [10, 20] },
            { input: {"ops": ["put", "remove", "get"], "args": [[5, 5], [5], [5]]}, output: [null] },
            { input: {"ops": ["put", "put", "remove", "get", "get"], "args": [[1, 1], [2, 2], [1], [1], [2]]}, output: [null, 2] },
            { input: {"ops": ["put", "get", "put", "get"], "args": [[100, 200], [100], [100, 300], [100]]}, output: [200, 300] },
            { input: {"ops": ["put", "remove", "put", "get"], "args": [[7, 7], [7], [7, 8], [7]]}, output: [8] },
            { input: {"ops": ["put", "put", "remove", "remove", "get"], "args": [[1, 1], [2, 2], [1], [2], [2]]}, output: [null] },
        ],
    },
    {
        num: 80,
        slug: "design-add-and-search-words-data-structure",
        title: "Design Add and Search Words Data Structure",
        difficulty: "MEDIUM",
        topics: ["trie", "strings"],
        inputFormat: "{ ops: (\"addWord\"|\"search\")[], args: [string[]] }",
        outputFormat: "boolean[] (one per addWord/search)",
        constraints: "Words are lowercase; at most 10^4 operations",
        hints: ["Build a trie of words.", "Use DFS for '.' wildcard matches."],
        visibleCases: [
            { input: {"ops": ["addWord", "search", "search", "search", "search"], "args": [["bad"], ["bad"], [".ad"], ["b.."]]}, output: [true, true, true, true], explanation: "Wildcard search" },
            { input: {"ops": ["addWord", "addWord", "search"], "args": [["at"], ["and"], ["an"]]}, output: [true, true, false] },
        ],
        hiddenCases: [
            { input: {"ops": ["addWord", "search"], "args": [["a"], ["."]]}, output: [true, true] },
            { input: {"ops": ["addWord", "search"], "args": [["abc"], ["ab"]]}, output: [true, false] },
            { input: {"ops": ["addWord", "search"], "args": [["abc"], [".bc"]]}, output: [true, true] },
            { input: {"ops": ["addWord", "search"], "args": [["abc"], ["..."]]}, output: [true, true] },
            { input: {"ops": ["addWord", "addWord", "search"], "args": [["hello"], ["hell"], ["he..o"]]}, output: [true, true, true] },
            { input: {"ops": ["addWord", "search"], "args": [["xyz"], ["x.z"]]}, output: [true, true] },
            { input: {"ops": ["addWord", "search"], "args": [["a"], ["a"]]}, output: [true, true] },
            { input: {"ops": ["addWord", "search"], "args": [["dot"], ["d.t"]]}, output: [true, true] },
        ],
    },
    {
        num: 81,
        slug: "trapping-rain-water",
        title: "Trapping Rain Water",
        difficulty: "HARD",
        topics: ["two-pointers", "stack", "arrays"],
        inputFormat: "{ height: number[] }",
        outputFormat: "number",
        constraints: "1 <= height.length <= 2*10^5; 0 <= height[i] <= 10^5",
        hints: ["Use two pointers and running max boundaries.", "Water at index depends on smaller boundary."],
        visibleCases: [
            { input: {"height": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]}, output: 6, explanation: "Classic trap" },
            { input: {"height": [4, 2, 0, 3, 2, 5]}, output: 9 },
        ],
        hiddenCases: [
            { input: {"height": [1]}, output: 0 },
            { input: {"height": [2, 0, 2]}, output: 2 },
            { input: {"height": [3, 0, 0, 2, 0, 4]}, output: 10 },
            { input: {"height": [1, 2, 3]}, output: 0 },
            { input: {"height": [3, 2, 1]}, output: 0 },
            { input: {"height": [5, 4, 1, 2]}, output: 1 },
            { input: {"height": [2, 1, 0, 1, 3]}, output: 4 },
            { input: {"height": [0, 7, 1, 4, 6]}, output: 7 },
        ],
    },
    {
        num: 82,
        slug: "median-of-two-sorted-arrays",
        title: "Median of Two Sorted Arrays",
        difficulty: "HARD",
        topics: ["binary-search", "arrays"],
        inputFormat: "{ nums1: number[], nums2: number[] }",
        outputFormat: "number",
        constraints: "0 <= m,n <= 10^5; m + n >= 1",
        hints: ["Binary search on smaller array partition.", "Left max <= right min condition."],
        visibleCases: [
            { input: {"nums1": [1, 3], "nums2": [2]}, output: 2, explanation: "Median is 2" },
            { input: {"nums1": [1, 2], "nums2": [3, 4]}, output: 2.5 },
        ],
        hiddenCases: [
            { input: {"nums1": [], "nums2": [1]}, output: 1 },
            { input: {"nums1": [2], "nums2": []}, output: 2 },
            { input: {"nums1": [0, 0], "nums2": [0, 0]}, output: 0 },
            { input: {"nums1": [1], "nums2": [2, 3, 4]}, output: 2.5 },
            { input: {"nums1": [1, 2, 3], "nums2": [4, 5, 6]}, output: 3.5 },
            { input: {"nums1": [100], "nums2": [1, 2, 3, 4, 5]}, output: 3.5 },
            { input: {"nums1": [1, 3, 8, 9, 15], "nums2": [7, 11, 18, 19, 21, 25]}, output: 11 },
            { input: {"nums1": [23, 26, 31, 35], "nums2": [3, 5, 7, 9, 11, 16]}, output: 13.5 },
        ],
    },
    {
        num: 83,
        slug: "minimum-window-substring",
        title: "Minimum Window Substring",
        difficulty: "HARD",
        topics: ["sliding-window", "hash-table", "strings"],
        inputFormat: "{ s: string, t: string }",
        outputFormat: "string",
        constraints: "1 <= s.length, t.length <= 10^5",
        hints: ["Expand right until window covers t.", "Shrink left while still valid."],
        visibleCases: [
            { input: {"s": "ADOBECODEBANC", "t": "ABC"}, output: "BANC", explanation: "Smallest window BANC" },
            { input: {"s": "a", "t": "a"}, output: "a" },
        ],
        hiddenCases: [
            { input: {"s": "a", "t": "aa"}, output: "" },
            { input: {"s": "abc", "t": "cba"}, output: "abc" },
            { input: {"s": "abc", "t": "ac"}, output: "abc" },
            { input: {"s": "cabwefgewcwaefgcf", "t": "cae"}, output: "cwae" },
            { input: {"s": "aa", "t": "aa"}, output: "aa" },
            { input: {"s": "bba", "t": "ab"}, output: "ba" },
            { input: {"s": "ab", "t": "b"}, output: "b" },
            { input: {"s": "abc", "t": "d"}, output: "" },
        ],
    },
    {
        num: 84,
        slug: "merge-k-sorted-lists",
        title: "Merge K Sorted Lists",
        difficulty: "HARD",
        topics: ["linked-list", "heap"],
        inputFormat: "{ lists: number[][] }",
        outputFormat: "number[] (merged sorted)",
        constraints: "0 <= lists.length <= 10^4; each list sorted ascending",
        hints: ["Use a min-heap of list heads.", "Pop smallest and advance that list."],
        visibleCases: [
            { input: {"lists": [[1, 4, 5], [1, 3, 4], [2, 6]]}, output: [1, 1, 2, 3, 4, 4, 5, 6], explanation: "Merge three lists" },
            { input: {"lists": []}, output: [] },
        ],
        hiddenCases: [
            { input: {"lists": [[]]}, output: [] },
            { input: {"lists": [[1], [2, 3]]}, output: [1, 2, 3] },
            { input: {"lists": [[1, 2, 3]]}, output: [1, 2, 3] },
            { input: {"lists": [[1], [1]]}, output: [1, 1] },
            { input: {"lists": [[1, 2], [3, 4], [5, 6]]}, output: [1, 2, 3, 4, 5, 6] },
            { input: {"lists": [[1, 4, 5, 6], [2, 3]]}, output: [1, 2, 3, 4, 5, 6] },
            { input: {"lists": [[-1, 1], [0, 2]]}, output: [-1, 0, 1, 2] },
            { input: {"lists": [[1, 2, 3, 4, 5]]}, output: [1, 2, 3, 4, 5] },
        ],
    },
    {
        num: 85,
        slug: "largest-rectangle-in-histogram",
        title: "Largest Rectangle in Histogram",
        difficulty: "HARD",
        topics: ["stack", "arrays"],
        inputFormat: "{ heights: number[] }",
        outputFormat: "number",
        constraints: "1 <= heights.length <= 10^5; 0 <= heights[i] <= 10^4",
        hints: ["Maintain a monotonic increasing stack.", "Pop when height drops to compute width."],
        visibleCases: [
            { input: {"heights": [2, 1, 5, 6, 2, 3]}, output: 10, explanation: "Max area 10" },
            { input: {"heights": [2, 4]}, output: 4 },
        ],
        hiddenCases: [
            { input: {"heights": [1]}, output: 1 },
            { input: {"heights": [2, 2]}, output: 4 },
            { input: {"heights": [1, 1]}, output: 2 },
            { input: {"heights": [6, 2, 5, 4, 5, 6, 3]}, output: 16 },
            { input: {"heights": [1, 2, 3, 4, 5]}, output: 9 },
            { input: {"heights": [5, 4, 1, 2]}, output: 8 },
            { input: {"heights": [0, 9]}, output: 9 },
            { input: {"heights": [2, 1, 2]}, output: 3 },
        ],
    },
    {
        num: 86,
        slug: "word-ladder",
        title: "Word Ladder",
        difficulty: "HARD",
        topics: ["graphs", "queue", "strings"],
        inputFormat: "{ beginWord: string, endWord: string, wordList: string[] }",
        outputFormat: "number (path length, 0 if none)",
        constraints: "All words same length; 1 <= wordList.length <= 5000",
        hints: ["BFS over one-letter mutations.", "Remove visited words from the set."],
        visibleCases: [
            { input: {"beginWord": "hit", "endWord": "cog", "wordList": ["hot", "dot", "dog", "lot", "log", "cog"]}, output: 5, explanation: "Length 5" },
            { input: {"beginWord": "hit", "endWord": "cog", "wordList": ["hot", "dot", "dog", "lot", "log"]}, output: 0, explanation: "End not in list" },
        ],
        hiddenCases: [
            { input: {"beginWord": "a", "endWord": "c", "wordList": ["a", "b", "c"]}, output: 2 },
            { input: {"beginWord": "hot", "endWord": "dog", "wordList": ["hot", "dog"]}, output: 0 },
            { input: {"beginWord": "talk", "endWord": "walk", "wordList": ["talk", "walk"]}, output: 2 },
            { input: {"beginWord": "hit", "endWord": "cog", "wordList": ["hot", "cog", "dot", "dog"]}, output: 5 },
            { input: {"beginWord": "a", "endWord": "b", "wordList": ["a", "b", "c"]}, output: 2 },
            { input: {"beginWord": "red", "endWord": "tax", "wordList": ["ted", "tex", "red", "tax", "tad", "den", "rex", "pee"]}, output: 4 },
            { input: {"beginWord": "qa", "endWord": "sq", "wordList": ["si", "go", "se", "cm", "so", "ph", "mt", "db", "mb", "sb", "kr", "ln", "tm", "le", "av", "sm", "ar", "ci", "ca", "br", "ti", "ba", "to", "ra", "fa", "yo", "ow", "sn", "ya", "cr", "po", "fe", "ho", "ma", "re", "or", "rn", "au", "ur", "rh", "sr", "tc", "lt", "lo", "as", "fr", "nb", "yb", "if", "pb", "ge", "th", "pm", "rb", "sh", "co", "ca", "ta", "lb", "la", "qi", "pa", "ni", "ho", "ne", "ut", "me", "nd", "sa", "fe", "ho", "la", "ou", "et", "le", "mo", "fa", "ge", "er", "me", "sn", "pu", "pr", "ni", "te", "ca", "ut", "be", "mi", "ta", "la", "ni", "fo", "ho", "ge", "ne", "be", "me", "ut", "ho", "si", "ha", "as", "or", "fo", "ti", "in", "it", "st", "er", "ha", "nd", "on", "to", "nt", "ha", "ou", "ea", "le", "ou", "nd", "ha", "ng", "es", "ce", "on", "al", "ra", "ed", "nd", "co", "ra", "te", "of", "on", "ha", "ng", "co", "mp", "le", "te"]}, output: 0 },
            { input: {"beginWord": "leet", "endWord": "code", "wordList": ["lest", "leet", "lose", "code", "lode", "robe", "lost"]}, output: 6 },
        ],
    },
    {
        num: 87,
        slug: "edit-distance",
        title: "Edit Distance",
        difficulty: "HARD",
        topics: ["dynamic-programming", "strings"],
        inputFormat: "{ word1: string, word2: string }",
        outputFormat: "number",
        constraints: "0 <= word1.length, word2.length <= 500",
        hints: ["DP on prefixes of both strings.", "Match, insert, delete, or replace."],
        visibleCases: [
            { input: {"word1": "horse", "word2": "ros"}, output: 3, explanation: "3 operations" },
            { input: {"word1": "", "word2": ""}, output: 0 },
        ],
        hiddenCases: [
            { input: {"word1": "a", "word2": "b"}, output: 1 },
            { input: {"word1": "abc", "word2": "abc"}, output: 0 },
            { input: {"word1": "abc", "word2": "yabc"}, output: 1 },
            { input: {"word1": "intention", "word2": "execution"}, output: 5 },
            { input: {"word1": "a", "word2": ""}, output: 1 },
            { input: {"word1": "", "word2": "a"}, output: 1 },
            { input: {"word1": "park", "word2": "spake"}, output: 3 },
            { input: {"word1": "sea", "word2": "eat"}, output: 2 },
        ],
    },
    {
        num: 88,
        slug: "n-queens",
        title: "N-Queens",
        difficulty: "HARD",
        topics: ["backtracking"],
        inputFormat: "{ n: number }",
        outputFormat: "string[][] (board rows per solution)",
        constraints: "1 <= n <= 9",
        hints: ["Track columns and diagonals.", "Place queens row by row."],
        visibleCases: [
            { input: {"n": 4}, output: [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]], explanation: "Two solutions for n=4" },
            { input: {"n": 1}, output: [["Q"]] },
        ],
        hiddenCases: [
            { input: {"n": 2}, output: [] },
            { input: {"n": 3}, output: [] },
            { input: {"n": 5}, output: [["Q....", "..Q..", "....Q", ".Q...", "...Q."], ["Q....", "...Q.", ".Q...", "....Q", "..Q.."], [".Q...", "...Q.", "Q....", "..Q..", "....Q"], [".Q...", "....Q", "..Q..", "Q....", "...Q."], ["..Q..", "Q....", "...Q.", ".Q...", "....Q"], ["..Q..", "....Q", ".Q...", "...Q.", "Q...."], ["...Q.", "Q....", "..Q..", "....Q", ".Q..."], ["...Q.", ".Q...", "....Q", "..Q..", "Q...."], ["....Q", ".Q...", "...Q.", "Q....", "..Q.."], ["....Q", "..Q..", "Q....", "...Q.", ".Q..."]] },
            { input: {"n": 6}, output: [[".Q....", "...Q..", ".....Q", "Q.....", "..Q...", "....Q."], ["..Q...", ".....Q", ".Q....", "....Q.", "Q.....", "...Q.."], ["...Q..", "Q.....", "....Q.", ".Q....", ".....Q", "..Q..."], ["....Q.", "..Q...", "Q.....", ".....Q", "...Q..", ".Q...."]] },
            { input: {"n": 7}, output: [["Q......", "..Q....", "....Q..", "......Q", ".Q.....", "...Q...", ".....Q."], ["Q......", "...Q...", "......Q", "..Q....", ".....Q.", ".Q.....", "....Q.."], ["Q......", "....Q..", ".Q.....", ".....Q.", "..Q....", "......Q", "...Q..."], ["Q......", ".....Q.", "...Q...", ".Q.....", "......Q", "....Q..", "..Q...."], [".Q.....", "...Q...", "Q......", "......Q", "....Q..", "..Q....", ".....Q."], [".Q.....", "...Q...", ".....Q.", "Q......", "..Q....", "....Q..", "......Q"], [".Q.....", "....Q..", "Q......", "...Q...", "......Q", "..Q....", ".....Q."], [".Q.....", "....Q..", "..Q....", "Q......", "......Q", "...Q...", ".....Q."], [".Q.....", "....Q..", "......Q", "...Q...", "Q......", "..Q....", ".....Q."], [".Q.....", ".....Q.", "..Q....", "......Q", "...Q...", "Q......", "....Q.."], [".Q.....", "......Q", "....Q..", "..Q....", "Q......", ".....Q.", "...Q..."], ["..Q....", "Q......", ".....Q.", ".Q.....", "....Q..", "......Q", "...Q..."], ["..Q....", "Q......", ".....Q.", "...Q...", ".Q.....", "......Q", "....Q.."], ["..Q....", "....Q..", "......Q", ".Q.....", "...Q...", ".....Q.", "Q......"], ["..Q....", ".....Q.", ".Q.....", "....Q..", "Q......", "...Q...", "......Q"], ["..Q....", "......Q", ".Q.....", "...Q...", ".....Q.", "Q......", "....Q.."], ["..Q....", "......Q", "...Q...", "Q......", "....Q..", ".Q.....", ".....Q."], ["...Q...", "Q......", "..Q....", ".....Q.", ".Q.....", "......Q", "....Q.."], ["...Q...", "Q......", "....Q..", ".Q.....", ".....Q.", "..Q....", "......Q"], ["...Q...", ".Q.....", "......Q", "....Q..", "..Q....", "Q......", ".....Q."], ["...Q...", ".....Q.", "Q......", "..Q....", "....Q..", "......Q", ".Q....."], ["...Q...", "......Q", "..Q....", ".....Q.", ".Q.....", "....Q..", "Q......"], ["...Q...", "......Q", "....Q..", ".Q.....", ".....Q.", "Q......", "..Q...."], ["....Q..", "Q......", "...Q...", "......Q", "..Q....", ".....Q.", ".Q....."], ["....Q..", "Q......", ".....Q.", "...Q...", ".Q.....", "......Q", "..Q...."], ["....Q..", ".Q.....", ".....Q.", "..Q....", "......Q", "...Q...", "Q......"], ["....Q..", "..Q....", "Q......", ".....Q.", "...Q...", ".Q.....", "......Q"], ["....Q..", "......Q", ".Q.....", "...Q...", ".....Q.", "Q......", "..Q...."], ["....Q..", "......Q", ".Q.....", ".....Q.", "..Q....", "Q......", "...Q..."], [".....Q.", "Q......", "..Q....", "....Q..", "......Q", ".Q.....", "...Q..."], [".....Q.", ".Q.....", "....Q..", "Q......", "...Q...", "......Q", "..Q...."], [".....Q.", "..Q....", "Q......", "...Q...", "......Q", "....Q..", ".Q....."], [".....Q.", "..Q....", "....Q..", "......Q", "Q......", "...Q...", ".Q....."], [".....Q.", "..Q....", "......Q", "...Q...", "Q......", "....Q..", ".Q....."], [".....Q.", "...Q...", ".Q.....", "......Q", "....Q..", "..Q....", "Q......"], [".....Q.", "...Q...", "......Q", "Q......", "..Q....", "....Q..", ".Q....."], ["......Q", ".Q.....", "...Q...", ".....Q.", "Q......", "..Q....", "....Q.."], ["......Q", "..Q....", ".....Q.", ".Q.....", "....Q..", "Q......", "...Q..."], ["......Q", "...Q...", "Q......", "....Q..", ".Q.....", ".....Q.", "..Q...."], ["......Q", "....Q..", "..Q....", "Q......", ".....Q.", "...Q...", ".Q....."]] },
            { input: {"n": 8}, output: [["Q.......", "....Q...", ".......Q", ".....Q..", "..Q.....", "......Q.", ".Q......", "...Q...."], ["Q.......", ".....Q..", ".......Q", "..Q.....", "......Q.", "...Q....", ".Q......", "....Q..."], ["Q.......", "......Q.", "...Q....", ".....Q..", ".......Q", ".Q......", "....Q...", "..Q....."], ["Q.......", "......Q.", "....Q...", ".......Q", ".Q......", "...Q....", ".....Q..", "..Q....."], [".Q......", "...Q....", ".....Q..", ".......Q", "..Q.....", "Q.......", "......Q.", "....Q..."], [".Q......", "....Q...", "......Q.", "Q.......", "..Q.....", ".......Q", ".....Q..", "...Q...."], [".Q......", "....Q...", "......Q.", "...Q....", "Q.......", ".......Q", ".....Q..", "..Q....."], [".Q......", ".....Q..", "Q.......", "......Q.", "...Q....", ".......Q", "..Q.....", "....Q..."], [".Q......", ".....Q..", ".......Q", "..Q.....", "Q.......", "...Q....", "......Q.", "....Q..."], [".Q......", "......Q.", "..Q.....", ".....Q..", ".......Q", "....Q...", "Q.......", "...Q...."], [".Q......", "......Q.", "....Q...", ".......Q", "Q.......", "...Q....", ".....Q..", "..Q....."], [".Q......", ".......Q", ".....Q..", "Q.......", "..Q.....", "....Q...", "......Q.", "...Q...."], ["..Q.....", "Q.......", "......Q.", "....Q...", ".......Q", ".Q......", "...Q....", ".....Q.."], ["..Q.....", "....Q...", ".Q......", ".......Q", "Q.......", "......Q.", "...Q....", ".....Q.."], ["..Q.....", "....Q...", ".Q......", ".......Q", ".....Q..", "...Q....", "......Q.", "Q......."], ["..Q.....", "....Q...", "......Q.", "Q.......", "...Q....", ".Q......", ".......Q", ".....Q.."], ["..Q.....", "....Q...", ".......Q", "...Q....", "Q.......", "......Q.", ".Q......", ".....Q.."], ["..Q.....", ".....Q..", ".Q......", "....Q...", ".......Q", "Q.......", "......Q.", "...Q...."], ["..Q.....", ".....Q..", ".Q......", "......Q.", "Q.......", "...Q....", ".......Q", "....Q..."], ["..Q.....", ".....Q..", ".Q......", "......Q.", "....Q...", "Q.......", ".......Q", "...Q...."], ["..Q.....", ".....Q..", "...Q....", "Q.......", ".......Q", "....Q...", "......Q.", ".Q......"], ["..Q.....", ".....Q..", "...Q....", ".Q......", ".......Q", "....Q...", "......Q.", "Q......."], ["..Q.....", ".....Q..", ".......Q", "Q.......", "...Q....", "......Q.", "....Q...", ".Q......"], ["..Q.....", ".....Q..", ".......Q", "Q.......", "....Q...", "......Q.", ".Q......", "...Q...."], ["..Q.....", ".....Q..", ".......Q", ".Q......", "...Q....", "Q.......", "......Q.", "....Q..."], ["..Q.....", "......Q.", ".Q......", ".......Q", "....Q...", "Q.......", "...Q....", ".....Q.."], ["..Q.....", "......Q.", ".Q......", ".......Q", ".....Q..", "...Q....", "Q.......", "....Q..."], ["..Q.....", ".......Q", "...Q....", "......Q.", "Q.......", ".....Q..", ".Q......", "....Q..."], ["...Q....", "Q.......", "....Q...", ".......Q", ".Q......", "......Q.", "..Q.....", ".....Q.."], ["...Q....", "Q.......", "....Q...", ".......Q", ".....Q..", "..Q.....", "......Q.", ".Q......"], ["...Q....", ".Q......", "....Q...", ".......Q", ".....Q..", "Q.......", "..Q.....", "......Q."], ["...Q....", ".Q......", "......Q.", "..Q.....", ".....Q..", ".......Q", "Q.......", "....Q..."], ["...Q....", ".Q......", "......Q.", "..Q.....", ".....Q..", ".......Q", "....Q...", "Q......."], ["...Q....", ".Q......", "......Q.", "....Q...", "Q.......", ".......Q", ".....Q..", "..Q....."], ["...Q....", ".Q......", ".......Q", "....Q...", "......Q.", "Q.......", "..Q.....", ".....Q.."], ["...Q....", ".Q......", ".......Q", ".....Q..", "Q.......", "..Q.....", "....Q...", "......Q."], ["...Q....", ".....Q..", "Q.......", "....Q...", ".Q......", ".......Q", "..Q.....", "......Q."], ["...Q....", ".....Q..", ".......Q", ".Q......", "......Q.", "Q.......", "..Q.....", "....Q..."], ["...Q....", ".....Q..", ".......Q", "..Q.....", "Q.......", "......Q.", "....Q...", ".Q......"], ["...Q....", "......Q.", "Q.......", ".......Q", "....Q...", ".Q......", ".....Q..", "..Q....."], ["...Q....", "......Q.", "..Q.....", ".......Q", ".Q......", "....Q...", "Q.......", ".....Q.."], ["...Q....", "......Q.", "....Q...", ".Q......", ".....Q..", "Q.......", "..Q.....", ".......Q"], ["...Q....", "......Q.", "....Q...", "..Q.....", "Q.......", ".....Q..", ".......Q", ".Q......"], ["...Q....", ".......Q", "Q.......", "..Q.....", ".....Q..", ".Q......", "......Q.", "....Q..."], ["...Q....", ".......Q", "Q.......", "....Q...", "......Q.", ".Q......", ".....Q..", "..Q....."], ["...Q....", ".......Q", "....Q...", "..Q.....", "Q.......", "......Q.", ".Q......", ".....Q.."], ["....Q...", "Q.......", "...Q....", ".....Q..", ".......Q", ".Q......", "......Q.", "..Q....."], ["....Q...", "Q.......", ".......Q", "...Q....", ".Q......", "......Q.", "..Q.....", ".....Q.."], ["....Q...", "Q.......", ".......Q", ".....Q..", "..Q.....", "......Q.", ".Q......", "...Q...."], ["....Q...", ".Q......", "...Q....", ".....Q..", ".......Q", "..Q.....", "Q.......", "......Q."], ["....Q...", ".Q......", "...Q....", "......Q.", "..Q.....", ".......Q", ".....Q..", "Q......."], ["....Q...", ".Q......", ".....Q..", "Q.......", "......Q.", "...Q....", ".......Q", "..Q....."], ["....Q...", ".Q......", ".......Q", "Q.......", "...Q....", "......Q.", "..Q.....", ".....Q.."], ["....Q...", "..Q.....", "Q.......", ".....Q..", ".......Q", ".Q......", "...Q....", "......Q."], ["....Q...", "..Q.....", "Q.......", "......Q.", ".Q......", ".......Q", ".....Q..", "...Q...."], ["....Q...", "..Q.....", ".......Q", "...Q....", "......Q.", "Q.......", ".....Q..", ".Q......"], ["....Q...", "......Q.", "Q.......", "..Q.....", ".......Q", ".....Q..", "...Q....", ".Q......"], ["....Q...", "......Q.", "Q.......", "...Q....", ".Q......", ".......Q", ".....Q..", "..Q....."], ["....Q...", "......Q.", ".Q......", "...Q....", ".......Q", "Q.......", "..Q.....", ".....Q.."], ["....Q...", "......Q.", ".Q......", ".....Q..", "..Q.....", "Q.......", "...Q....", ".......Q"], ["....Q...", "......Q.", ".Q......", ".....Q..", "..Q.....", "Q.......", ".......Q", "...Q...."], ["....Q...", "......Q.", "...Q....", "Q.......", "..Q.....", ".......Q", ".....Q..", ".Q......"], ["....Q...", ".......Q", "...Q....", "Q.......", "..Q.....", ".....Q..", ".Q......", "......Q."], ["....Q...", ".......Q", "...Q....", "Q.......", "......Q.", ".Q......", ".....Q..", "..Q....."], [".....Q..", "Q.......", "....Q...", ".Q......", ".......Q", "..Q.....", "......Q.", "...Q...."], [".....Q..", ".Q......", "......Q.", "Q.......", "..Q.....", "....Q...", ".......Q", "...Q...."], [".....Q..", ".Q......", "......Q.", "Q.......", "...Q....", ".......Q", "....Q...", "..Q....."], [".....Q..", "..Q.....", "Q.......", "......Q.", "....Q...", ".......Q", ".Q......", "...Q...."], [".....Q..", "..Q.....", "Q.......", ".......Q", "...Q....", ".Q......", "......Q.", "....Q..."], [".....Q..", "..Q.....", "Q.......", ".......Q", "....Q...", ".Q......", "...Q....", "......Q."], [".....Q..", "..Q.....", "....Q...", "......Q.", "Q.......", "...Q....", ".Q......", ".......Q"], [".....Q..", "..Q.....", "....Q...", ".......Q", "Q.......", "...Q....", ".Q......", "......Q."], [".....Q..", "..Q.....", "......Q.", ".Q......", "...Q....", ".......Q", "Q.......", "....Q..."], [".....Q..", "..Q.....", "......Q.", ".Q......", ".......Q", "....Q...", "Q.......", "...Q...."], [".....Q..", "..Q.....", "......Q.", "...Q....", "Q.......", ".......Q", ".Q......", "....Q..."], [".....Q..", "...Q....", "Q.......", "....Q...", ".......Q", ".Q......", "......Q.", "..Q....."], [".....Q..", "...Q....", ".Q......", ".......Q", "....Q...", "......Q.", "Q.......", "..Q....."], [".....Q..", "...Q....", "......Q.", "Q.......", "..Q.....", "....Q...", ".Q......", ".......Q"], [".....Q..", "...Q....", "......Q.", "Q.......", ".......Q", ".Q......", "....Q...", "..Q....."], [".....Q..", ".......Q", ".Q......", "...Q....", "Q.......", "......Q.", "....Q...", "..Q....."], ["......Q.", "Q.......", "..Q.....", ".......Q", ".....Q..", "...Q....", ".Q......", "....Q..."], ["......Q.", ".Q......", "...Q....", "Q.......", ".......Q", "....Q...", "..Q.....", ".....Q.."], ["......Q.", ".Q......", ".....Q..", "..Q.....", "Q.......", "...Q....", ".......Q", "....Q..."], ["......Q.", "..Q.....", "Q.......", ".....Q..", ".......Q", "....Q...", ".Q......", "...Q...."], ["......Q.", "..Q.....", ".......Q", ".Q......", "....Q...", "Q.......", ".....Q..", "...Q...."], ["......Q.", "...Q....", ".Q......", "....Q...", ".......Q", "Q.......", "..Q.....", ".....Q.."], ["......Q.", "...Q....", ".Q......", ".......Q", ".....Q..", "Q.......", "..Q.....", "....Q..."], ["......Q.", "....Q...", "..Q.....", "Q.......", ".....Q..", ".......Q", ".Q......", "...Q...."], [".......Q", ".Q......", "...Q....", "Q.......", "......Q.", "....Q...", "..Q.....", ".....Q.."], [".......Q", ".Q......", "....Q...", "..Q.....", "Q.......", "......Q.", "...Q....", ".....Q.."], [".......Q", "..Q.....", "Q.......", ".....Q..", ".Q......", "....Q...", "......Q.", "...Q...."], [".......Q", "...Q....", "Q.......", "..Q.....", ".....Q..", ".Q......", "......Q.", "....Q..."]] },
            { input: {"n": 1}, output: [["Q"]] },
            { input: {"n": 5}, output: [["Q....", "..Q..", "....Q", ".Q...", "...Q."], ["Q....", "...Q.", ".Q...", "....Q", "..Q.."], [".Q...", "...Q.", "Q....", "..Q..", "....Q"], [".Q...", "....Q", "..Q..", "Q....", "...Q."], ["..Q..", "Q....", "...Q.", ".Q...", "....Q"], ["..Q..", "....Q", ".Q...", "...Q.", "Q...."], ["...Q.", "Q....", "..Q..", "....Q", ".Q..."], ["...Q.", ".Q...", "....Q", "..Q..", "Q...."], ["....Q", ".Q...", "...Q.", "Q....", "..Q.."], ["....Q", "..Q..", "Q....", "...Q.", ".Q..."]] },
        ],
    },
    {
        num: 89,
        slug: "regular-expression-matching",
        title: "Regular Expression Matching",
        difficulty: "HARD",
        topics: ["dynamic-programming", "strings"],
        inputFormat: "{ s: string, p: string }",
        outputFormat: "boolean",
        constraints: "1 <= s.length <= 20; 1 <= p.length <= 30",
        hints: ["DP over prefixes of s and p.", "Handle '*' by zero or more of prior char."],
        visibleCases: [
            { input: {"s": "aa", "p": "a*"}, output: true, explanation: "a* matches aa" },
            { input: {"s": "ab", "p": ".*"}, output: true },
        ],
        hiddenCases: [
            { input: {"s": "aab", "p": "c*a*b"}, output: true },
            { input: {"s": "mississippi", "p": "mis*is*p*."}, output: false },
            { input: {"s": "a", "p": "ab*"}, output: true },
            { input: {"s": "a", "p": "ab*a"}, output: false },
            { input: {"s": "aaa", "p": "a*a"}, output: true },
            { input: {"s": "ab", "p": ".*c"}, output: false },
            { input: {"s": "aaa", "p": "aaaa"}, output: false },
            { input: {"s": "", "p": ".*"}, output: true },
        ],
    },
    {
        num: 90,
        slug: "serialize-and-deserialize-binary-tree",
        title: "Serialize and Deserialize Binary Tree",
        difficulty: "HARD",
        topics: ["trees", "queue"],
        inputFormat: "{ root: (number | null)[] }",
        outputFormat: "string (level-order JSON)",
        constraints: "Tree has up to 10^4 nodes; values in [-1000, 1000]",
        hints: ["BFS level-order with null markers.", "Trim trailing nulls in output."],
        visibleCases: [
            { input: {"root": [1, 2, 3, null, null, 4, 5]}, output: "[1, 2, 3, null, null, 4, 5]", explanation: "Level-order string" },
            { input: {"root": []}, output: "[]" },
        ],
        hiddenCases: [
            { input: {"root": [1]}, output: "[1]" },
            { input: {"root": [1, null, 2]}, output: "[1, null, 2]" },
            { input: {"root": [5, 4, 3, null, null, 2, 1]}, output: "[5, 4, 3, null, null, 2, 1]" },
            { input: {"root": [1, 2]}, output: "[1, 2]" },
            { input: {"root": [1, 2, null, 3]}, output: "[1, 2, null, 3]" },
            { input: {"root": [1, 2, 3, 4, 5, 6, 7]}, output: "[1, 2, 3, 4, 5, 6, 7]" },
            { input: {"root": [1, null, 2, null, 3]}, output: "[1, null, 2]" },
            { input: {"root": [10, 5, 15]}, output: "[10, 5, 15]" },
        ],
    },
    {
        num: 91,
        slug: "maximal-rectangle",
        title: "Maximal Rectangle",
        difficulty: "HARD",
        topics: ["stack", "dynamic-programming"],
        inputFormat: "{ matrix: string[][] }",
        outputFormat: "number",
        constraints: "1 <= rows, cols <= 200; matrix[i][j] is '0' or '1'",
        hints: ["Build histogram heights per row.", "Run largest-rectangle on each row."],
        visibleCases: [
            { input: {"matrix": [["1", "0", "1", "0", "0"], ["1", "0", "1", "1", "1"], ["1", "1", "1", "1", "1"], ["1", "0", "0", "1", "0"]]}, output: 6, explanation: "Area 6" },
            { input: {"matrix": [["0"]]}, output: 0 },
        ],
        hiddenCases: [
            { input: {"matrix": [["1", "1"]]}, output: 2 },
            { input: {"matrix": [["1", "1"], ["1", "1"]]}, output: 4 },
            { input: {"matrix": [["0", "1"], ["1", "0"]]}, output: 1 },
            { input: {"matrix": [["1", "0", "1"], ["1", "1", "1"]]}, output: 3 },
            { input: {"matrix": [["1", "0"], ["0", "1"], ["1", "0"]]}, output: 1 },
            { input: {"matrix": [["1", "1", "1", "1"]]}, output: 4 },
            { input: {"matrix": [["1", "0", "0"], ["1", "1", "1"], ["1", "1", "1"]]}, output: 6 },
            { input: {"matrix": [["0", "0"], ["0", "0"]]}, output: 0 },
        ],
    },
    {
        num: 92,
        slug: "sliding-window-maximum",
        title: "Sliding Window Maximum",
        difficulty: "HARD",
        topics: ["queue", "heap", "sliding-window"],
        inputFormat: "{ nums: number[], k: number }",
        outputFormat: "number[]",
        constraints: "1 <= nums.length <= 10^5; 1 <= k <= nums.length",
        hints: ["Deque stores indices in decreasing value order.", "Drop indices outside the window."],
        visibleCases: [
            { input: {"nums": [1, 3, -1, -3, 5, 3, 6, 7], "k": 3}, output: [3, 3, 5, 5, 6, 7], explanation: "Window maxima" },
            { input: {"nums": [1], "k": 1}, output: [1] },
        ],
        hiddenCases: [
            { input: {"nums": [1, -1], "k": 1}, output: [1, -1] },
            { input: {"nums": [9, 11], "k": 2}, output: [11] },
            { input: {"nums": [4, 2, 12], "k": 2}, output: [4, 12] },
            { input: {"nums": [7, 2, 4], "k": 2}, output: [7, 4] },
            { input: {"nums": [1, 2, 3, 4, 5], "k": 2}, output: [2, 3, 4, 5] },
            { input: {"nums": [1, 3, 1, 2, 5], "k": 3}, output: [3, 3, 5] },
            { input: {"nums": [9, 10, 9, 8, 7], "k": 3}, output: [10, 10, 9] },
            { input: {"nums": [1, 2, 1, 0, 4, 2, 6], "k": 3}, output: [2, 2, 4, 4, 6] },
        ],
    },
    {
        num: 93,
        slug: "substring-with-concatenation-of-all-words",
        title: "Substring with Concatenation of All Words",
        difficulty: "HARD",
        topics: ["sliding-window", "hash-table"],
        inputFormat: "{ s: string, words: string[] }",
        outputFormat: "number[] (start indices)",
        constraints: "Words have equal length; 1 <= words.length <= 1000",
        hints: ["Slide by word length offsets.", "Count word frequencies in the window."],
        visibleCases: [
            { input: {"s": "barfoothefoobarman", "words": ["foo", "bar"]}, output: [0, 9], explanation: "Indices 0 and 9" },
            { input: {"s": "wordgoodgoodgoodbestword", "words": ["word", "good", "best", "word"]}, output: [] },
        ],
        hiddenCases: [
            { input: {"s": "abababab", "words": ["ab", "ba"]}, output: [] },
            { input: {"s": "lingmindraboofooowingdingbarrwingmonkeypoundcake", "words": ["fooo", "barr", "wing", "ding", "wing"]}, output: [13] },
            { input: {"s": "aaa", "words": ["a", "a"]}, output: [0, 1] },
            { input: {"s": "abababab", "words": ["ab", "ab"]}, output: [0, 2, 4] },
            { input: {"s": "barfoofoobarthefoobarman", "words": ["bar", "foo", "the"]}, output: [6, 9, 12] },
            { input: {"s": "a", "words": ["a"]}, output: [0] },
            { input: {"s": "abab", "words": ["ab", "ab"]}, output: [0] },
            { input: {"s": "foobarthefoobarman", "words": ["bar", "foo", "the"]}, output: [0, 3, 6] },
        ],
    },
    {
        num: 94,
        slug: "binary-tree-maximum-path-sum",
        title: "Binary Tree Maximum Path Sum",
        difficulty: "HARD",
        topics: ["trees", "dynamic-programming"],
        inputFormat: "{ root: (number | null)[] }",
        outputFormat: "number",
        constraints: "Tree has up to 10^4 nodes; node values in [-1000, 1000]",
        hints: ["DFS returns best downward gain from a node.", "Update global max with left+node+right."],
        visibleCases: [
            { input: {"root": [1, 2, 3]}, output: 6, explanation: "Path 2-1-3" },
            { input: {"root": [-10, 9, 20, null, null, 15, 7]}, output: 42 },
        ],
        hiddenCases: [
            { input: {"root": [2, -1]}, output: 2 },
            { input: {"root": [1, -2, -3, 1, 3, -2, null, -1]}, output: 3 },
            { input: {"root": [-3]}, output: -3 },
            { input: {"root": [5, 4, 8, 11, null, 13, 8, null, null, null, null, null, 4, 1]}, output: 45 },
            { input: {"root": [9, -3, null, null, 5]}, output: 11 },
            { input: {"root": [1, 2, null, 3]}, output: 6 },
            { input: {"root": [-2, 1]}, output: 1 },
            { input: {"root": [10, 2, 10, null, null, null, -10]}, output: 22 },
        ],
    },
    {
        num: 95,
        slug: "burst-balloons",
        title: "Burst Balloons",
        difficulty: "HARD",
        topics: ["dynamic-programming"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number",
        constraints: "1 <= nums.length <= 500; 0 <= nums[i] <= 100",
        hints: ["Pad ends with 1.", "DP on interval last balloon burst."],
        visibleCases: [
            { input: {"nums": [3, 1, 5, 8]}, output: 167, explanation: "167 coins" },
            { input: {"nums": [1, 5]}, output: 10 },
        ],
        hiddenCases: [
            { input: {"nums": [1, 5]}, output: 10 },
            { input: {"nums": [3, 1, 5, 8]}, output: 167 },
            { input: {"nums": [1, 3]}, output: 6 },
            { input: {"nums": [8, 3]}, output: 32 },
            { input: {"nums": [3, 5, 1]}, output: 25 },
            { input: {"nums": [2, 3]}, output: 9 },
            { input: {"nums": [6, 2, 8]}, output: 152 },
            { input: {"nums": [9, 76, 64, 21]}, output: 116718 },
        ],
    },
    {
        num: 96,
        slug: "count-of-smaller-numbers-after-self",
        title: "Count of Smaller Numbers After Self",
        difficulty: "HARD",
        topics: ["binary-search", "bit-manipulation"],
        inputFormat: "{ nums: number[] }",
        outputFormat: "number[]",
        constraints: "1 <= nums.length <= 10^5; -10^4 <= nums[i] <= 10^4",
        hints: ["Process from right to left.", "Insert into sorted structure and count smaller."],
        visibleCases: [
            { input: {"nums": [5, 2, 6, 1]}, output: [2, 1, 1, 0], explanation: "Counts to the right" },
            { input: {"nums": [-1]}, output: [0] },
        ],
        hiddenCases: [
            { input: {"nums": [-1]}, output: [0] },
            { input: {"nums": [1]}, output: [0] },
            { input: {"nums": [2, 0, 1]}, output: [2, 0, 0] },
            { input: {"nums": [3, 3, 3, 3]}, output: [0, 0, 0, 0] },
            { input: {"nums": [8, 1, 2, 1, 3]}, output: [4, 0, 1, 0, 0] },
            { input: {"nums": [1, 2, 1, 2, 1]}, output: [0, 2, 0, 1, 0] },
            { input: {"nums": [5, 2, 10, 1, 2, 9]}, output: [3, 1, 3, 0, 0, 0] },
            { input: {"nums": [0, 1, 2, 3]}, output: [0, 0, 0, 0] },
        ],
    },
    {
        num: 97,
        slug: "find-median-from-data-stream",
        title: "Find Median from Data Stream",
        difficulty: "HARD",
        topics: ["heap"],
        inputFormat: "{ ops: (\"addNum\"|\"findMedian\")[], args: number[][] }",
        outputFormat: "number[] (one per findMedian)",
        constraints: "At most 5*10^4 operations; values in [-10^5, 10^5]",
        hints: ["Keep max-heap of lower half and min-heap of upper half.", "Balance heap sizes after each add."],
        visibleCases: [
            { input: {"ops": ["addNum", "addNum", "findMedian", "addNum", "findMedian"], "args": [[1], [2], [], [3], []]}, output: [1.5, 2], explanation: "Medians 1.5 then 2" },
            { input: {"ops": ["addNum", "findMedian"], "args": [[5], []]}, output: [5] },
        ],
        hiddenCases: [
            { input: {"ops": ["addNum", "addNum", "findMedian"], "args": [[6], [10], []]}, output: [8] },
            { input: {"ops": ["addNum", "addNum", "addNum", "findMedian"], "args": [[1], [2], [3], []]}, output: [2] },
            { input: {"ops": ["addNum", "findMedian", "addNum", "findMedian"], "args": [[2], [], [3], []]}, output: [2, 2.5] },
            { input: {"ops": ["addNum", "addNum", "addNum", "addNum", "findMedian"], "args": [[1], [2], [3], [4], []]}, output: [2.5] },
            { input: {"ops": ["addNum", "addNum", "findMedian", "addNum", "findMedian"], "args": [[-1], [-2], [], [-3], []]}, output: [-1.5, -2] },
            { input: {"ops": ["addNum", "findMedian"], "args": [[100], []]}, output: [100] },
            { input: {"ops": ["addNum", "addNum", "addNum", "findMedian", "addNum", "findMedian"], "args": [[1], [1], [1], [], [1], []]}, output: [1, 1] },
            { input: {"ops": ["addNum", "addNum", "addNum", "addNum", "addNum", "findMedian"], "args": [[1], [2], [3], [4], [5], []]}, output: [3] },
        ],
    },
    {
        num: 98,
        slug: "word-break-ii",
        title: "Word Break II",
        difficulty: "HARD",
        topics: ["dynamic-programming", "backtracking", "trie"],
        inputFormat: "{ s: string, wordDict: string[] }",
        outputFormat: "string[]",
        constraints: "1 <= s.length <= 20; same word may be reused",
        hints: ["DFS with memo on start index.", "Only extend when prefix is a dictionary word."],
        visibleCases: [
            { input: {"s": "catsanddog", "wordDict": ["cat", "cats", "and", "sand", "dog"]}, output: ["cat sand dog", "cats and dog"], explanation: "Two sentences" },
            { input: {"s": "pineapplepenapple", "wordDict": ["apple", "pen", "applepen", "pine", "pineapple"]}, output: ["pine apple pen apple", "pine applepen apple", "pineapple pen apple"] },
        ],
        hiddenCases: [
            { input: {"s": "aaaaaaa", "wordDict": ["aaaa", "aaa"]}, output: ["aaa aaaa", "aaaa aaa"] },
            { input: {"s": "a", "wordDict": ["a"]}, output: ["a"] },
            { input: {"s": "ab", "wordDict": ["a", "b", "ab"]}, output: ["a b", "ab"] },
            { input: {"s": "catsanddog", "wordDict": ["cat", "sand", "dog"]}, output: ["cat sand dog"] },
            { input: {"s": "leetcode", "wordDict": ["leet", "code"]}, output: ["leet code"] },
            { input: {"s": "abcd", "wordDict": ["a", "abc", "b", "cd"]}, output: ["a b cd"] },
            { input: {"s": "catsandog", "wordDict": ["cats", "dog", "sand", "and", "cat"]}, output: [] },
            { input: {"s": "ab", "wordDict": ["a", "b"]}, output: ["a b"] },
        ],
    },
    {
        num: 99,
        slug: "palindrome-pairs",
        title: "Palindrome Pairs",
        difficulty: "HARD",
        topics: ["trie", "strings", "hash-table"],
        inputFormat: "{ words: string[] }",
        outputFormat: "number[][] (index pairs)",
        constraints: "1 <= words.length <= 5000; words are unique and non-empty",
        hints: ["Check splits where one part is palindrome.", "Use reverse word lookup."],
        visibleCases: [
            { input: {"words": ["abcd", "dcba", "lls", "s", "sssll"]}, output: [[0, 1], [1, 0], [2, 4], [3, 2]], explanation: "Palindrome concatenations" },
            { input: {"words": ["bat", "tab", "cat"]}, output: [[0, 1], [1, 0]] },
        ],
        hiddenCases: [
            { input: {"words": ["a", ""]}, output: [[0, 1], [1, 0]] },
            { input: {"words": ["a", "b", "c", "ab", "ac", "aa"]}, output: [[0, 5], [1, 3], [2, 4], [3, 0], [4, 0], [5, 0]] },
            { input: {"words": ["a", "abc", "aba", "ab"]}, output: [[3, 0], [3, 2]] },
            { input: {"words": ["", "a"]}, output: [[0, 1], [1, 0]] },
            { input: {"words": ["a", "b", "c", "d", "e", "f"]}, output: [] },
            { input: {"words": ["noon", "noon"]}, output: [[0, 1], [1, 0]] },
            { input: {"words": ["ll", "lls", "sssll"]}, output: [[0, 2], [1, 0], [1, 2]] },
            { input: {"words": ["a", "b", "aba", "ab"]}, output: [[1, 3], [3, 0], [3, 2]] },
        ],
    },
    {
        num: 100,
        slug: "minimum-cost-to-cut-a-stick",
        title: "Minimum Cost to Cut a Stick",
        difficulty: "HARD",
        topics: ["dynamic-programming", "math"],
        inputFormat: "{ n: number, cuts: number[] }",
        outputFormat: "number",
        constraints: "2 <= n <= 10^6; 1 <= cuts.length <= 100",
        hints: ["Sort cuts with endpoints 0 and n.", "Interval DP on cut positions."],
        visibleCases: [
            { input: {"n": 7, "cuts": [1, 3, 4, 5]}, output: 16, explanation: "Cost 16" },
            { input: {"n": 5, "cuts": [3, 1, 4]}, output: 10 },
        ],
        hiddenCases: [
            { input: {"n": 9, "cuts": [1, 3, 5, 8]}, output: 21 },
            { input: {"n": 10, "cuts": [2, 4, 6, 8]}, output: 24 },
            { input: {"n": 6, "cuts": [1, 2, 3, 4, 5]}, output: 16 },
            { input: {"n": 8, "cuts": [7, 5, 1, 3]}, output: 19 },
            { input: {"n": 100, "cuts": [25, 50, 75]}, output: 200 },
            { input: {"n": 3, "cuts": [1, 2]}, output: 5 },
            { input: {"n": 50, "cuts": [5, 10, 15, 20, 25, 30, 35, 40, 45]}, output: 170 },
            { input: {"n": 4, "cuts": [1, 3]}, output: 7 },
        ],
    }
];
