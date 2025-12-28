import { getDocsDir } from './docs-path'

// Vercel KV 客户端（懒加载）
let kv: any = null

/**
 * 获取 Vercel KV 实例
 */
async function getKV(): Promise<any> {
  if (!kv) {
    try {
      // 动态导入 @vercel/kv（仅在 Vercel 环境中可用）
      const { createClient } = await import('@vercel/kv')

      // 优先使用 Vercel KV 环境变量
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        kv = createClient({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        })
        console.log('[KV Store] Vercel KV initialized successfully')
      }
      // 回退到标准 Redis URL
      else if (process.env.REDIS_URL) {
        kv = createClient({
          url: process.env.REDIS_URL,
        })
        console.log('[KV Store] Redis client initialized successfully')
      } else {
        console.warn('[KV Store] No Redis/KV configuration found')
      }
    } catch (error) {
      console.warn('[KV Store] Failed to initialize KV client:', error)
      kv = null
    }
  }
  return kv
}

/**
 * 检查是否配置了 Redis（Vercel KV 或标准 Redis）
 */
export function isKVConfigured(): boolean {
  return !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    process.env.REDIS_URL
  )
}

/**
 * 文档元数据接口
 */
export interface DocMetadata {
  slug: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Doc extends DocMetadata {
  content: string
}

export interface TrashDoc extends Doc {
  trash_timestamp: string
}

/**
 * 文档列表键
 */
const DOC_LIST_KEY = 'docs:list'

/**
 * 文档内容键前缀
 */
const DOC_KEY_PREFIX = 'doc:'

/**
 * 回收站列表键
 */
const TRASH_LIST_KEY = 'trash:list'

/**
 * 回收站键前缀
 */
const TRASH_KEY_PREFIX = 'trash:'

/**
 * 获取文档列表
 */
export async function getDocsList(): Promise<string[]> {
  if (!isKVConfigured()) {
    return []
  }

  const client = await getKV()
  if (!client) {
    return []
  }

  try {
    // @ts-ignore - @vercel/kv 类型定义不完整
    const slugs = await client.get(DOC_LIST_KEY) as string[] | null
    return slugs || []
  } catch (error) {
    console.error('[KV Store] Failed to get docs list:', error)
    return []
  }
}

/**
 * 设置文档列表
 */
async function setDocsList(slugs: string[]): Promise<void> {
  const client = await getKV()
  if (!client) {
    return
  }

  try {
    // @ts-ignore
    await client.set(DOC_LIST_KEY, slugs)
  } catch (error) {
    console.error('[KV Store] Failed to set docs list:', error)
  }
}

/**
 * 获取回收站列表
 */
export async function getTrashList(): Promise<string[]> {
  const client = await getKV()
  if (!client) {
    return []
  }

  try {
    // @ts-ignore
    const items = await client.get(TRASH_LIST_KEY) as string[] | null
    return items || []
  } catch (error) {
    console.error('[KV Store] Failed to get trash list:', error)
    return []
  }
}

/**
 * 设置回收站列表
 */
async function setTrashList(items: string[]): Promise<void> {
  const client = await getKV()
  if (!client) {
    return
  }

  try {
    // @ts-ignore
    await client.set(TRASH_LIST_KEY, items)
  } catch (error) {
    console.error('[KV Store] Failed to set trash list:', error)
  }
}

/**
 * 获取文档
 */
export async function getDoc(slug: string): Promise<Doc | null> {
  const client = await getKV()
  if (!client) {
    return null
  }

  try {
    // @ts-ignore
    const doc = await client.get(`${DOC_KEY_PREFIX}${slug}`) as Doc | null
    return doc
  } catch (error) {
    console.error(`[KV Store] Failed to get doc ${slug}:`, error)
    return null
  }
}

/**
 * 获取所有文档（元数据）
 */
export async function getAllDocs(): Promise<DocMetadata[]> {
  const slugs = await getDocsList()
  const docs: DocMetadata[] = []

  for (const slug of slugs) {
    const doc = await getDoc(slug)
    if (doc) {
      docs.push({
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
      })
    }
  }

  return docs
}

/**
 * 创建文档
 */
export async function createDoc(slug: string, title: string, content: string): Promise<boolean> {
  const client = await getKV()
  if (!client) {
    return false
  }

  try {
    const now = new Date().toISOString()

    const doc: Doc = {
      slug,
      title,
      content,
      created_at: now,
      updated_at: now,
    }

    // 保存文档
    // @ts-ignore
    await client.set(`${DOC_KEY_PREFIX}${slug}`, doc)

    // 更新文档列表
    const slugs = await getDocsList()
    if (!slugs.includes(slug)) {
      slugs.push(slug)
      await setDocsList(slugs)
    }

    console.log(`[KV Store] Created doc: ${slug}`)
    return true
  } catch (error) {
    console.error(`[KV Store] Failed to create doc ${slug}:`, error)
    return false
  }
}

/**
 * 更新文档
 */
export async function updateDoc(slug: string, title: string, content: string): Promise<boolean> {
  const client = await getKV()
  if (!client) {
    return false
  }

  try {
    const existingDoc = await getDoc(slug)
    if (!existingDoc) {
      console.warn(`[KV Store] Doc ${slug} not found for update`)
      return false
    }

    const updatedDoc: Doc = {
      ...existingDoc,
      title,
      content,
      updated_at: new Date().toISOString(),
    }

    // 更新文档
    // @ts-ignore
    await client.set(`${DOC_KEY_PREFIX}${slug}`, updatedDoc)

    console.log(`[KV Store] Updated doc: ${slug}`)
    return true
  } catch (error) {
    console.error(`[KV Store] Failed to update doc ${slug}:`, error)
    return false
  }
}

/**
 * 删除文档（移动到回收站）
 */
export async function deleteDoc(slug: string): Promise<boolean> {
  const client = await getKV()
  if (!client) {
    return false
  }

  try {
    const doc = await getDoc(slug)
    if (!doc) {
      console.warn(`[KV Store] Doc ${slug} not found for deletion`)
      return false
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const trashId = `${slug}:${timestamp}`

    // 创建回收站条目
    const trashDoc: TrashDoc = {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      trash_timestamp: timestamp,
    }

    // @ts-ignore
    await client.set(`${TRASH_KEY_PREFIX}${trashId}`, trashDoc)

    // 更新回收站列表
    const trashItems = await getTrashList()
    if (!trashItems.includes(trashId)) {
      trashItems.push(trashId)
      await setTrashList(trashItems)
    }

    // 从文档列表中移除
    const slugs = await getDocsList()
    const newSlugs = slugs.filter(s => s !== slug)
    await setDocsList(newSlugs)

    // 删除文档
    // @ts-ignore
    await client.del(`${DOC_KEY_PREFIX}${slug}`)

    console.log(`[KV Store] Moved doc to trash: ${slug}`)
    return true
  } catch (error) {
    console.error(`[KV Store] Failed to delete doc ${slug}:`, error)
    return false
  }
}

/**
 * 获取回收站文档
 */
export async function getTrashDocs(): Promise<TrashDoc[]> {
  const items = await getTrashList()
  const docs: TrashDoc[] = []

  for (const item of items) {
    try {
      // @ts-ignore
      const doc = await client.get(`${TRASH_KEY_PREFIX}${item}`) as TrashDoc | null
      if (doc) {
        docs.push(doc)
      }
    } catch (error) {
      console.error(`[KV Store] Failed to get trash item ${item}:`, error)
    }
  }

  return docs.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/**
 * 从回收站恢复文档
 */
export async function restoreDoc(slug: string, trashTimestamp: string): Promise<boolean> {
  const client = await getKV()
  if (!client) {
    return false
  }

  try {
    const trashId = `${slug}:${trashTimestamp}`
    // @ts-ignore
    const trashDoc = await client.get(`${TRASH_KEY_PREFIX}${trashId}`) as TrashDoc | null

    if (!trashDoc) {
      console.warn(`[KV Store] Trash item ${trashId} not found`)
      return false
    }

    // 从回收站列表中移除
    const trashItems = await getTrashList()
    const newTrashItems = trashItems.filter(item => item !== trashId)
    await setTrashList(newTrashItems)

    // 删除回收站条目
    // @ts-ignore
    await client.del(`${TRASH_KEY_PREFIX}${trashId}`)

    // 创建新文档
    const newDoc: Doc = {
      slug,
      title: trashDoc.title,
      content: trashDoc.content,
      created_at: trashDoc.created_at,
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore
    await client.set(`${DOC_KEY_PREFIX}${slug}`, newDoc)

    // 添加到文档列表
    const slugs = await getDocsList()
    if (!slugs.includes(slug)) {
      slugs.push(slug)
      await setDocsList(slugs)
    }

    console.log(`[KV Store] Restored doc from trash: ${slug}`)
    return true
  } catch (error) {
    console.error(`[KV Store] Failed to restore doc ${slug}:`, error)
    return false
  }
}

/**
 * 从回收站永久删除
 */
export async function deleteFromTrash(slug: string, trashTimestamp: string): Promise<boolean> {
  const client = await getKV()
  if (!client) {
    return false
  }

  try {
    const trashId = `${slug}:${trashTimestamp}`

    // 从回收站列表中移除
    const trashItems = await getTrashList()
    const newTrashItems = trashItems.filter(item => item !== trashId)
    await setTrashList(newTrashItems)

    // 删除回收站条目
    // @ts-ignore
    await client.del(`${TRASH_KEY_PREFIX}${trashId}`)

    console.log(`[KV Store] Deleted doc from trash: ${trashId}`)
    return true
  } catch (error) {
    console.error(`[KV Store] Failed to delete from trash ${trashId}:`, error)
    return false
  }
}
