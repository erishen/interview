# Vercel KV 配置指南

## 为什么使用 Vercel KV？

Vercel Serverless 环境的文件系统是临时的（`/tmp` 目录），每次函数调用结束后会被清空。  
Vercel KV 提供持久化键值存储，适合存储文档内容。

## 配置步骤

### 1. 创建 KV 数据库

在 Vercel 项目中创建 KV 数据库：

```bash
# 方式1：使用 Vercel CLI（推荐）
vercel kv:create

# 方式2：在 Vercel 仪表板中
# 1. 访问 https://vercel.com/your-project/storage
# 2. 点击 "Create Database"
# 3. 选择 "KV" 类型
# 4. 输入数据库名称（如：interview-docs）
```

### 2. 添加环境变量

创建 KV 数据库后，在 Vercel 项目设置中添加以下环境变量：

```bash
KV_REST_API_URL=https://api.vercel-storage.com/v1/...
KV_REST_API_TOKEN=your-kv-rest-api-token-here
```

**获取环境变量：**
```bash
# 在 Vercel 仪表板中：
# 1. 访问项目设置 → Environment Variables
# 2. 添加 KV_REST_API_URL 和 KV_REST_API_TOKEN
# 3. 选择环境：Production, Preview, Development
```

### 3. 重新部署

配置环境变量后，重新部署项目：

```bash
vercel --prod
```

或在 Vercel 仪表板中点击 "Redeploy" 按钮。

## 验证配置

部署成功后，在 Vercel 函数日志中查看：

```
[KV Store] Vercel KV initialized successfully
```

如果看到这条日志，说明 KV 配置成功！

## 费用

Vercel KV 免费套餐（完全够用）：
- **256 MB 存储**
- **100,000 次读取/天**
- **1,000 次写入/天**

## 工作原理

### 文档存储

```
docs:list → 文档 slug 列表（数组）
doc:{slug} → 单个文档内容（JSON）
trash:list → 回收站文件列表
trash:{slug}:{timestamp} → 回收站文件
```

### 操作流程

1. **创建文档** (`POST /api/admin/docs`)
   - 调用 `kvCreateDoc(slug, title, content)`
   - 将文档内容存储到 `doc:{slug}`
   - 将 slug 添加到 `docs:list`

2. **获取文档列表** (`GET /api/admin/docs`)
   - 调用 `getAllDocs()`
   - 从 `docs:list` 读取所有 slug
   - 从 `doc:{slug}` 读取每个文档的元数据

3. **更新文档** (`PUT /api/admin/docs/{slug}`)
   - 调用 `kvUpdateDoc(slug, title, content)`
   - 更新 `doc:{slug}` 的内容
   - 更新 `updated_at` 时间戳

4. **删除文档** (`DELETE /api/admin/docs/{slug}`)
   - 调用 `kvDeleteDoc(slug)`
   - 将文档移动到回收站（`trash:{slug}:{timestamp}`）
   - 从 `docs:list` 移除 slug
   - 添加到 `trash:list`

5. **恢复文档** (`PATCH /api/admin/docs/{slug}`)
   - 调用 `kvRestoreDoc(slug, trashTimestamp)`
   - 从回收站复制回 `doc:{slug}`
   - 添加回 `docs:list`
   - 从 `trash:list` 移除

## 故障排查

### KV 初始化失败

如果看到 `Failed to initialize Vercel KV` 错误：

1. 检查环境变量是否正确：
   ```bash
   vercel env ls
   ```

2. 确保 KV 数据库已创建：
   ```bash
   vercel kv ls
   ```

3. 查看 Vercel 函数日志

### 只读模式

如果看到 `Running in Vercel Serverless (read-only mode)` 警告：

- 说明 KV 未正确配置
- 文档操作将不会持久化
- 请按照上述步骤配置 KV

## 性能优化

### 批量操作

Vercel KV 支持批量操作，可以提升性能：

```typescript
// 批量获取文档
const slugs = await client.get<string[]>('docs:list')
const docs = await client.getMany<Doc[]>(
  slugs.map(slug => `doc:${slug}`)
)
```

### 过期策略

当前实现不会设置文档过期时间，但可以添加：

```typescript
await client.set(`doc:${slug}`, doc, { 
  ttl: 30 * 24 * 60 * 60  // 30天
})
```

## 参考资料

- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)
- [@vercel/kv npm 包](https://github.com/vercel/storage/tree/main/packages/kv)
- [定价页面](https://vercel.com/docs/storage/vercel-kv/pricing)
