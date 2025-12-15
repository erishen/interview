# 前端实际工作中的算法与数据结构

> 专注于前端+Node.js全栈开发中真正会用到的算法知识，而不是纯粹的面试题

---

## 一、前端实际场景中的算法应用

### 1️⃣ 数组操作（高频使用）

#### 数据处理与转换

```javascript
// 1. 数据去重 - 用户列表、商品列表等
function removeDuplicates(arr, key) {
  if (!key) {
    return [...new Set(arr)];
  }
  
  const seen = new Set();
  return arr.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// 使用场景：处理API返回的重复数据
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 1, name: 'Alice' }
];
const uniqueUsers = removeDuplicates(users, 'id');

// 2. 数据分组 - 按类别分组商品、按日期分组订单等
function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const value = typeof key === 'function' ? key(item) : item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

// 使用场景：电商网站按类别展示商品
const products = [
  { name: 'iPhone', category: 'phone' },
  { name: 'MacBook', category: 'laptop' },
  { name: 'Samsung', category: 'phone' }
];
const groupedProducts = groupBy(products, 'category');

// 3. 数据排序 - 商品排序、用户排序等
function sortBy(arr, key, order = 'asc') {
  return arr.sort((a, b) => {
    const aVal = typeof key === 'function' ? key(a) : a[key];
    const bVal = typeof key === 'function' ? key(b) : b[key];
    
    if (order === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
}

// 使用场景：商品价格排序
const products2 = [
  { name: 'A', price: 100 },
  { name: 'B', price: 50 },
  { name: 'C', price: 200 }
];
const sortedProducts = sortBy(products2, 'price', 'desc');
```

#### 数组搜索与过滤

```javascript
// 1. 模糊搜索 - 搜索框功能
function fuzzySearch(list, query, keys) {
  const queryLower = query.toLowerCase();
  
  return list.filter(item => {
    return keys.some(key => {
      const value = item[key]?.toString().toLowerCase() || '';
      return value.includes(queryLower);
    });
  });
}

// 使用场景：用户搜索商品
const searchResults = fuzzySearch(products, 'phone', ['name', 'category']);

// 2. 多条件过滤 - 筛选器功能
function multiFilter(list, filters) {
  return list.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return true;
      }
      
      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }
      
      return item[key] === value;
    });
  });
}

// 使用场景：电商筛选器
const filters = {
  category: 'phone',
  priceRange: [50, 200],
  brand: ['Apple', 'Samsung']
};
```

---

### 2️⃣ 树形数据处理（组件树、菜单树）

#### 树形结构操作

```javascript
// 1. 扁平数组转树形结构 - 菜单数据、组织架构
function arrayToTree(arr, parentKey = 'parentId', idKey = 'id') {
  const map = {};
  const roots = [];
  
  // 创建映射
  arr.forEach(item => {
    map[item[idKey]] = { ...item, children: [] };
  });
  
  // 构建树形结构
  arr.forEach(item => {
    const node = map[item[idKey]];
    const parentId = item[parentKey];
    
    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}

// 使用场景：后台管理系统菜单
const menuData = [
  { id: 1, name: '用户管理', parentId: null },
  { id: 2, name: '用户列表', parentId: 1 },
  { id: 3, name: '角色管理', parentId: 1 },
  { id: 4, name: '系统设置', parentId: null }
];
const menuTree = arrayToTree(menuData);

// 2. 树形结构搜索 - 在组件树中查找节点
function findInTree(tree, predicate) {
  for (const node of tree) {
    if (predicate(node)) {
      return node;
    }
    
    if (node.children && node.children.length > 0) {
      const found = findInTree(node.children, predicate);
      if (found) return found;
    }
  }
  return null;
}

// 使用场景：在菜单树中查找特定菜单
const targetMenu = findInTree(menuTree, node => node.name === '用户列表');

// 3. 树形结构遍历 - 收集所有节点、权限检查
function traverseTree(tree, callback) {
  tree.forEach(node => {
    callback(node);
    if (node.children && node.children.length > 0) {
      traverseTree(node.children, callback);
    }
  });
}

// 使用场景：收集用户有权限的所有菜单ID
const accessibleMenuIds = [];
traverseTree(menuTree, node => {
  if (node.hasPermission) {
    accessibleMenuIds.push(node.id);
  }
});
```

---

### 3️⃣ 缓存与优化算法

#### LRU缓存实现

```javascript
// LRU缓存 - 图片缓存、API响应缓存
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 移动到最前面（最近使用）
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
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}

// 使用场景：API响应缓存
const apiCache = new LRUCache(50);

async function fetchWithCache(url) {
  const cached = apiCache.get(url);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  apiCache.set(url, data);
  return data;
}
```

#### 防抖和节流

```javascript
// 防抖 - 搜索框输入、窗口resize
function debounce(func, wait, immediate = false) {
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

// 使用场景：搜索框实时搜索
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(async (query) => {
  const results = await searchAPI(query);
  displayResults(results);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// 节流 - 滚动事件、按钮点击
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用场景：滚动加载更多
const throttledScroll = throttle(() => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    loadMoreData();
  }
}, 200);

window.addEventListener('scroll', throttledScroll);
```

---

### 4️⃣ 字符串处理算法

#### 实际业务场景

```javascript
// 1. 文本高亮 - 搜索结果高亮
function highlightText(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 使用场景：搜索结果页面
const searchResult = highlightText('JavaScript是一门编程语言', 'Script');

// 2. 路径参数解析 - 路由参数提取
function parsePathParams(pattern, path) {
  const paramNames = [];
  const regexPattern = pattern.replace(/:([^/]+)/g, (match, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  
  if (!match) return null;
  
  const params = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });
  
  return params;
}

// 使用场景：前端路由
const params = parsePathParams('/user/:id/posts/:postId', '/user/123/posts/456');
// { id: '123', postId: '456' }

// 3. 模板字符串替换 - 动态内容生成
function templateReplace(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

// 使用场景：邮件模板、消息模板
const template = '欢迎 {{name}}，您的订单 {{orderId}} 已确认';
const message = templateReplace(template, { name: '张三', orderId: 'ORD123' });
```

---

## 二、Node.js后端中的实际算法

### 1️⃣ 数据库查询优化

```javascript
// 1. 批量查询优化 - 避免N+1查询
class DataLoader {
  constructor(batchLoadFn, options = {}) {
    this.batchLoadFn = batchLoadFn;
    this.cache = new Map();
    this.batch = [];
    this.batchPromise = null;
  }
  
  load(key) {
    if (this.cache.has(key)) {
      return Promise.resolve(this.cache.get(key));
    }
    
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject });
      
      if (!this.batchPromise) {
        this.batchPromise = process.nextTick(() => {
          this.dispatchBatch();
        });
      }
    });
  }
  
  async dispatchBatch() {
    const batch = this.batch;
    this.batch = [];
    this.batchPromise = null;
    
    try {
      const keys = batch.map(item => item.key);
      const values = await this.batchLoadFn(keys);
      
      batch.forEach((item, index) => {
        const value = values[index];
        this.cache.set(item.key, value);
        item.resolve(value);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

// 使用场景：批量查询用户信息
const userLoader = new DataLoader(async (userIds) => {
  const users = await User.findByIds(userIds);
  return userIds.map(id => users.find(user => user.id === id));
});

// 在GraphQL resolver中使用
async function getPostsWithAuthors(postIds) {
  const posts = await Post.findByIds(postIds);
  
  // 批量加载作者信息，而不是逐个查询
  const authors = await Promise.all(
    posts.map(post => userLoader.load(post.authorId))
  );
  
  return posts.map((post, index) => ({
    ...post,
    author: authors[index]
  }));
}
```

### 2️⃣ 限流算法

```javascript
// 1. 令牌桶算法 - API限流
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;      // 桶容量
    this.tokens = capacity;        // 当前令牌数
    this.refillRate = refillRate;  // 每秒补充令牌数
    this.lastRefill = Date.now();
  }
  
  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  refill() {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timePassed * this.refillRate);
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// 使用场景：API限流中间件
const rateLimiters = new Map();

function rateLimitMiddleware(req, res, next) {
  const clientId = req.ip;
  
  if (!rateLimiters.has(clientId)) {
    // 每个客户端：容量100，每秒补充10个令牌
    rateLimiters.set(clientId, new TokenBucket(100, 10));
  }
  
  const bucket = rateLimiters.get(clientId);
  
  if (bucket.consume(1)) {
    next();
  } else {
    res.status(429).json({ error: 'Too Many Requests' });
  }
}

// 2. 滑动窗口限流
class SlidingWindowRateLimit {
  constructor(windowSize, maxRequests) {
    this.windowSize = windowSize; // 窗口大小（毫秒）
    this.maxRequests = maxRequests;
    this.requests = new Map(); // clientId -> 请求时间数组
  }
  
  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    
    const clientRequests = this.requests.get(clientId);
    
    // 清理过期请求
    while (clientRequests.length > 0 && clientRequests[0] < windowStart) {
      clientRequests.shift();
    }
    
    if (clientRequests.length < this.maxRequests) {
      clientRequests.push(now);
      return true;
    }
    
    return false;
  }
}
```

### 3️⃣ 任务队列与调度

```javascript
// 1. 优先级队列 - 任务调度
class PriorityQueue {
  constructor(compare = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.compare = compare;
  }
  
  enqueue(item) {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }
  
  dequeue() {
    if (this.heap.length === 0) return null;
    
    const result = this.heap[0];
    const end = this.heap.pop();
    
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.heapifyDown(0);
    }
    
    return result;
  }
  
  heapifyUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) {
        break;
      }
      
      [this.heap[index], this.heap[parentIndex]] = 
      [this.heap[parentIndex], this.heap[index]];
      
      index = parentIndex;
    }
  }
  
  heapifyDown(index) {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      
      if (leftChild < this.heap.length && 
          this.compare(this.heap[leftChild], this.heap[minIndex]) < 0) {
        minIndex = leftChild;
      }
      
      if (rightChild < this.heap.length && 
          this.compare(this.heap[rightChild], this.heap[minIndex]) < 0) {
        minIndex = rightChild;
      }
      
      if (minIndex === index) break;
      
      [this.heap[index], this.heap[minIndex]] = 
      [this.heap[minIndex], this.heap[index]];
      
      index = minIndex;
    }
  }
}

// 使用场景：任务调度系统
class TaskScheduler {
  constructor() {
    this.queue = new PriorityQueue();
    this.running = false;
  }
  
  addTask(task, priority = 0) {
    this.queue.enqueue({ task, priority, id: Date.now() });
    
    if (!this.running) {
      this.process();
    }
  }
  
  async process() {
    this.running = true;
    
    while (this.queue.heap.length > 0) {
      const { task } = this.queue.dequeue();
      
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    
    this.running = false;
  }
}

// 使用场景：邮件发送、图片处理等后台任务
const scheduler = new TaskScheduler();

scheduler.addTask(async () => {
  await sendEmail('user@example.com', 'Welcome!');
}, 1); // 高优先级

scheduler.addTask(async () => {
  await processImage('avatar.jpg');
}, 5); // 低优先级
```

---

## 三、性能优化中的算法

### 1️⃣ 虚拟滚动

```javascript
// 虚拟滚动 - 大列表性能优化
class VirtualScroller {
  constructor(container, itemHeight, items, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.items = items;
    this.renderItem = renderItem;
    
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
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
    const endIndex = Math.min(
      this.startIndex + this.visibleCount, 
      this.items.length
    );
    
    const visibleItems = this.items.slice(this.startIndex, endIndex);
    
    this.container.innerHTML = visibleItems.map((item, index) => {
      const actualIndex = this.startIndex + index;
      return `
        <div style="
          position: absolute;
          top: ${actualIndex * this.itemHeight}px;
          height: ${this.itemHeight}px;
          width: 100%;
        ">
          ${this.renderItem(item, actualIndex)}
        </div>
      `;
    }).join('');
  }
}

// 使用场景：大数据列表展示
const bigList = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  value: Math.random()
}));

const scroller = new VirtualScroller(
  document.getElementById('list-container'),
  50, // 每项高度
  bigList,
  (item) => `<div>${item.name}: ${item.value.toFixed(2)}</div>`
);
```

### 2️⃣ 图片懒加载

```javascript
// 图片懒加载 - 性能优化
class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.loadedImages = new Set();
  }
  
  observe(img) {
    if (this.loadedImages.has(img)) return;
    this.observer.observe(img);
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
    if (!src) return;
    
    const image = new Image();
    
    image.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.loadedImages.add(img);
    };
    
    image.onerror = () => {
      img.src = '/placeholder-error.jpg';
      img.classList.add('error');
    };
    
    image.src = src;
  }
}

// 使用场景：图片网站、商品列表
const lazyLoader = new LazyImageLoader();

document.querySelectorAll('img[data-src]').forEach(img => {
  lazyLoader.observe(img);
});
```

---

## 四、实际项目中的数据结构

### 1️⃣ 状态管理

```javascript
// 1. 简单状态管理器 - 类似Redux的实现
class SimpleStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
    this.middlewares = [];
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  dispatch(action) {
    // 应用中间件
    let finalAction = action;
    for (const middleware of this.middlewares) {
      finalAction = middleware(this)(finalAction);
    }
    
    // 更新状态
    const newState = this.reducer(this.state, finalAction);
    
    if (newState !== this.state) {
      this.state = newState;
      this.listeners.forEach(listener => listener(this.state));
    }
  }
  
  getState() {
    return this.state;
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
  }
}

// 使用场景：React/Vue应用状态管理
const store = new SimpleStore({
  user: null,
  posts: [],
  loading: false
});

store.reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};
```

### 2️⃣ 事件系统

```javascript
// 事件发布订阅 - 组件通信
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push(listener);
    
    // 返回取消订阅函数
    return () => this.off(event, listener);
  }
  
  off(event, listener) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    const index = listeners.indexOf(listener);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }
  
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    
    this.events.get(event).forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener(...args);
      this.off(event, onceWrapper);
    };
    
    this.on(event, onceWrapper);
  }
}

// 使用场景：组件间通信、插件系统
const eventBus = new EventEmitter();

// 组件A监听用户登录事件
eventBus.on('user:login', (user) => {
  console.log('User logged in:', user.name);
  updateUserUI(user);
});

// 组件B触发用户登录事件
eventBus.emit('user:login', { id: 1, name: 'Alice' });
```

---

## 五、总结：前端开发者真正需要的算法知识

### 🎯 高频使用（必须掌握）

1. **数组操作**：map、filter、reduce、sort、去重、分组
2. **对象操作**：深拷贝、合并、属性访问
3. **字符串处理**：模板替换、搜索高亮、路径解析
4. **树形数据**：菜单树、组件树、权限树
5. **缓存策略**：LRU、防抖节流、记忆化

### 🔧 性能优化（重要）

1. **虚拟滚动**：大列表优化
2. **懒加载**：图片、组件、路由
3. **批量操作**：DOM更新、API请求
4. **事件优化**：防抖节流、事件委托

### 📊 数据处理（常用）

1. **搜索过滤**：模糊搜索、多条件筛选
2. **排序分页**：前端分页、排序算法
3. **数据转换**：格式化、标准化、聚合

### 🏗️ 架构设计（进阶）

1. **状态管理**：发布订阅、状态机
2. **任务调度**：优先级队列、批处理
3. **限流控制**：令牌桶、滑动窗口

---

> **记住：前端开发中的算法更多是为了解决实际业务问题，而不是纯粹的算法竞赛。重点是理解原理，能够在实际项目中灵活运用！**