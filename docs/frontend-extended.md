# 前端面试知识扩展补充

## 八、面试高频算法与数据结构（续）

### 1️⃣ 排序算法（续）

```javascript
// 堆排序（续）
function heapify(arr, i, heapSize) {
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  let largest = i;
  
  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }
  
  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }
  
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, largest, heapSize);
  }
}

// 冒泡排序
function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // 优化：如果没有交换，说明已排序
  }
  return arr;
}

// 插入排序
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    
    arr[j + 1] = key;
  }
  return arr;
}

// 选择排序
function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
}
```

#### 搜索算法

```javascript
// 二分搜索
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// 深度优先搜索 (DFS)
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  
  for (const neighbor of graph[start] || []) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// 广度优先搜索 (BFS)
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    if (!visited.has(node)) {
      visited.add(node);
      console.log(node);
      
      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
}
```

---

### 2️⃣ 数据结构实现

#### 栈 (Stack)

```javascript
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.items.pop();
  }
  
  peek() {
    if (this.isEmpty()) {
      throw new Error('Stack is empty');
    }
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}

// 使用栈实现括号匹配
function isValidParentheses(s) {
  const stack = new Stack();
  const pairs = { '(': ')', '[': ']', '{': '}' };
  
  for (const char of s) {
    if (char in pairs) {
      stack.push(char);
    } else if (Object.values(pairs).includes(char)) {
      if (stack.isEmpty() || pairs[stack.pop()] !== char) {
        return false;
      }
    }
  }
  
  return stack.isEmpty();
}
```

#### 队列 (Queue)

```javascript
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item) {
    this.items.push(item);
  }
  
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    return this.items.shift();
  }
  
  front() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// 循环队列
class CircularQueue {
  constructor(capacity) {
    this.capacity = capacity;
    this.items = new Array(capacity);
    this.front = 0;
    this.rear = 0;
    this.size = 0;
  }
  
  enqueue(item) {
    if (this.isFull()) {
      throw new Error('Queue is full');
    }
    
    this.items[this.rear] = item;
    this.rear = (this.rear + 1) % this.capacity;
    this.size++;
  }
  
  dequeue() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }
    
    const item = this.items[this.front];
    this.items[this.front] = undefined;
    this.front = (this.front + 1) % this.capacity;
    this.size--;
    
    return item;
  }
  
  isEmpty() {
    return this.size === 0;
  }
  
  isFull() {
    return this.size === this.capacity;
  }
}
```

#### 链表 (Linked List)

```javascript
class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }
  
  append(val) {
    const newNode = new ListNode(val);
    
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    
    this.size++;
  }
  
  prepend(val) {
    const newNode = new ListNode(val, this.head);
    this.head = newNode;
    this.size++;
  }
  
  insert(index, val) {
    if (index < 0 || index > this.size) {
      throw new Error('Index out of bounds');
    }
    
    if (index === 0) {
      this.prepend(val);
      return;
    }
    
    const newNode = new ListNode(val);
    let current = this.head;
    
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }
    
    newNode.next = current.next;
    current.next = newNode;
    this.size++;
  }
  
  remove(index) {
    if (index < 0 || index >= this.size) {
      throw new Error('Index out of bounds');
    }
    
    if (index === 0) {
      this.head = this.head.next;
      this.size--;
      return;
    }
    
    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
      current = current.next;
    }
    
    current.next = current.next.next;
    this.size--;
  }
  
  find(val) {
    let current = this.head;
    let index = 0;
    
    while (current) {
      if (current.val === val) {
        return index;
      }
      current = current.next;
      index++;
    }
    
    return -1;
  }
  
  toArray() {
    const result = [];
    let current = this.head;
    
    while (current) {
      result.push(current.val);
      current = current.next;
    }
    
    return result;
  }
}

// 链表常见操作
// 反转链表
function reverseLinkedList(head) {
  let prev = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}

// 检测环
function hasCycle(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      return true;
    }
  }
  
  return false;
}

// 合并两个有序链表
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let current = dummy;
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }
  
  current.next = l1 || l2;
  return dummy.next;
}
```

#### 二叉树 (Binary Tree)

```javascript
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

class BinaryTree {
  constructor() {
    this.root = null;
  }
  
  // 前序遍历 (根-左-右)
  preorderTraversal(node = this.root, result = []) {
    if (node) {
      result.push(node.val);
      this.preorderTraversal(node.left, result);
      this.preorderTraversal(node.right, result);
    }
    return result;
  }
  
  // 中序遍历 (左-根-右)
  inorderTraversal(node = this.root, result = []) {
    if (node) {
      this.inorderTraversal(node.left, result);
      result.push(node.val);
      this.inorderTraversal(node.right, result);
    }
    return result;
  }
  
  // 后序遍历 (左-右-根)
  postorderTraversal(node = this.root, result = []) {
    if (node) {
      this.postorderTraversal(node.left, result);
      this.postorderTraversal(node.right, result);
      result.push(node.val);
    }
    return result;
  }
  
  // 层序遍历 (广度优先)
  levelOrderTraversal() {
    if (!this.root) return [];
    
    const result = [];
    const queue = [this.root];
    
    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevel = [];
      
      for (let i = 0; i < levelSize; i++) {
        const node = queue.shift();
        currentLevel.push(node.val);
        
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      
      result.push(currentLevel);
    }
    
    return result;
  }
  
  // 计算最大深度
  maxDepth(node = this.root) {
    if (!node) return 0;
    
    const leftDepth = this.maxDepth(node.left);
    const rightDepth = this.maxDepth(node.right);
    
    return Math.max(leftDepth, rightDepth) + 1;
  }
  
  // 判断是否为平衡二叉树
  isBalanced(node = this.root) {
    if (!node) return true;
    
    const leftHeight = this.getHeight(node.left);
    const rightHeight = this.getHeight(node.right);
    
    return Math.abs(leftHeight - rightHeight) <= 1 &&
           this.isBalanced(node.left) &&
           this.isBalanced(node.right);
  }
  
  getHeight(node) {
    if (!node) return 0;
    return Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
  }
}

// 二叉搜索树
class BST extends BinaryTree {
  insert(val) {
    this.root = this._insertNode(this.root, val);
  }
  
  _insertNode(node, val) {
    if (!node) {
      return new TreeNode(val);
    }
    
    if (val < node.val) {
      node.left = this._insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this._insertNode(node.right, val);
    }
    
    return node;
  }
  
  search(val) {
    return this._searchNode(this.root, val);
  }
  
  _searchNode(node, val) {
    if (!node || node.val === val) {
      return node;
    }
    
    if (val < node.val) {
      return this._searchNode(node.left, val);
    } else {
      return this._searchNode(node.right, val);
    }
  }
  
  delete(val) {
    this.root = this._deleteNode(this.root, val);
  }
  
  _deleteNode(node, val) {
    if (!node) return null;
    
    if (val < node.val) {
      node.left = this._deleteNode(node.left, val);
    } else if (val > node.val) {
      node.right = this._deleteNode(node.right, val);
    } else {
      // 找到要删除的节点
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      
      // 有两个子节点，找到右子树的最小值
      const minNode = this._findMin(node.right);
      node.val = minNode.val;
      node.right = this._deleteNode(node.right, minNode.val);
    }
    
    return node;
  }
  
  _findMin(node) {
    while (node.left) {
      node = node.left;
    }
    return node;
  }
}
```

---

### 3️⃣ 动态规划经典题目

```javascript
// 斐波那契数列
function fibonacci(n) {
  if (n <= 1) return n;
  
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 空间优化版本
function fibonacciOptimized(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  
  return curr;
}

// 爬楼梯问题
function climbStairs(n) {
  if (n <= 2) return n;
  
  let prev = 1, curr = 2;
  for (let i = 3; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  
  return curr;
}

// 最长公共子序列
function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// 背包问题
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }
  
  return dp[n][capacity];
}

// 最长递增子序列
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  const dp = Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}

// 编辑距离
function editDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // 初始化边界
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }
  
  return dp[m][n];
}
```

---

### 4️⃣ 字符串算法

```javascript
// KMP 字符串匹配算法
function kmpSearch(text, pattern) {
  const lps = computeLPS(pattern);
  const result = [];
  let i = 0; // text 的索引
  let j = 0; // pattern 的索引
  
  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i++;
      j++;
    }
    
    if (j === pattern.length) {
      result.push(i - j);
      j = lps[j - 1];
    } else if (i < text.length && text[i] !== pattern[j]) {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }
  
  return result;
}

function computeLPS(pattern) {
  const lps = Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }
  
  return lps;
}

// 字符串反转
function reverseString(s) {
  const arr = s.split('');
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  
  return arr.join('');
}

// 判断回文串
function isPalindrome(s) {
  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = cleaned.length - 1;
  
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}

// 最长回文子串
function longestPalindrome(s) {
  if (!s || s.length < 2) return s;
  
  let start = 0;
  let maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLen = right - left + 1;
      if (currentLen > maxLen) {
        start = left;
        maxLen = currentLen;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);     // 奇数长度回文
    expandAroundCenter(i, i + 1); // 偶数长度回文
  }
  
  return s.substring(start, start + maxLen);
}

// 字符串压缩
function compressString(s) {
  if (!s) return s;
  
  let compressed = '';
  let count = 1;
  
  for (let i = 1; i <= s.length; i++) {
    if (i < s.length && s[i] === s[i - 1]) {
      count++;
    } else {
      compressed += s[i - 1] + count;
      count = 1;
    }
  }
  
  return compressed.length < s.length ? compressed : s;
}
```

---

## 九、CSS 深度解析

### 1️⃣ CSS 选择器详解

#### 选择器优先级

```css
/* 优先级计算：内联样式(1000) > ID(100) > 类/属性/伪类(10) > 元素/伪元素(1) */

/* ID 选择器 - 优先级 100 */
#header { color: red; }

/* 类选择器 - 优先级 10 */
.nav-item { color: blue; }

/* 属性选择器 - 优先级 10 */
[data-active="true"] { color: green; }

/* 伪类选择器 - 优先级 10 */
:hover { color: yellow; }

/* 元素选择器 - 优先级 1 */
div { color: black; }

/* 组合选择器 - 优先级累加 */
#header .nav-item:hover { /* 100 + 10 + 10 = 120 */ }

/* !important - 最高优先级 */
.important { color: purple !important; }
```

#### 高级选择器

```css
/* 子选择器 */
.parent > .child { /* 直接子元素 */ }

/* 后代选择器 */
.ancestor .descendant { /* 所有后代元素 */ }

/* 相邻兄弟选择器 */
.element + .sibling { /* 紧邻的下一个兄弟元素 */ }

/* 通用兄弟选择器 */
.element ~ .sibling { /* 所有后续兄弟元素 */ }

/* 属性选择器 */
[attr] { /* 有 attr 属性 */ }
[attr="value"] { /* attr 属性值等于 value */ }
[attr~="value"] { /* attr 属性值包含 value 单词 */ }
[attr|="value"] { /* attr 属性值以 value- 开头 */ }
[attr^="value"] { /* attr 属性值以 value 开头 */ }
[attr$="value"] { /* attr 属性值以 value 结尾 */ }
[attr*="value"] { /* attr 属性值包含 value */ }

/* 伪类选择器 */
:first-child { /* 第一个子元素 */ }
:last-child { /* 最后一个子元素 */ }
:nth-child(n) { /* 第 n 个子元素 */ }
:nth-child(odd) { /* 奇数位子元素 */ }
:nth-child(even) { /* 偶数位子元素 */ }
:nth-child(2n+1) { /* 自定义公式 */ }

:first-of-type { /* 同类型第一个元素 */ }
:last-of-type { /* 同类型最后一个元素 */ }
:nth-of-type(n) { /* 同类型第 n 个元素 */ }

:not(.class) { /* 不匹配指定选择器 */ }
:empty { /* 空元素 */ }
:target { /* 当前锚点目标 */ }

/* 伪元素选择器 */
::before { /* 元素前插入内容 */ }
::after { /* 元素后插入内容 */ }
::first-line { /* 第一行 */ }
::first-letter { /* 第一个字母 */ }
::selection { /* 选中的文本 */ }
```

---

### 2️⃣ 布局系统

#### Flexbox 详解

```css
/* 容器属性 */
.flex-container {
  display: flex; /* 或 inline-flex */
  
  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;
  
  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;
  
  /* 简写 */
  flex-flow: row wrap;
  
  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
  
  /* 交叉轴对齐 */
  align-items: stretch | flex-start | flex-end | center | baseline;
  
  /* 多行对齐 */
  align-content: stretch | flex-start | flex-end | center | space-between | space-around;
  
  /* 间距 */
  gap: 10px; /* 或 row-gap, column-gap */
}

/* 项目属性 */
.flex-item {
  /* 排序 */
  order: 0; /* 数值越小越靠前 */
  
  /* 放大比例 */
  flex-grow: 0; /* 默认不放大 */
  
  /* 缩小比例 */
  flex-shrink: 1; /* 默认缩小 */
  
  /* 基础大小 */
  flex-basis: auto; /* 或具体值 */
  
  /* 简写 */
  flex: 1; /* flex-grow flex-shrink flex-basis */
  flex: 1 1 auto; /* 完整写法 */
  
  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}

/* 常用布局模式 */
/* 水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 等分布局 */
.equal-columns .item {
  flex: 1;
}

/* 固定侧边栏 */
.sidebar {
  flex: 0 0 200px; /* 不放大不缩小，固定200px */
}
.main {
  flex: 1; /* 占据剩余空间 */
}
```

#### Grid 布局详解

```css
/* 容器属性 */
.grid-container {
  display: grid; /* 或 inline-grid */
  
  /* 定义行列 */
  grid-template-columns: 100px 200px 1fr; /* 固定 固定 自适应 */
  grid-template-rows: 50px auto 100px;
  
  /* 使用 repeat */
  grid-template-columns: repeat(3, 1fr); /* 3列等分 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 响应式 */
  
  /* 命名网格线 */
  grid-template-columns: [start] 100px [middle] 200px [end];
  
  /* 定义区域 */
  grid-template-areas: 
    "header header header"
    "sidebar main main"
    "footer footer footer";
  
  /* 简写 */
  grid-template: 
    "header header" 50px
    "sidebar main" 1fr
    "footer footer" 50px
    / 200px 1fr;
  
  /* 间距 */
  gap: 10px; /* 或 row-gap, column-gap */
  grid-gap: 10px 20px; /* 旧语法 */
  
  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  place-items: center; /* align-items justify-items 简写 */
  
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
  place-content: center; /* align-content justify-content 简写 */
  
  /* 隐式网格 */
  grid-auto-columns: 100px;
  grid-auto-rows: 50px;
  grid-auto-flow: row | column | row dense | column dense;
}

/* 项目属性 */
.grid-item {
  /* 指定位置 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  
  /* 简写 */
  grid-column: 1 / 3; /* 或 1 / span 2 */
  grid-row: 1 / 2;
  grid-area: 1 / 1 / 2 / 3; /* row-start / col-start / row-end / col-end */
  
  /* 使用命名区域 */
  grid-area: header;
  
  /* 单独对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  place-self: center; /* align-self justify-self 简写 */
}

/* 响应式网格 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* 卡片布局 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}
```

#### 定位系统

```css
/* 定位类型 */
.positioned {
  position: static; /* 默认，正常文档流 */
  position: relative; /* 相对定位，相对自身原位置 */
  position: absolute; /* 绝对定位，相对最近定位祖先 */
  position: fixed; /* 固定定位，相对视口 */
  position: sticky; /* 粘性定位，滚动时切换 */
  
  /* 偏移属性 */
  top: 10px;
  right: 10px;
  bottom: 10px;
  left: 10px;
  
  /* 层级 */
  z-index: 1000;
}

/* 居中技巧 */
/* 绝对定位居中 */
.absolute-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 固定宽高居中 */
.fixed-center {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 粘性导航 */
.sticky-nav {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}
```

---

### 3️⃣ 响应式设计

#### 媒体查询

```css
/* 基本语法 */
@media screen and (max-width: 768px) {
  /* 移动端样式 */
}

/* 常用断点 */
/* 移动端 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面端 */
@media (min-width: 1024px) { }

/* 高分辨率屏幕 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { }

/* 横屏 */
@media (orientation: landscape) { }

/* 竖屏 */
@media (orientation: portrait) { }

/* 打印样式 */
@media print { }

/* 深色模式 */
@media (prefers-color-scheme: dark) { }

/* 减少动画 */
@media (prefers-reduced-motion: reduce) { }

/* 复杂查询 */
@media screen and (min-width: 768px) and (max-width: 1023px) and (orientation: landscape) { }
```

#### 响应式单位

```css
/* 相对单位 */
.responsive {
  /* 相对于父元素字体大小 */
  font-size: 1.2em;
  
  /* 相对于根元素字体大小 */
  font-size: 1.5rem;
  
  /* 相对于视口宽度 */
  width: 50vw; /* 50% 视口宽度 */
  
  /* 相对于视口高度 */
  height: 100vh; /* 100% 视口高度 */
  
  /* 相对于视口较小边 */
  font-size: 4vmin;
  
  /* 相对于视口较大边 */
  font-size: 4vmax;
  
  /* 百分比 */
  width: 100%;
  
  /* 计算值 */
  width: calc(100% - 20px);
  width: calc(100vw - 2rem);
}

/* 流体排版 */
.fluid-typography {
  font-size: clamp(1rem, 2.5vw, 2rem); /* 最小值, 首选值, 最大值 */
}

/* 响应式间距 */
.responsive-spacing {
  padding: clamp(1rem, 5vw, 3rem);
  margin: max(1rem, 3vw);
}
```

#### 容器查询 (CSS Container Queries)

```css
/* 定义容器 */
.container {
  container-type: inline-size; /* 或 size, normal */
  container-name: sidebar; /* 可选命名 */
}

/* 容器查询 */
@container (min-width: 300px) {
  .card {
    display: flex;
  }
}

/* 命名容器查询 */
@container sidebar (min-width: 250px) {
  .widget {
    grid-template-columns: 1fr 1fr;
  }
}

/* 容器查询单位 */
.responsive-element {
  width: 50cqw; /* 50% 容器宽度 */
  height: 25cqh; /* 25% 容器高度 */
  font-size: 4cqi; /* 4% 容器内联尺寸 */
  padding: 2cqb; /* 2% 容器块尺寸 */
  margin: 1cqmin; /* 1% 容器较小尺寸 */
  border-radius: 2cqmax; /* 2% 容器较大尺寸 */
}
```

---

### 4️⃣ CSS 动画与过渡

#### 过渡 (Transitions)

```css
/* 基本过渡 */
.transition-element {
  transition: property duration timing-function delay;
  
  /* 具体示例 */
  transition: all 0.3s ease-in-out;
  transition: opacity 0.5s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 分别设置 */
  transition-property: opacity, transform;
  transition-duration: 0.3s, 0.5s;
  transition-timing-function: ease, ease-in-out;
  transition-delay: 0s, 0.1s;
}

/* 常用时间函数 */
.timing-functions {
  transition-timing-function: ease; /* 默认 */
  transition-timing-function: linear;
  transition-timing-function: ease-in;
  transition-timing-function: ease-out;
  transition-timing-function: ease-in-out;
  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  transition-timing-function: steps(4, end);
}

/* 悬停效果 */
.hover-effect {
  opacity: 0.8;
  transform: scale(1);
  transition: all 0.3s ease;
}

.hover-effect:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* 按钮动画 */
.animated-button {
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.animated-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.animated-button:hover::before {
  left: 100%;
}

.animated-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}
```

#### 关键帧动画 (Keyframes)

```css
/* 定义关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 应用动画 */
.animated {
  animation: name duration timing-function delay iteration-count direction fill-mode play-state;
  
  /* 具体示例 */
  animation: fadeIn 0.5s ease-out;
  animation: bounce 1s infinite;
  animation: pulse 2s ease-in-out infinite alternate;
  
  /* 分别设置 */
  animation-name: fadeIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-delay: 0.2s;
  animation-iteration-count: 1; /* 或 infinite */
  animation-direction: normal; /* reverse, alternate, alternate-reverse */
  animation-fill-mode: forwards; /* backwards, both */
  animation-play-state: running; /* paused */
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 打字机效果 */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter {
  overflow: hidden;
  border-right: 2px solid orange;
  white-space: nowrap;
  margin: 0 auto;
  animation: typing 3.5s steps(40, end), blink 0.75s step-end infinite;
}

/* 滑入动画 */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideInLeft 0.5s ease-out;
}
```

#### 高级动画技巧

```css
/* 3D 变换 */
.card-3d {
  perspective: 1000px;
}

.card-3d .card {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-3d:hover .card {
  transform: rotateY(180deg);
}

.card .front,
.card .back {
  position: absolute;
  backface-visibility: hidden;
}

.card .back {
  transform: rotateY(180deg);
}

/* 视差滚动 */
.parallax {
  transform: translateZ(-1px) scale(2);
}

/* 性能优化 */
.optimized-animation {
  /* 使用 transform 和 opacity，避免触发重排 */
  transform: translateX(100px);
  opacity: 0.5;
  
  /* 开启硬件加速 */
  will-change: transform, opacity;
  
  /* 或者 */
  transform: translate3d(100px, 0, 0);
}

/* 动画状态管理 */
.animation-paused {
  animation-play-state: paused;
}

.animation-delayed {
  animation-delay: 0.5s;
}

/* 响应式动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 十、面试实战技巧

### 1️⃣ 常见面试题解答

#### JavaScript 基础题

```javascript
// 1. 实现深拷贝
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // 处理循环引用
  if (hash.has(obj)) return hash.get(obj);
  
  const cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  
  return cloneObj;
}

// 2. 实现 Promise
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };
    
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolve(x);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
      
      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolve(x);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    
    return promise2;
  }
}

// 3. 实现 call、apply、bind
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

Function.prototype.myApply = function(context, args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...(args || []));
  delete context[fn];
  return result;
};

Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function bound(...newArgs) {
    if (new.target) {
      return new fn(...args, ...newArgs);
    }
    return fn.apply(context, [...args, ...newArgs]);
  };
};

// 4. 实现 new 操作符
function myNew(constructor, ...args) {
  // 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(constructor.prototype);
  
  // 执行构造函数
  const result = constructor.apply(obj, args);
  
  // 如果构造函数返回对象，则返回该对象，否则返回新创建的对象
  return result instanceof Object ? result : obj;
}

// 5. 实现 instanceof
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left);
  const prototype = right.prototype;
  
  while (proto) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}
```

#### 算法题

```javascript
// 1. 两数之和
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  
  return [];
}

// 2. 三数之和
function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}

// 3. 最大子数组和
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// 4. 买卖股票的最佳时机
function maxProfit(prices) {
  let minPrice = prices[0];
  let maxProfit = 0;
  
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] < minPrice) {
      minPrice = prices[i];
    } else {
      maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
  }
  
  return maxProfit;
}

// 5. 合并区间
function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = result[result.length - 1];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current);
    }
  }
  
  return result;
}
```

---

### 2️⃣ 项目经验总结

#### 性能优化案例

```javascript
// 1. 虚拟滚动优化长列表
class VirtualList {
  constructor(container, itemHeight, items) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.startIndex = 0;
    
    this.init();
  }
  
  init() {
    this.container.style.height = this.items.length * this.itemHeight + 'px';
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    this.render();
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }
  
  render() {
    const endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    const visibleItems = this.items.slice(this.startIndex, endIndex);
    
    this.container.innerHTML = visibleItems.map((item, index) => `
      <div style="
        position: absolute;
        top: ${(this.startIndex + index) * this.itemHeight}px;
        height: ${this.itemHeight}px;
        width: 100%;
      ">
        ${item.content}
      </div>
    `).join('');
  }
}

// 2. 图片懒加载
class LazyLoad {
  constructor(selector, options = {}) {
    this.images = document.querySelectorAll(selector);
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.options);
    this.init();
  }
  
  init() {
    this.images.forEach(img => {
      this.observer.observe(img);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
    }
  }
}

// 3. 防抖节流优化
class PerformanceUtils {
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(this, args);
    };
  }
  
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  static requestIdleCallback(callback, options = {}) {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options);
    } else {
      return setTimeout(() => {
        const start = Date.now();
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    }
  }
}

// 4. 缓存策略
class CacheManager {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // LRU: 移动到最前面
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  clear() {
    this.cache.clear();
  }
}
```

#### 错误处理与监控

```javascript
// 1. 全局错误处理
class ErrorHandler {
  constructor() {
    this.init();
  }
  
  init() {
    // 捕获 JavaScript 错误
    window.addEventListener('error', this.handleError.bind(this));
    
    // 捕获 Promise 错误
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
    
    // 捕获资源加载错误
    window.addEventListener('error', this.handleResourceError.bind(this), true);
  }
  
  handleError(event) {
    const error = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.reportError(error);
  }
  
  handlePromiseError(event) {
    const error = {
      type: 'promise',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.reportError(error);
  }
  
  handleResourceError(event) {
    if (event.target !== window) {
      const error = {
        type: 'resource',
        message: `Failed to load ${event.target.tagName}`,
        source: event.target.src || event.target.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      this.reportError(error);
    }
  }
  
  reportError(error) {
    // 发送错误报告到服务器
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(err => {
      console.error('Failed to report error:', err);
    });
  }
}

// 2. 性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // 页面加载完成后收集指标
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectMetrics(), 0);
      });
    }
  }
  
  collectMetrics() {
    // 收集导航时间
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.navigation = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        load: navigation.loadEventEnd - navigation.navigationStart
      };
    }
    
    // 收集资源时间
    const resources = performance.getEntriesByType('resource');
    this.metrics.resources = resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize
    }));
    
    // 收集 Core Web Vitals
    this.collectCoreWebVitals();
    
    // 发送指标
    this.sendMetrics();
  }
  
  collectCoreWebVitals() {
    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  sendMetrics() {
    fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    });
  }
}
```

---

### 3️⃣ 面试准备清单

#### 技术栈准备

```markdown
## JavaScript 核心
- [ ] 数据类型与类型转换
- [ ] 作用域与闭包
- [ ] this 指向与绑定
- [ ] 原型与原型链
- [ ] 异步编程 (Promise, async/await)
- [ ] ES6+ 新特性
- [ ] 模块化系统

## 浏览器原理
- [ ] DOM 操作与事件机制
- [ ] 浏览器渲染流程
- [ ] 性能优化策略
- [ ] 跨域解决方案
- [ ] 缓存机制

## 框架技术
- [ ] React Hooks 与生命周期
- [ ] Vue 响应式原理
- [ ] 组件设计模式
- [ ] 状态管理 (Redux, Vuex)
- [ ] 路由原理

## 工程化
- [ ] Webpack/Vite 配置
- [ ] 代码分割与懒加载
- [ ] 构建优化
- [ ] 部署策略
- [ ] 监控与错误处理

## 算法与数据结构
- [ ] 常用排序算法
- [ ] 链表操作
- [ ] 树的遍历
- [ ] 动态规划
- [ ] 字符串处理

## 项目经验
- [ ] 性能优化案例
- [ ] 技术难点解决
- [ ] 架构设计思路
- [ ] 团队协作经验
- [ ] 技术选型理由
```

#### 常见问题准备

```markdown
## 自我介绍
- 简洁明了，突出技术亮点
- 结合具体项目经验
- 展示学习能力和成长轨迹

## 项目介绍
- 项目背景与目标
- 技术栈选择理由
- 遇到的技术难点
- 解决方案与效果
- 个人贡献与收获

## 技术深度
- 原理理解而非仅仅会用
- 能够举出具体例子
- 知道优缺点和适用场景
- 了解最新发展趋势

## 问题解决
- 描述问题分析过程
- 展示调试技巧
- 说明解决方案选择
- 总结经验教训

## 学习能力
- 学习新技术的方法
- 技术社区参与情况
- 个人技术博客或作品
- 对技术发展的看法
```

---

## 总结

这份扩展版的前端面试知识大全涵盖了：

1. **JavaScript 深度解析** - 从基础到高级，包含大量实用代码示例
2. **浏览器核心机制** - DOM、事件、渲染、Web API 等详细讲解
3. **现代框架深入** - React 和 Vue 的核心原理与最佳实践
4. **工程化与性能优化** - 模块化、构建工具、缓存策略等
5. **算法与数据结构** - 面试高频题目的完整实现
6. **CSS 深度解析** - 布局、动画、响应式设计等
7. **面试实战技巧** - 常见问题解答和项目经验总结

每个知识点都配有详细的代码示例和实际应用场景，帮助你不仅理解概念，更能在面试中展示实际的编程能力。

建议按照自己的薄弱环节重点复习，同时要多动手实践，将理论知识转化为实际的编程技能。

> **记住：面试不仅考察技术深度，更看重解决问题的思路和学习能力！**