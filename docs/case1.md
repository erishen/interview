1. Next.js 是什么

Next.js 是一个基于 React 的服务端渲染（SSR）框架，它支持 静态生成（SSG） 和 服务端渲染（SSR），并且提供了很多优化功能，如自动代码拆分、文件系统路由、预取等。

2. Next.js 怎么配置缓存

可以通过配置 HTTP 头 来缓存页面，使用 Cache-Control 来设置缓存策略。

也可以利用 next/cache 模块来缓存静态资源，或者在 API 路由中通过 getServerSideProps 或 getStaticProps 配置缓存。

配置缓存的具体方式取决于你使用的是 SSR 还是 SSG。

1. Node.js Cluster , Worker Threads , Child Process 区别

Cluster 模式：将 Node.js 应用程序分成多个子进程（通常与 CPU 核心数相同），每个子进程都处理来自主进程的请求。这可以提高 Node.js 在多核 CPU 上的并发处理能力。

Worker Threads 作用：Node.js 通过 Worker Threads 提供了真正的 多线程 支持，用于执行 CPU 密集型任务。这种模式适合处理 计算密集型任务，比如图像处理、数据分析等。

Child Process 允许 Node.js 启动子进程执行任务，子进程与主进程独立运行，适用于一些需要通过外部程序执行的任务。

4. LRU 是啥

LRU（Least Recently Used）是一种缓存淘汰策略，表示当缓存满时，最久未使用的项将被删除。它使用 链表 和 哈希表 实现，通过移动最近使用的项到链表头部，淘汰尾部最久未使用的项。

LFU (Least Frequently Used) 是另一种常见的缓存淘汰策略，它的核心思想是：如果一个数据项被访问的频率较低，那么它被淘汰的可能性更大。

5. WebSocket 怎么监督质量

通过 心跳检测（ping/pong）来确保连接仍然活跃。

使用 消息确认机制 来确保消息的可靠性。

通过 延迟和响应时间监控，计算 ping/pong 往返时间来检查延迟。

处理 错误监控，记录 WebSocket 错误并进行日志分析。

6. gRPC 与 RPC 区别

RPC 是一种通用的通信协议，允许不同机器上的程序通过网络调用远程服务，支持多种协议（如 JSON-RPC、XML-RPC 等）。

gRPC 是 Google 提供的一个高性能的 RPC 框架，使用 HTTP/2 和 Protocol Buffers（Protobuf），支持流式传输、双向通信等特性，适合高性能分布式系统。

7. gRPC 为啥比 Rest 好

性能：gRPC 使用 Protobuf 进行高效的二进制序列化，比 JSON 更小、更快。

双向流：支持双向流式通信，适合实时数据传输。

HTTP/2：支持多路复用、头部压缩等特性，提高了并发处理能力。

接口定义语言：通过 .proto 文件定义接口，支持强类型和跨语言开发。

8. 解决过最复杂的问题

你可以根据自己经验的复杂问题来展示，比如在项目中遇到的 性能瓶颈、分布式系统的同步问题、高并发处理 等问题，如何设计优化方案以及解决过程。