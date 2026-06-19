/**
 * Canonical problem statements for the OmniPrep dataset.
 * Each description uses a consistent structure:
 *   Overview → Given → Goal → Notes (when needed)
 */
export const PROBLEM_DESCRIPTIONS: Record<string, string> = {
    "two-sum": `Overview
You are given a list of integers and a target sum.

Given
- An integer array nums
- An integer target

Goal
Return the indices of two distinct elements in nums whose values add up to target. You may assume exactly one valid pair exists unless stated otherwise; if no pair exists, return an empty array.

Notes
- You may not use the same element twice.
- The answer may be returned in any order.`,

    "valid-parentheses": `Overview
You are given a string containing only bracket characters.

Given
- A string s consisting of '(', ')', '{', '}', '[' and ']'

Goal
Determine whether s is valid: every opening bracket must be closed by the same type of bracket in the correct order.

Notes
- An empty string is considered valid.`,

    "best-time-to-buy-and-sell-stock": `Overview
You are given daily stock prices and may complete at most one transaction.

Given
- An integer array prices where prices[i] is the stock price on day i

Goal
Return the maximum profit you can achieve from one purchase on one day and one sale on a later day. If no profit is possible, return 0.

Notes
- You must buy before you sell.`,

    "valid-palindrome": `Overview
You are given a string that may contain letters, digits, spaces, and punctuation.

Given
- A string s

Goal
Return true if s reads the same forward and backward after considering only alphanumeric characters and ignoring case. Otherwise, return false.`,

    "valid-anagram": `Overview
Two strings are anagrams if they contain the same characters with the same frequencies.

Given
- Two strings s and t

Goal
Return true if t is an anagram of s, and false otherwise.`,

    "climbing-stairs": `Overview
You are climbing a staircase with n steps. At each move you may take 1 or 2 steps.

Given
- An integer n representing the number of steps

Goal
Return the number of distinct ways to reach the top.`,

    "binary-search": `Overview
You are given a sorted array and a target value.

Given
- A sorted integer array nums in non-decreasing order
- An integer target

Goal
Return the index of target in nums if it is present. If target is not found, return -1.

Notes
- You must write an algorithm with O(log n) runtime.`,

    "contains-duplicate": `Overview
You are given an integer array and need to check for repeated values.

Given
- An integer array nums

Goal
Return true if any value appears at least twice in the array, and false if every element is distinct.`,

    "isomorphic-strings": `Overview
Two strings are isomorphic if the characters in one string can be replaced to get the other while preserving order.

Given
- Two strings s and t of equal length

Goal
Return true if s and t are isomorphic, meaning there is a one-to-one mapping of characters from s to t. Otherwise, return false.`,

    "ransom-note": `Overview
A ransom note is built from letters taken from a magazine.

Given
- Two strings ransomNote and magazine

Goal
Return true if ransomNote can be constructed using letters from magazine, where each letter in magazine may be used only once. Otherwise, return false.`,

    "first-bad-version": `Overview
You have n versions labeled from 1 to n, and all versions after the first bad one are also bad.

Given
- An integer n
- Access to a function isBadVersion(version) that returns true for bad versions

Goal
Return the version number of the first bad version.

Notes
- Minimize the number of calls to isBadVersion.`,

    "sqrtx": `Overview
You need the integer square root of a non-negative integer.

Given
- A non-negative integer x

Goal
Return the largest integer y such that y * y <= x. Do not use built-in exponent functions.`,

    "find-peak-element": `Overview
A peak element is strictly greater than its neighbors.

Given
- An integer array nums where nums[i] != nums[i + 1] for all valid i

Goal
Return the index of any peak element.

Notes
- You may assume nums[-1] = nums[n] = -infinity.
- You must write an algorithm that runs in O(log n) time.`,

    "search-insert-position": `Overview
You are given a sorted array and a target value.

Given
- A sorted integer array nums in non-decreasing order
- An integer target

Goal
If target exists in nums, return its index. Otherwise, return the index where it would be inserted to keep the array sorted.`,

    "longest-common-prefix": `Overview
You are given a list of strings and need their shared starting substring.

Given
- An array of strings strs

Goal
Return the longest common prefix string shared by all strings in strs. If there is no common prefix, return an empty string.`,

    "implement-strstr": `Overview
You need to find the first occurrence of a needle inside a haystack.

Given
- Two strings haystack and needle

Goal
Return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.`,

    "reverse-words-in-a-string-iii": `Overview
You are given a sentence of words separated by spaces.

Given
- A string s

Goal
Reverse the characters in each word while preserving the original word order and whitespace positions. Leading and trailing spaces should not appear unless present in the input.`,

    "majority-element": `Overview
You are given an array where one element appears more than half the time.

Given
- An integer array nums of length n

Goal
Return the element that appears more than floor(n / 2) times.

Notes
- You may assume the majority element always exists.`,

    "move-zeroes": `Overview
You are given an integer array containing zeros and non-zero values.

Given
- An integer array nums

Goal
Move all zeros to the end of nums while maintaining the relative order of the non-zero elements. Perform this in-place.`,

    "remove-duplicates-from-sorted-array": `Overview
You are given a sorted array that may contain duplicate values.

Given
- A sorted integer array nums in non-decreasing order

Goal
Remove duplicates in-place so each unique value appears only once. Return k, the number of unique elements, where the first k positions of nums contain those unique values in order.`,

    "merge-sorted-array": `Overview
You are merging two sorted arrays into the first array, which has enough trailing space.

Given
- Two sorted integer arrays nums1 and nums2
- Integers m and n representing the number of elements initialized in nums1 and nums2

Goal
Merge nums2 into nums1 as one sorted array in non-decreasing order. The merge must be done in-place within nums1.`,

    "roman-to-integer": `Overview
Roman numerals use letters to represent values and are usually written largest to smallest from left to right.

Given
- A string s representing a valid Roman numeral

Goal
Return the integer value of the Roman numeral.`,

    "single-number": `Overview
Every element in the array appears twice except for one.

Given
- An integer array nums where exactly one element appears once and every other element appears twice

Goal
Return the element that appears only once.`,

    "missing-number": `Overview
An array contains n distinct numbers taken from the range 0 to n.

Given
- An integer array nums containing n distinct numbers in the range [0, n]

Goal
Return the one number in the range [0, n] that is missing from the array.`,

    "fibonacci-number": `Overview
The Fibonacci sequence is defined recursively.

Given
- An integer n

Goal
Return F(n), where F(0) = 0, F(1) = 1, and F(n) = F(n - 1) + F(n - 2) for n > 1.`,

    "pascals-triangle": `Overview
Pascal's triangle is built row by row from sums of adjacent values.

Given
- An integer numRows

Goal
Return the first numRows rows of Pascal's triangle as a list of rows, where each row is a list of integers.`,

    "flood-fill": `Overview
You are given an image represented as a grid and a starting pixel.

Given
- An integer matrix image representing pixel values
- Integers sr and sc for the starting row and column
- An integer color representing the new color

Goal
Perform a flood fill starting from image[sr][sc]: replace the starting color and all connected pixels of the same original color with color. Return the modified image.

Notes
- Two pixels are connected if they share an edge and have the same original color.`,

    "same-tree": `Overview
You are given the roots of two binary trees.

Given
- The roots of two binary trees p and q

Goal
Return true if the two trees are structurally identical and every corresponding node has the same value. Otherwise, return false.`,

    "symmetric-tree": `Overview
You are given the root of a binary tree.

Given
- The root of a binary tree

Goal
Return true if the tree is symmetric around its center (the left subtree is a mirror of the right subtree). Otherwise, return false.`,

    "maximum-depth-of-binary-tree": `Overview
You are given the root of a binary tree.

Given
- The root of a binary tree

Goal
Return the maximum depth of the tree, defined as the number of nodes along the longest path from the root down to the farthest leaf.`,

    "diameter-of-binary-tree": `Overview
The diameter of a binary tree is the length of the longest path between any two nodes in the tree.

Given
- The root of a binary tree

Goal
Return the diameter of the tree. The path may or may not pass through the root.

Notes
- The length of a path is measured by the number of edges between nodes.`,

    "linked-list-cycle": `Overview
You are given the head of a singly linked list.

Given
- The head of a linked list

Goal
Return true if the linked list contains a cycle, and false otherwise.`,

    "palindrome-linked-list": `Overview
You are given the head of a singly linked list.

Given
- The head of a singly linked list

Goal
Return true if the sequence of node values forms a palindrome, and false otherwise.`,

    "min-stack": `Overview
Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.

Given
- A sequence of operations on a MinStack data structure

Goal
Implement MinStack so that push, pop, top, and getMin each work correctly. getMin must return the smallest element currently in the stack.`,

    "implement-queue-using-stacks": `Overview
Design a first-in-first-out queue using only stack operations.

Given
- A sequence of operations on a MyQueue data structure

Goal
Implement a queue that supports push, pop, peek, and empty using two stacks (or equivalent stack-based logic).`,

    "3sum": `Overview
You are given an integer array and need unique triplets that sum to zero.

Given
- An integer array nums

Goal
Return all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0.

Notes
- The solution set must not contain duplicate triplets.`,

    "longest-substring-without-repeating-characters": `Overview
You are given a string and need the longest contiguous substring with all unique characters.

Given
- A string s

Goal
Return the length of the longest substring without repeating characters.`,

    "container-with-most-water": `Overview
You are given vertical lines on the x-axis forming the sides of containers.

Given
- An integer array height where height[i] is the height of the i-th line

Goal
Return the maximum amount of water a container can store. A container is formed by choosing two lines and using the shorter height as the limiting side.`,

    "number-of-islands": `Overview
You are given a grid map of '1's (land) and '0's (water).

Given
- A 2D grid grid of characters '0' and '1'

Goal
Return the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.

Notes
- You may assume all four edges of the grid are surrounded by water.`,

    "coin-change": `Overview
You are given coin denominations and a target amount.

Given
- An integer array coins representing coin denominations
- An integer amount

Goal
Return the fewest number of coins needed to make up amount. If the amount cannot be made up, return -1.

Notes
- You may use each coin denomination an unlimited number of times.`,

    "top-k-frequent-elements": `Overview
You are given an integer array and need the most common values.

Given
- An integer array nums
- An integer k

Goal
Return the k most frequent elements. The answer may be returned in any order.`,

    "kth-largest-element-in-an-array": `Overview
You are given an unsorted integer array.

Given
- An integer array nums
- An integer k

Goal
Return the k-th largest element in the array.

Notes
- This is the k-th largest in sorted order, not the k-th distinct element.`,

    "product-of-array-except-self": `Overview
You are given an integer array and must compute products without division.

Given
- An integer array nums

Goal
Return an array answer such that answer[i] is the product of all elements of nums except nums[i].

Notes
- You must solve it without using division and ideally in O(n) time.
- The product of any prefix or suffix fits in a 32-bit integer.`,

    "set-matrix-zeroes": `Overview
You are given an m x n integer matrix.

Given
- An integer matrix matrix

Goal
If an element is 0, set its entire row and column to 0. Perform this in-place using constant extra space if possible.`,

    "group-anagrams": `Overview
Anagrams are words formed by rearranging the letters of another word.

Given
- An array of strings strs

Goal
Group the anagrams together. The answer may be returned in any order, and the strings within each group may also be in any order.`,

    "permutations": `Overview
You are given a collection of distinct integers.

Given
- An integer array nums of distinct integers

Goal
Return all possible permutations of nums. You may return the answer in any order.`,

    "combination-sum": `Overview
You are given candidate numbers and a target sum.

Given
- An array of distinct integers candidates
- An integer target

Goal
Return all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen unlimited times.

Notes
- The solution set must not contain duplicate combinations.`,

    "subsets": `Overview
You are given a set of distinct integers.

Given
- An integer array nums of unique elements

Goal
Return all possible subsets (the power set). The solution set must not contain duplicate subsets.`,

    "word-search": `Overview
You are given a grid of characters and a target word.

Given
- A 2D board of characters
- A string word

Goal
Return true if word exists in the board. Words are formed by sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once per word.`,

    "decode-ways": `Overview
A message containing letters A-Z can be encoded to numbers using the mapping A=1, B=2, ..., Z=26.

Given
- A string s containing only digits

Goal
Return the number of ways to decode s. If decoding is impossible, return 0.

Notes
- A leading zero in any decoded segment makes the entire string invalid.`,

    "house-robber": `Overview
You are a robber planning to steal from houses along a street.

Given
- An integer array nums where nums[i] is the amount of money in the i-th house

Goal
Return the maximum amount you can rob without robbing two directly adjacent houses.`,

    "jump-game": `Overview
You start at the first index of an array where each element tells you the maximum jump length from that position.

Given
- An integer array nums

Goal
Return true if you can reach the last index starting from index 0, and false otherwise.`,

    "partition-labels": `Overview
You are given a string of lowercase letters.

Given
- A string s

Goal
Partition s into as many parts as possible so that each letter appears in at most one part. Return a list of the sizes of these parts.`,

    "daily-temperatures": `Overview
You are given daily temperatures and want to know how long to wait for a warmer day.

Given
- An integer array temperatures where temperatures[i] is the temperature on day i

Goal
Return an array answer where answer[i] is the number of days you must wait after day i for a warmer temperature. If no future day is warmer, answer[i] is 0.`,

    "evaluate-reverse-polish-notation": `Overview
Reverse Polish notation is a postfix expression format where operators follow their operands.

Given
- An array of strings tokens representing an arithmetic expression in Reverse Polish notation

Goal
Evaluate the expression and return the result as an integer. Valid operators are +, -, *, and /. Division truncates toward zero.`,

    "binary-tree-level-order-traversal": `Overview
You are given the root of a binary tree.

Given
- The root of a binary tree

Goal
Return the level-order traversal of its node values (left to right, level by level).`,

    "binary-tree-right-side-view": `Overview
When looking at a binary tree from the right side, some nodes are visible and others are hidden.

Given
- The root of a binary tree

Goal
Return the values of the nodes you can see ordered from top to bottom.`,

    "validate-binary-search-tree": `Overview
A valid binary search tree has ordering constraints on every subtree.

Given
- The root of a binary tree

Goal
Return true if the tree is a valid binary search tree, where for every node all values in the left subtree are less than the node and all values in the right subtree are greater than the node.`,

    "lowest-common-ancestor-of-a-binary-tree": `Overview
The lowest common ancestor (LCA) of two nodes is the deepest node that has both nodes as descendants.

Given
- The root of a binary tree
- Two nodes p and q that exist in the tree

Goal
Return the lowest common ancestor of p and q.`,

    "clone-graph": `Overview
You are given a node in a connected undirected graph where each node has a value and a list of neighbors.

Given
- A reference to a node in a connected undirected graph

Goal
Return a deep copy (clone) of the graph. Each cloned node must have the same value and the same neighbor relationships as the original.`,

    "course-schedule": `Overview
There are numCourses courses labeled from 0 to numCourses - 1, and a list of prerequisite pairs.

Given
- An integer numCourses
- An array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a

Goal
Return true if you can finish all courses (that is, the prerequisite graph has no cycle), and false otherwise.`,

    "rotting-oranges": `Overview
You are given a grid where each cell is empty, a fresh orange, or a rotten orange.

Given
- A grid where 0 is empty, 1 is fresh, and 2 is rotten

Goal
Return the minimum number of minutes until no fresh orange remains. If it is impossible to rot every orange, return -1.

Notes
- Each minute, any fresh orange adjacent (4-directionally) to a rotten orange becomes rotten.`,

    "find-minimum-in-rotated-sorted-array": `Overview
You are given a sorted array that has been rotated at an unknown pivot.

Given
- An integer array nums sorted in ascending order and then rotated

Goal
Return the minimum element of the array.

Notes
- All elements are distinct.
- You must run in O(log n) time.`,

    "search-in-rotated-sorted-array": `Overview
You are given a rotated sorted array and a target value.

Given
- An integer array nums sorted in ascending order and then rotated
- An integer target

Goal
Return the index of target if it is in nums, or -1 if it is not.

Notes
- All elements in nums are distinct.
- You must run in O(log n) time.`,

    "find-first-and-last-position-of-element-in-sorted-array": `Overview
You are given a sorted array that may contain duplicates.

Given
- A sorted integer array nums in non-decreasing order
- An integer target

Goal
Return the starting and ending position of target in nums. If target is not found, return [-1, -1].

Notes
- You must write an algorithm with O(log n) runtime.`,

    "longest-consecutive-sequence": `Overview
You are given an unsorted array of integers.

Given
- An integer array nums

Goal
Return the length of the longest consecutive elements sequence. The sequence elements do not need to be adjacent in the original array.`,

    "minimum-size-subarray-sum": `Overview
You are given an array of positive integers and a target sum.

Given
- An integer array nums of positive integers
- An integer target

Goal
Return the minimal length of a contiguous subarray whose sum is greater than or equal to target. If there is no such subarray, return 0.`,

    "minimum-window-substring-lite": `Overview
You are given two strings s and t.

Given
- A string s
- A string t

Goal
Return the shortest substring of s that contains all characters of t (including multiplicity). If no such window exists, return an empty string.

Notes
- This is a simplified variant of the classic minimum window substring problem.`,

    "palindromic-substrings": `Overview
A palindrome reads the same forward and backward.

Given
- A string s

Goal
Return the number of palindromic substrings in s. Substrings with different start or end indices are counted separately even if their contents are the same.`,

    "longest-palindromic-substring": `Overview
A palindrome reads the same forward and backward.

Given
- A string s

Goal
Return the longest palindromic substring in s. If multiple answers exist, you may return any one of them.`,

    "sort-colors": `Overview
You are given an array with values 0, 1, and 2 representing red, white, and blue.

Given
- An integer array nums where each element is 0, 1, or 2

Goal
Sort nums in-place so that all 0s come first, then all 1s, then all 2s. Do this in one pass using constant extra space if possible.`,

    "spiral-matrix": `Overview
You are given an m x n matrix.

Given
- A matrix matrix

Goal
Return all elements of the matrix in spiral order, starting from the top-left corner and moving right, down, left, and up.`,

    "rotate-image": `Overview
You are given an n x n 2D matrix representing an image.

Given
- An n x n integer matrix matrix

Goal
Rotate the image 90 degrees clockwise in-place.`,

    "find-all-anagrams-in-a-string": `Overview
An anagram is a permutation of another string with the same characters.

Given
- Two strings s and p

Goal
Return a list of all start indices of anagrams of p in s. The answer may be returned in any order.`,

    "task-scheduler": `Overview
You are given a list of tasks labeled A to Z and a cooldown period n.

Given
- A character array tasks representing tasks to execute
- An integer n representing the cooldown between identical tasks

Goal
Return the least number of time units needed to finish all tasks. The CPU can execute one task per unit or remain idle.`,

    "integer-to-roman": `Overview
Roman numerals are built from symbols with fixed values.

Given
- An integer num in the range [1, 3999]

Goal
Return the Roman numeral representation of num using the standard subtractive notation.`,

    "powx-n": `Overview
You need to compute a real power efficiently.

Given
- A double x
- An integer n

Goal
Return x raised to the power n. Implement this in O(log n) time.

Notes
- n may be negative, in which case you compute 1 / x^|n|.`,

    "my-calendar-i": `Overview
Design a calendar that can book time intervals without overlap.

Given
- A sequence of book operations, each with start and end times

Goal
Implement MyCalendar so that book(start, end) adds the half-open interval [start, end) if it does not overlap any existing booking, and returns whether the booking succeeded.`,

    "design-hashmap": `Overview
Design a basic hash map without using built-in hash map libraries.

Given
- A sequence of put, get, and remove operations

Goal
Implement a MyHashMap that supports inserting a key-value pair, returning the value for a key, and removing a key.`,

    "design-add-and-search-words-data-structure": `Overview
Design a data structure for storing words that supports exact and wildcard search.

Given
- addWord operations for strings
- search operations where '.' matches any single letter

Goal
Implement WordDictionary so addWord adds a word and search returns true if the word (or a matching wildcard pattern) exists in the structure.`,

    "trapping-rain-water": `Overview
Elevation bars are placed side by side, and rain is trapped between them.

Given
- An integer array height representing bar heights

Goal
Return how much water can be trapped after raining.`,

    "median-of-two-sorted-arrays": `Overview
You are given two sorted arrays.

Given
- Two sorted integer arrays nums1 and nums2

Goal
Return the median of the two sorted arrays combined.

Notes
- The overall run time complexity should be O(log (m + n)).`,

    "minimum-window-substring": `Overview
You are given two strings s and t.

Given
- A string s
- A string t

Goal
Return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If no such substring exists, return an empty string.`,

    "merge-k-sorted-lists": `Overview
You are given k linked lists, each sorted in ascending order.

Given
- An array lists of the heads of k sorted linked lists

Goal
Merge all lists into one sorted linked list and return its head.`,

    "largest-rectangle-in-histogram": `Overview
You are given the heights of bars in a histogram.

Given
- An integer array heights where heights[i] is the height of the i-th bar

Goal
Return the area of the largest rectangle in the histogram. Each bar has width 1.`,

    "word-ladder": `Overview
You are transforming a begin word into an end word one letter at a time.

Given
- Two words beginWord and endWord
- A word list wordList

Goal
Return the length of the shortest transformation sequence from beginWord to endWord, changing only one letter at a time and using only words from wordList. If no sequence exists, return 0.`,

    "edit-distance": `Overview
You are given two strings and allowed three operations: insert, delete, or replace a character.

Given
- Two strings word1 and word2

Goal
Return the minimum number of operations required to convert word1 into word2.`,

    "n-queens": `Overview
The n-queens puzzle places n queens on an n x n board so no two queens attack each other.

Given
- An integer n

Goal
Return all distinct solutions to the n-queens puzzle. Each solution is a board configuration represented as strings, where 'Q' marks a queen and '.' marks an empty cell.`,

    "regular-expression-matching": `Overview
You are matching a string against a pattern that may include '.' and '*'.

Given
- A string s
- A pattern p

Goal
Return true if p matches all of s. '.' matches any single character. '*' matches zero or more of the preceding element.

Notes
- The matching must cover the entire string s.`,

    "serialize-and-deserialize-binary-tree": `Overview
Design an algorithm to convert a binary tree to a string and back.

Given
- A binary tree to serialize
- A serialized string to deserialize

Goal
Implement Codec so serialize converts a tree to a string and deserialize reconstructs the original tree structure from that string.`,

    "maximal-rectangle": `Overview
You are given a binary matrix of '0' and '1' characters.

Given
- A rows x cols binary matrix matrix

Goal
Return the area of the largest rectangle containing only '1's.`,

    "sliding-window-maximum": `Overview
You are given an array and a window size k.

Given
- An integer array nums
- An integer k

Goal
Return an array containing the maximum value in each sliding window of size k as it moves from left to right.`,

    "substring-with-concatenation-of-all-words": `Overview
You are given a string and a list of words of equal length.

Given
- A string s
- An array of strings words

Goal
Return all starting indices in s where s contains a concatenation of each word in words exactly once and without intervening characters.`,

    "binary-tree-maximum-path-sum": `Overview
A path in a binary tree is any sequence of nodes where each pair of adjacent nodes has an edge.

Given
- The root of a binary tree

Goal
Return the maximum path sum of any non-empty path. A path may start and end at any nodes and does not need to pass through the root.`,

    "burst-balloons": `Overview
You are given n balloons indexed from 0 to n - 1, each with a number on it.

Given
- An integer array nums where nums[i] represents the number on balloon i

Goal
Return the maximum coins you can collect by bursting all balloons. When you burst balloon i, you earn nums[i - 1] * nums[i] * nums[i + 1] coins, using 1 for out-of-bounds neighbors.`,

    "count-of-smaller-numbers-after-self": `Overview
For each position in an array, you want to know how many later elements are smaller.

Given
- An integer array nums

Goal
Return an array counts where counts[i] is the number of elements to the right of i that are smaller than nums[i].`,

    "find-median-from-data-stream": `Overview
Design a data structure that supports adding numbers and finding the median efficiently.

Given
- A stream of integers added over time

Goal
Implement MedianFinder so addNum inserts a number and findMedian returns the median of all elements seen so far.`,

    "word-break-ii": `Overview
You are given a string and a dictionary of words.

Given
- A string s
- A list of strings wordDict

Goal
Return all sentences formed by adding spaces in s such that each word is in wordDict. The same word may be reused. You may return the answer in any order.`,

    "palindrome-pairs": `Overview
You are given a list of unique non-empty words.

Given
- An array of unique strings words

Goal
Return all pairs of indices (i, j) such that the concatenation of words[i] + words[j] is a palindrome.`,

    "minimum-cost-to-cut-a-stick": `Overview
You have a stick of length n and a list of positions where cuts must be made.

Given
- An integer n representing stick length
- An integer array cuts listing required cut positions

Goal
Return the minimum total cost to perform all cuts. The cost of a cut equals the current length of the stick being cut.

Notes
- The order of cuts can be chosen to minimize total cost.
- After each cut, the stick splits into independent pieces.`,
};
