# 前端面试综合题库

> 精选的面试综合题，涵盖 Next.js、Node.js、缓存策略、网络通信等核心知识点

---

## 1. Next.js 是什么？

**答案：**

Next.js 是一个基于 React 的全栈框架，提供了多种渲染模式和优化功能：

### 核心特性

| 特性 | 说明 |
|------|------|
| **SSR (服务端渲染)** | 每次请求时在服务端渲染页面，适合动态内容 |
| **SSG (静态生成)** | 构建时生成静态 HTML，适合内容不常变化的页面 |
| **ISR (增量静态再生)** | 结合 SSG 和 SSR，按需更新静态页面 |
| **文件系统路由** | 基于 `pages/` 或 `app/` 目录结构自动生成路由 |
| **自动代码拆分** | 按页面自动拆分代码，优化加载性能 |
| **图片优化** | `next/image` 组件自动优化图片 |
| **API 路由** | 内置 API 端点，构建全栈应用 |

### 渲染模式对比

```typescript
// SSG - 静态生成
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 }; // ISR with 60s revalidation
}

// SSR - 服务端渲染
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// CSR - 客户端渲染
import { useEffect, useState } from 'react';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => { fetchData().then(setData); }, []);
}
```

---

## 2. Next.js 怎么配置缓存？

**答案：**

Next.js 提供了多层缓存机制：

### HTTP 头缓存

```typescript
// 在 API 路由中设置 Cache-Control
export async function GET() {
  const data = await fetchData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
    },
  });
}
```

### 使用 `next/cache` 模块

```typescript
import { unstable_cache } from 'next/cache';

const cachedFetch = unstable_cache(
  async (id: string) => {
    return await fetchData(id);
  },
  ['data-cache'],
  { revalidate: 3600, tags: ['data'] }
);

// 手动清除缓存
import { revalidateTag } from 'next/cache';
revalidateTag('data');
```

### 静态资源缓存

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

## 3. Node.js Cluster、Worker Threads、Child Process 区别

**答案：**

### Cluster 模式

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork(); // 创建工作进程
  }
} else {
  // 工作进程处理请求
  require('http').createServer((req, res) => {
    res.end(`Worker ${process.pid}`);
  }).listen(3000);
}
```

**特点：**
- 每个 worker 进程独立运行，拥有独立的 V8 实例
- 适合 I/O 密集型任务
- 自动负载均衡
- 进程间通过 IPC 通信

### Worker Threads

```javascript
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { n: 42 } });
  worker.on('message', (result) => console.log(result));
} else {
  // 计算斐波那契数列
  const fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2);
  parentPort.postMessage(fib(workerData.n));
}
```

**特点：**
- 同一进程内的多线程，共享内存
- 适合 CPU 密集型任务
- 需要手动管理线程同步
- 内存占用相对较小

### Child Process

```javascript
const { exec, spawn } = require('child_process');

// exec - 执行命令并获取输出
exec('ls -la', (error, stdout, stderr) => {
  console.log(stdout);
});

// spawn - 启动子进程并流式处理
const child = spawn('node', ['script.js']);
child.stdout.on('data', (data) => console.log(data));
```

**特点：**
- 独立的进程，完全隔离
- 适合执行外部程序或脚本
- 通信开销较大
- 更适合任务隔离和安全性要求高的场景

### 对比表

| 特性 | Cluster | Worker Threads | Child Process |
|------|---------|---------------|--------------|
| **隔离性** | 进程级 | 线程级（共享内存） | 进程级 |
| **通信开销** | 中等 | 低 | 高 |
| **适用场景** | I/O 密集型 | CPU 密集型 | 外部命令执行 |
| **内存占用** | 高 | 低 | 高 |
| **故障隔离** | 是 | 否 | 是 |

---

## 4. LRU 是什么？

**答案：**

LRU（Least Recently Used，最近最少使用）是一种常见的缓存淘汰策略。

### 核心思想

当缓存容量满时，优先淘汰最久未被访问的数据项。

### 实现方式

使用 **哈希表 + 双向链表** 实现：
- 哈希表：O(1) 时间复杂度查找数据
- 双向链表：O(1) 时间复杂度移动/删除节点

### JavaScript 实现

```typescript
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // 移到最前（最近使用）
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的（Map 的第一个键）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 使用
const cache = new LRUCache<string, number>(2);
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3); // 'a' 被淘汰
console.log(cache.get('a')); // undefined
console.log(cache.get('b')); // 2
```

### LRU vs LFU

| 策略 | 淘汰依据 | 适用场景 |
|------|----------|----------|
| **LRU** | 最近未使用时间 | 时间局部性强的场景 |
| **LFU** | 访问频率最低 | 长期热点数据稳定的场景 |

```typescript
// LFU 简单实现思路
class LFUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; count: number }>;

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    item.count++; // 增加访问计数
    return item.value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!;
      item.value = value;
      item.count++;
    } else {
      if (this.cache.size >= this.capacity) {
        // 找出计数最小的并删除
        let minKey = null;
        let minCount = Infinity;
        for (const [k, v] of this.cache) {
          if (v.count < minCount) {
            minCount = v.count;
            minKey = k;
          }
        }
        if (minKey) this.cache.delete(minKey);
      }
      this.cache.set(key, { value, count: 1 });
    }
  }
}
```

---

## 5. WebSocket 怎么监督质量？

**答案：**

WebSocket 质量监控需要从多个维度进行：

### 1. 心跳检测 (Ping/Pong)

```typescript
class WebSocketManager {
  private ws: WebSocket;
  private heartbeatInterval: NodeJS.Timeout;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30秒

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.setupHeartbeat();
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.HEARTBEAT_INTERVAL);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        const latency = Date.now() - data.timestamp;
        console.log(`WebSocket latency: ${latency}ms`);
      }
    };
  }
}
```

### 2. 消息确认机制

```typescript
class ReliableWebSocket {
  private pendingMessages = new Map<number, { data: any; callback: () => void }>();
  private messageId = 0;

  send(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      this.pendingMessages.set(id, { data, callback: resolve });
      
      this.ws.send(JSON.stringify({
        type: 'message',
        id,
        data,
      }));

      // 超时处理
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Message acknowledgment timeout'));
        }
      }, 5000);
    });
  }

  handleAck(messageId: number) {
    const message = this.pendingMessages.get(messageId);
    if (message) {
      message.callback();
      this.pendingMessages.delete(messageId);
    }
  }
}
```

### 3. 延迟监控

```typescript
class LatencyMonitor {
  private latencies: number[] = [];
  private readonly MAX_SAMPLES = 100;

  recordLatency(latency: number) {
    this.latencies.push(latency);
    if (this.latencies.length > this.MAX_SAMPLES) {
      this.latencies.shift();
    }
  }

  getMetrics() {
    const avg = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
    const max = Math.max(...this.latencies);
    const min = Math.min(...this.latencies);
    
    // 计算百分位数
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return { avg, max, min, p50, p95, p99 };
  }
}
```

### 4. 错误监控与重连

```typescript
class RobustWebSocket {
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.logError(error);
    };

    this.ws.onclose = () => {
      console.warn('WebSocket closed, attempting reconnect...');
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = this.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  private logError(error: Event) {
    // 发送到错误监控服务
    fetch('/api/log-error', {
      method: 'POST',
      body: JSON.stringify({
        error: 'WebSocket error',
        timestamp: Date.now(),
        details: error,
      }),
    });
  }
}
```

### 5. 健康度评分系统

```typescript
class WebSocketHealthScore {
  private score = 100;
  private lastUpdate = Date.now();

  update(latency: number, errorCount: number) {
    // 延迟影响分数（每超过 100ms 1 分）
    const latencyPenalty = Math.max(0, latency - 100) / 10;
    
    // 错误影响分数（每个错误 10 分）
    const errorPenalty = errorCount * 10;

    this.score = Math.max(0, 100 - latencyPenalty - errorPenalty);
    this.lastUpdate = Date.now();
  }

  getStatus(): 'healthy' | 'warning' | 'critical' {
    if (this.score >= 80) return 'healthy';
    if (this.score >= 50) return 'warning';
    return 'critical';
  }
}
```

---

## 6. gRPC 与 RPC 的区别

**答案：**

### RPC (Remote Procedure Call)

RPC 是一种分布式计算的技术概念，允许程序调用另一台计算机上的函数，就像调用本地函数一样。

**常见实现：**
- JSON-RPC（使用 JSON 格式）
- XML-RPC（使用 XML 格式）
- REST API（HTTP + JSON）

```javascript
// JSON-RPC 示例
const request = {
  jsonrpc: '2.0',
  method: 'subtract',
  params: [42, 23],
  id: 1,
};

const response = await fetch('/rpc', {
  method: 'POST',
  body: JSON.stringify(request),
});
```

### gRPC

gRPC 是 Google 开源的高性能 RPC 框架，基于 HTTP/2 和 Protocol Buffers。

**核心特性：**
- ✅ HTTP/2：多路复用、头部压缩、服务端推送
- ✅ Protobuf：高效的二进制序列化
- ✅ 流式传输：支持单一流、双向流
- ✅ 跨语言：自动生成多种语言的代码
- ✅ 接口定义：使用 .proto 文件定义服务

### .proto 文件示例

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);  // 服务端流
  rpc CreateUser(stream CreateUserRequest) returns (User); // 客户端流
  rpc Chat(stream ChatMessage) returns (stream ChatMessage); // 双向流
}

message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

### 对比表

| 特性 | RPC (JSON) | gRPC |
|------|------------|------|
| **协议** | HTTP/1.1 | HTTP/2 |
| **序列化** | JSON (文本) | Protobuf (二进制) |
| **传输大小** | 大 | 小 |
| **序列化速度** | 慢 | 快 |
| **流式传输** | 不支持 | 支持 |
| **跨语言** | 容易 | 容易（自动生成） |
| **浏览器支持** | 原生支持 | 需要 gRPC-Web |

### 性能对比

```typescript
// JSON 序列化
const jsonData = JSON.stringify({ id: 1, name: 'Alice' });
// 大小: ~25 字节，速度: ~1000 ops/ms

// Protobuf 序列化
const protobufData = user.encode({ id: 1, name: 'Alice' }).finish();
// 大小: ~8 字节，速度: ~5000 ops/ms
```

---

## 7. gRPC 为什么比 REST 好？

**答案：**

### 性能优势

| 指标 | REST | gRPC | 优势 |
|------|------|------|------|
| **传输大小** | JSON 文本 | Protobuf 二进制 | ~5-10x 更小 |
| **序列化速度** | 慢 | 快 | ~3-5x 更快 |
| **连接复用** | HTTP/1.1 每请求新连接 | HTTP/2 多路复用 | 更低延迟 |
| **压缩** | 无 | 头部压缩 | 减少带宽 |

### 双向流通信

```typescript
// REST: 需要 WebSockets 或轮询
const eventSource = new EventSource('/events');
eventSource.onmessage = (e) => console.log(e.data);

// gRPC: 原生双向流
const call = client.chat((error, response) => {
  console.log(response);
});

// 发送消息
call.write({ message: 'Hello' });
call.write({ message: 'World' });
```

### 强类型接口

```typescript
// TypeScript + REST: 需要手动维护类型
interface User {
  id: number;
  name: string;
}
// 容易出现前后端类型不一致

// gRPC + TypeScript: 自动生成类型
import { User, GetUserRequest } from './user.pb';
// 类型与 .proto 文件完全一致
```

### HTTP/2 特性

```typescript
// REST over HTTP/1.1: 队头阻塞
await Promise.all([
  fetch('/api/user/1'),  // 按顺序执行
  fetch('/api/user/2'),
  fetch('/api/user/3'),
]);

// gRPC over HTTP/2: 并行传输
const [user1, user2, user3] = await Promise.all([
  client.getUser({ id: 1 }),
  client.getUser({ id: 2 }),
  client.getUser({ id: 3 }),
]);
```

### 代码生成

```bash
# gRPC 自动生成代码
protoc --js_out=import_style=commonjs:. user.proto
protoc --ts_out=. user.proto

# 生成文件包括：
# - user_pb.js  # 消息定义
# - user_pb.d.ts # TypeScript 类型
# - user_grpc_pb.js # 服务定义
```

---

## 8. 解决过最复杂的问题（面试回答模板）

**STAR 法则回答框架：**

### 示例 1: 性能瓶颈优化

**Situation（情境）：**
在一个电商项目中，首页加载时间从 3 秒增长到 8 秒，严重影响用户体验。

**Task（任务）：**
将首页加载时间降低到 2 秒以内。

**Action（行动）：**
1. **分析问题**：使用 Lighthouse 和 Chrome DevTools 分析，发现主要瓶颈是：
   - 大图片未压缩（+2.5s）
   - API 响应慢（+2s）
   - 首屏 JS 包过大（+1.5s）

2. **实施优化**：
   ```typescript
   // 图片优化
   <Image 
     src="/product.jpg" 
     width={800} 
     height={600} 
     loading="lazy"
   />
   
   // API 缓存
   const cachedData = await unstable_cache(
     fetchProducts,
     ['products'],
     { revalidate: 300 }
   )();
   
   // 代码分割
   const HeavyComponent = dynamic(() => import('./Heavy'), {
     loading: () => <Skeleton />
   });
   ```

3. **结果**：加载时间降至 1.8 秒，用户留存率提升 25%。

### 示例 2: 分布式系统同步问题

**Situation（情境）：**
订单系统和库存系统数据不一致，出现超卖现象。

**Task（行动）：**
确保订单系统和库存系统的数据一致性。

**Action（行动）：**
1. **架构设计**：采用最终一致性 + 补偿机制
2. **实施方案**：
   ```typescript
   // 使用消息队列实现异步处理
   await queue.publish('order.created', {
     orderId: order.id,
     items: order.items,
   });
   
   // 库存消费者
   consumer.on('order.created', async (msg) => {
     await withTransaction(async (tx) => {
       await updateInventory(tx, msg.items);
       await markOrderProcessed(tx, msg.orderId);
     });
   });
   
   // 定时补偿检查
   setInterval(async () => {
     const unprocessed = await getUnprocessedOrders();
     for (const order of unprocessed) {
       await compensateOrder(order);
     }
   }, 60000);
   ```

3. **结果**：超卖率降至 0.01%，系统吞吐量提升 40%。

### 示例 3: 高并发处理

**Situation（情境）：**
秒杀活动期间，QPS 从 1000 涨到 50000，系统响应超时。

**Task（行动）：**
保障系统稳定，支持高并发访问。

**Action（行动）：**
1. **限流降级**：
   ```typescript
   // 使用 Redis 限流
   const allowed = await redis.setnx(
     `rate_limit:${userId}:${minute}`,
     '1'
   );
   await redis.expire(`rate_limit:${userId}:${minute}`, 60);
   
   if (!allowed) {
     return error('请求过于频繁');
   }
   ```

2. **缓存预热**：
   ```typescript
   // 活动前预热
   const products = await getFlashSaleProducts();
   await Promise.all(
     products.map(p => redis.set(`product:${p.id}`, JSON.stringify(p)))
   );
   ```

3. **读写分离**：主库写入，从库读取

4. **结果**：系统稳定支撑 50000 QPS，活动期间无故障。

---

## 总结

这份文档涵盖了前端面试中的常见综合题，建议：
- 结合实际项目经验准备第 8 题
- 对比记忆第 3、4、6、7 题的不同方案
- 实践编码第 2、4、5 题的技术实现
