# 动态规划完全指南 - 从入门到精通

> 动态规划是面试中的重点难点，本文将从基础概念到经典题目，帮你彻底掌握动态规划思想

---

## 一、动态规划基础概念

### 1️⃣ 什么是动态规划？

**动态规划（Dynamic Programming，DP）** 是一种通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。

#### 核心思想
- **最优子结构**：问题的最优解包含子问题的最优解
- **重叠子问题**：递归过程中会重复计算相同的子问题
- **状态转移**：通过状态转移方程描述问题的递推关系

#### 与递归的区别
```javascript
// 普通递归（会重复计算）
function fibRecursive(n) {
  if (n <= 1) return n;
  return fibRecursive(n - 1) + fibRecursive(n - 2);
  // 时间复杂度：O(2^n)
}

// 动态规划（避免重复计算）
function fibDP(n) {
  if (n <= 1) return n;
  
  const dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
  // 时间复杂度：O(n)
}
```

---

## 二、动态规划解题步骤

### 🔍 五步解题法

#### 1. 确定状态定义
- `dp[i]` 表示什么含义？
- 状态的维度是什么？

#### 2. 找出状态转移方程
- 当前状态如何由之前的状态推导出来？
- `dp[i] = ?`

#### 3. 确定初始状态
- 边界条件是什么？
- `dp[0]`, `dp[1]` 等初始值

#### 4. 确定计算顺序
- 从小到大？从大到小？
- 保证计算当前状态时，依赖的状态已经计算过

#### 5. 优化空间复杂度（可选）
- 是否可以用滚动数组优化？
- 是否只需要保存部分状态？

---

## 三、经典入门题目

### 1️⃣ 斐波那契数列

```javascript
/**
 * 问题：计算第 n 个斐波那契数
 * F(0) = 0, F(1) = 1
 * F(n) = F(n-1) + F(n-2)
 */

// 方法1：基础DP
function fibonacci(n) {
  if (n <= 1) return n;
  
  // 1. 状态定义：dp[i] 表示第 i 个斐波那契数
  const dp = new Array(n + 1);
  
  // 3. 初始状态
  dp[0] = 0;
  dp[1] = 1;
  
  // 4. 计算顺序：从小到大
  for (let i = 2; i <= n; i++) {
    // 2. 状态转移方程
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 方法2：空间优化版本
function fibonacciOptimized(n) {
  if (n <= 1) return n;
  
  // 5. 空间优化：只需要保存前两个状态
  let prev = 0, curr = 1;
  
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  
  return curr;
}

console.log(fibonacci(10)); // 55
console.log(fibonacciOptimized(10)); // 55
```

### 2️⃣ 爬楼梯问题

```javascript
/**
 * 问题：爬楼梯，每次可以爬1或2个台阶，问有多少种方法爬到第n阶
 * 
 * 分析：
 * - 到达第n阶，可以从第(n-1)阶爬1步，或从第(n-2)阶爬2步
 * - dp[n] = dp[n-1] + dp[n-2]
 */

function climbStairs(n) {
  if (n <= 2) return n;
  
  // 状态定义：dp[i] 表示爬到第 i 阶的方法数
  const dp = new Array(n + 1);
  
  // 初始状态
  dp[1] = 1; // 爬到第1阶：1种方法
  dp[2] = 2; // 爬到第2阶：2种方法（1+1 或 2）
  
  // 状态转移
  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 空间优化版本
function climbStairsOptimized(n) {
  if (n <= 2) return n;
  
  let prev = 1, curr = 2;
  
  for (let i = 3; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  
  return curr;
}

console.log(climbStairs(5)); // 8
```

### 3️⃣ 最小路径和

```javascript
/**
 * 问题：给定一个包含非负整数的 m x n 网格，
 * 找到一条从左上角到右下角的路径，使得路径上的数字总和为最小
 * 
 * 只能向右或向下移动
 */

function minPathSum(grid) {
  const m = grid.length;
  const n = grid[0].length;
  
  // 状态定义：dp[i][j] 表示到达位置(i,j)的最小路径和
  const dp = Array(m).fill().map(() => Array(n).fill(0));
  
  // 初始状态
  dp[0][0] = grid[0][0];
  
  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[0][j] = dp[0][j - 1] + grid[0][j];
  }
  
  // 初始化第一列
  for (let i = 1; i < m; i++) {
    dp[i][0] = dp[i - 1][0] + grid[i][0];
  }
  
  // 状态转移
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      // 从上方或左方到达当前位置，选择路径和更小的
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];
    }
  }
  
  return dp[m - 1][n - 1];
}

// 空间优化版本（只用一维数组）
function minPathSumOptimized(grid) {
  const m = grid.length;
  const n = grid[0].length;
  
  // 只需要保存一行的状态
  const dp = new Array(n);
  dp[0] = grid[0][0];
  
  // 初始化第一行
  for (let j = 1; j < n; j++) {
    dp[j] = dp[j - 1] + grid[0][j];
  }
  
  // 逐行更新
  for (let i = 1; i < m; i++) {
    dp[0] += grid[i][0]; // 更新第一列
    
    for (let j = 1; j < n; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
    }
  }
  
  return dp[n - 1];
}

// 测试
const grid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1]
];
console.log(minPathSum(grid)); // 7 (路径：1→3→1→1→1)
```

---

## 四、背包问题系列

### 1️⃣ 0-1背包问题

```javascript
/**
 * 问题：有 n 个物品，第 i 个物品重量为 weights[i]，价值为 values[i]
 * 背包容量为 capacity，每个物品只能选择一次，求最大价值
 */

function knapsack01(weights, values, capacity) {
  const n = weights.length;
  
  // 状态定义：dp[i][w] 表示前 i 个物品，背包容量为 w 时的最大价值
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  // 状态转移
  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      // 不选择第 i 个物品
      dp[i][w] = dp[i - 1][w];
      
      // 如果能装下第 i 个物品，考虑选择它
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w], // 不选
          dp[i - 1][w - weights[i - 1]] + values[i - 1] // 选择
        );
      }
    }
  }
  
  return dp[n][capacity];
}

// 空间优化版本（滚动数组）
function knapsack01Optimized(weights, values, capacity) {
  const n = weights.length;
  
  // 只需要一维数组
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < n; i++) {
    // 从后往前遍历，避免重复使用
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

// 测试
const weights = [2, 1, 3, 2];
const values = [12, 10, 20, 15];
const capacity = 5;
console.log(knapsack01(weights, values, capacity)); // 37
```

### 2️⃣ 完全背包问题

```javascript
/**
 * 问题：每个物品可以选择无限次
 */

function knapsackComplete(weights, values, capacity) {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);
  
  for (let i = 0; i < n; i++) {
    // 从前往后遍历，允许重复使用
    for (let w = weights[i]; w <= capacity; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  
  return dp[capacity];
}

// 测试
console.log(knapsackComplete(weights, values, capacity)); // 可能更大，因为可以重复选择
```

---

## 五、字符串DP问题

### 1️⃣ 最长公共子序列（LCS）

```javascript
/**
 * 问题：给定两个字符串，找到它们的最长公共子序列的长度
 * 子序列不要求连续，但要求相对顺序不变
 */

function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  
  // 状态定义：dp[i][j] 表示 text1[0..i-1] 和 text2[0..j-1] 的LCS长度
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        // 字符相同，LCS长度+1
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        // 字符不同，取较大的LCS长度
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// 空间优化版本
function lcsOptimized(text1, text2) {
  const m = text1.length;
  const n = text2.length;
  
  // 只需要两行
  let prev = new Array(n + 1).fill(0);
  let curr = new Array(n + 1).fill(0);
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    [prev, curr] = [curr, prev]; // 交换数组
  }
  
  return prev[n];
}

console.log(longestCommonSubsequence("abcde", "ace")); // 3
console.log(longestCommonSubsequence("abc", "abc")); // 3
console.log(longestCommonSubsequence("abc", "def")); // 0
```

### 2️⃣ 编辑距离

```javascript
/**
 * 问题：给定两个单词，计算将一个单词转换成另一个单词所需的最少操作数
 * 操作包括：插入、删除、替换一个字符
 */

function editDistance(word1, word2) {
  const m = word1.length;
  const n = word2.length;
  
  // 状态定义：dp[i][j] 表示 word1[0..i-1] 转换为 word2[0..j-1] 的最少操作数
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // 初始状态
  // word1 转换为空字符串，需要删除所有字符
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  // 空字符串转换为 word2，需要插入所有字符
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // 状态转移
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        // 字符相同，不需要操作
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        // 字符不同，选择操作数最少的方案
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除 word1[i-1]
          dp[i][j - 1] + 1,     // 插入 word2[j-1]
          dp[i - 1][j - 1] + 1  // 替换 word1[i-1] 为 word2[j-1]
        );
      }
    }
  }
  
  return dp[m][n];
}

console.log(editDistance("horse", "ros")); // 3
console.log(editDistance("intention", "execution")); // 5
```

---

## 六、数组DP问题

### 1️⃣ 最长递增子序列（LIS）

```javascript
/**
 * 问题：给定一个无序的整数数组，找到其中最长上升子序列的长度
 */

// 方法1：动态规划 O(n²)
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  
  // 状态定义：dp[i] 表示以 nums[i] 结尾的最长递增子序列长度
  const dp = new Array(nums.length).fill(1);
  
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}

// 方法2：二分查找优化 O(n log n)
function lengthOfLISOptimized(nums) {
  if (nums.length === 0) return 0;
  
  // tails[i] 表示长度为 i+1 的递增子序列的最小尾部元素
  const tails = [];
  
  for (const num of nums) {
    // 二分查找插入位置
    let left = 0, right = tails.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (tails[mid] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    // 如果 left === tails.length，说明 num 比所有元素都大，直接添加
    if (left === tails.length) {
      tails.push(num);
    } else {
      // 否则替换 tails[left]
      tails[left] = num;
    }
  }
  
  return tails.length;
}

console.log(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18])); // 4
console.log(lengthOfLIS([0, 1, 0, 3, 2, 3])); // 4
```

### 2️⃣ 最大子数组和

```javascript
/**
 * 问题：给定一个整数数组，找到一个具有最大和的连续子数组
 */

function maxSubArray(nums) {
  // 状态定义：dp[i] 表示以 nums[i] 结尾的最大子数组和
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // 状态转移：要么继续之前的子数组，要么重新开始
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}

// 如果需要返回子数组的起始和结束位置
function maxSubArrayWithIndex(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  let start = 0, end = 0, tempStart = 0;
  
  for (let i = 1; i < nums.length; i++) {
    if (currentSum < 0) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum += nums[i];
    }
    
    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }
  
  return {
    maxSum,
    subArray: nums.slice(start, end + 1),
    start,
    end
  };
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArrayWithIndex([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
// { maxSum: 6, subArray: [4, -1, 2, 1], start: 3, end: 6 }
```

---

## 七、股票买卖问题

### 1️⃣ 买卖股票的最佳时机

```javascript
/**
 * 问题：给定一个数组，它的第 i 个元素是一支给定股票第 i 天的价格
 * 只能买卖一次，求最大利润
 */

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

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
```

### 2️⃣ 买卖股票的最佳时机 II

```javascript
/**
 * 问题：可以多次买卖，但不能同时持有多支股票
 */

function maxProfitII(prices) {
  let profit = 0;
  
  // 贪心策略：只要第二天价格比今天高，就今天买明天卖
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  
  return profit;
}

console.log(maxProfitII([7, 1, 5, 3, 6, 4])); // 7
```

### 3️⃣ 买卖股票的最佳时机 III

```javascript
/**
 * 问题：最多可以完成两笔交易
 */

function maxProfitIII(prices) {
  if (prices.length <= 1) return 0;
  
  // 状态定义
  let buy1 = -prices[0];  // 第一次买入后的最大利润
  let sell1 = 0;          // 第一次卖出后的最大利润
  let buy2 = -prices[0];  // 第二次买入后的最大利润
  let sell2 = 0;          // 第二次卖出后的最大利润
  
  for (let i = 1; i < prices.length; i++) {
    // 状态转移
    buy1 = Math.max(buy1, -prices[i]);           // 第一次买入
    sell1 = Math.max(sell1, buy1 + prices[i]);   // 第一次卖出
    buy2 = Math.max(buy2, sell1 - prices[i]);    // 第二次买入
    sell2 = Math.max(sell2, buy2 + prices[i]);   // 第二次卖出
  }
  
  return sell2;
}

console.log(maxProfitIII([3, 3, 5, 0, 0, 3, 1, 4])); // 6
```

---

## 八、动态规划优化技巧

### 1️⃣ 空间优化

```javascript
// 原始版本：O(n) 空间
function fibOriginal(n) {
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// 优化版本：O(1) 空间
function fibOptimized(n) {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  
  return curr;
}
```

### 2️⃣ 滚动数组

```javascript
// 二维DP的空间优化
function minPathSumRolling(grid) {
  const n = grid[0].length;
  let dp = [...grid[0]]; // 复制第一行
  
  for (let i = 1; i < grid.length; i++) {
    dp[0] += grid[i][0]; // 更新第一列
    
    for (let j = 1; j < n; j++) {
      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];
    }
  }
  
  return dp[n - 1];
}
```

### 3️⃣ 记忆化搜索

```javascript
// 自顶向下的动态规划
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}

// 使用 Map 的版本
function fibMemoMap(n) {
  const memo = new Map();
  
  function helper(n) {
    if (n <= 1) return n;
    if (memo.has(n)) return memo.get(n);
    
    const result = helper(n - 1) + helper(n - 2);
    memo.set(n, result);
    return result;
  }
  
  return helper(n);
}
```

---

## 九、动态规划总结

### 🎯 解题模板

```javascript
function dpTemplate(/* 参数 */) {
  // 1. 确定状态定义
  // dp[i] 或 dp[i][j] 表示什么？
  
  // 2. 初始化状态数组
  const dp = /* 初始化 */;
  
  // 3. 设置初始状态
  // dp[0] = ?
  // dp[0][0] = ?
  
  // 4. 状态转移
  for (let i = /* 起始 */; i < /* 结束 */; i++) {
    for (let j = /* 起始 */; j < /* 结束 */; j++) {
      // dp[i] = Math.max/min(dp[i-1] + ..., dp[i-2] + ...)
      // dp[i][j] = Math.max/min(dp[i-1][j], dp[i][j-1]) + ...
    }
  }
  
  // 5. 返回结果
  return dp[/* 目标状态 */];
}
```

### 📝 常见状态转移方程

```javascript
// 线性DP
dp[i] = dp[i-1] + dp[i-2]                    // 斐波那契类型
dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i]) // 打家劫舍类型
dp[i] = Math.max(dp[i-1] + nums[i], nums[i]) // 最大子数组和

// 区间DP
dp[i][j] = Math.min(dp[i][k] + dp[k+1][j] + cost) // 矩阵链乘法

// 背包DP
dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weight[i]] + value[i]) // 0-1背包

// 字符串DP
dp[i][j] = dp[i-1][j-1] + 1                  // 字符匹配
dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])  // 不匹配时的最优选择
```

### 🚀 学习建议

1. **从简单题目开始**：斐波那契、爬楼梯
2. **理解状态定义**：这是最关键的一步
3. **画图分析**：帮助理解状态转移过程
4. **多做练习**：熟能生巧，培养DP思维
5. **总结模板**：归纳常见的DP类型和解法

### 📚 推荐练习题目

**入门级：**
- 斐波那契数列
- 爬楼梯
- 最小路径和
- 打家劫舍

**进阶级：**
- 0-1背包问题
- 最长公共子序列
- 编辑距离
- 最长递增子序列

**高级：**
- 股票买卖系列
- 正则表达式匹配
- 最长回文子序列
- 戳气球

---

> **记住：动态规划的核心是找到状态定义和状态转移方程。多练习，多思考，你一定能掌握这个强大的算法思想！**