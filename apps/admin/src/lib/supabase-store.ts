import { getDocsDir } from './docs-path'

// Supabase 客户端（懒加载）
let supabase: any = null

/**
 * 获取 Supabase 实例
 */
async function getSupabase(): Promise<any> {
  if (!supabase) {
    try {
      // 动态导入 @supabase/supabase-js
      const { createClient } = await import('@supabase/supabase-js')

      // 只在两个环境变量都存在时才创建客户端
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_ANON_KEY
        )
        console.log('[Supabase Store] Supabase client initialized successfully')
      } else {
        console.warn('[Supabase Store] SUPABASE_URL or SUPABASE_ANON_KEY not configured')
      }
    } catch (error) {
      console.warn('[Supabase Store] Failed to initialize Supabase:', error)
      supabase = null
    }
  }
  return supabase
}

/**
 * 检查是否配置了 Supabase
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
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
 * 获取所有文档（元数据）
 */
export async function getAllDocs(): Promise<DocMetadata[]> {
  const client = await getSupabase()
  if (!client) {
    return []
  }

  try {
    // @ts-ignore - Supabase 客户端
    const { data, error } = await client
      .from('docs')
      .select('slug, title, description, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Supabase Store] Failed to get docs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[Supabase Store] Failed to get docs:', error)
    return []
  }
}

/**
 * 获取文档
 */
export async function getDoc(slug: string): Promise<Doc | null> {
  const client = await getSupabase()
  if (!client) {
    return null
  }

  try {
    // @ts-ignore
    const { data, error } = await client
      .from('docs')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 文档不存在
        return null
      }
      console.error(`[Supabase Store] Failed to get doc ${slug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`[Supabase Store] Failed to get doc ${slug}:`, error)
    return null
  }
}

/**
 * 创建文档
 */
export async function createDoc(slug: string, title: string, content: string): Promise<boolean> {
  const client = await getSupabase()
  if (!client) {
    return false
  }

  try {
    const now = new Date().toISOString()

    const doc: Partial<Doc> = {
      slug,
      title,
      content,
      created_at: now,
      updated_at: now,
    }

    // @ts-ignore
    const { error } = await client.from('docs').insert(doc)

    if (error) {
      console.error(`[Supabase Store] Failed to create doc ${slug}:`, error)
      return false
    }

    console.log(`[Supabase Store] Created doc: ${slug}`)
    return true
  } catch (error) {
    console.error(`[Supabase Store] Failed to create doc ${slug}:`, error)
    return false
  }
}

/**
 * 更新文档
 */
export async function updateDoc(slug: string, title: string, content: string): Promise<boolean> {
  const client = await getSupabase()
  if (!client) {
    return false
  }

  try {
    // @ts-ignore
    const { error } = await client
      .from('docs')
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)

    if (error) {
      console.error(`[Supabase Store] Failed to update doc ${slug}:`, error)
      return false
    }

    console.log(`[Supabase Store] Updated doc: ${slug}`)
    return true
  } catch (error) {
    console.error(`[Supabase Store] Failed to update doc ${slug}:`, error)
    return false
  }
}

/**
 * 删除文档（移动到回收站）
 */
export async function deleteDoc(slug: string): Promise<boolean> {
  const client = await getSupabase()
  if (!client) {
    return false
  }

  try {
    // 先获取文档
    const doc = await getDoc(slug)
    if (!doc) {
      console.warn(`[Supabase Store] Doc ${slug} not found for deletion`)
      return false
    }

    const timestamp = new Date().toISOString()

    // 创建回收站条目
    const trashDoc: Partial<TrashDoc> = {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      trash_timestamp: timestamp,
    }

    // @ts-ignore
    const { error: insertError } = await client.from('trash').insert(trashDoc)

    if (insertError) {
      console.error(`[Supabase Store] Failed to move to trash:`, insertError)
      return false
    }

    // 删除文档
    // @ts-ignore
    const { error: deleteError } = await client.from('docs').delete().eq('slug', slug)

    if (deleteError) {
      console.error(`[Supabase Store] Failed to delete doc:`, deleteError)
      return false
    }

    console.log(`[Supabase Store] Moved doc to trash: ${slug}`)
    return true
  } catch (error) {
    console.error(`[Supabase Store] Failed to delete doc ${slug}:`, error)
    return false
  }
}

/**
 * 获取回收站文档
 */
export async function getTrashDocs(): Promise<TrashDoc[]> {
  const client = await getSupabase()
  if (!client) {
    return []
  }

  try {
    // @ts-ignore
    const { data, error } = await client
      .from('trash')
      .select('*')
      .order('trash_timestamp', { ascending: false })

    if (error) {
      console.error('[Supabase Store] Failed to get trash:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[Supabase Store] Failed to get trash:', error)
    return []
  }
}

/**
 * 从回收站恢复文档
 */
export async function restoreDoc(slug: string, trashTimestamp: string): Promise<boolean> {
  const client = await getSupabase()
  if (!client) {
    return false
  }

  try {
    // @ts-ignore
    const { data: trashDoc, error: getError } = await client
      .from('trash')
      .select('*')
      .eq('slug', slug)
      .eq('trash_timestamp', trashTimestamp)
      .single()

    if (getError || !trashDoc) {
      console.warn(`[Supabase Store] Trash item ${slug}:${trashTimestamp} not found`)
      return false
    }

    // 创建新文档
    const newDoc: Partial<Doc> = {
      slug,
      title: trashDoc.title,
      content: trashDoc.content,
      created_at: trashDoc.created_at,
      updated_at: new Date().toISOString(),
    }

    // @ts-ignore
    const { error: insertError } = await client.from('docs').insert(newDoc)

    if (insertError) {
      console.error(`[Supabase Store] Failed to restore doc:`, insertError)
      return false
    }

    // 删除回收站条目
    // @ts-ignore
    const { error: deleteError } = await client
      .from('trash')
      .delete()
      .eq('slug', slug)
      .eq('trash_timestamp', trashTimestamp)

    if (deleteError) {
      console.warn(`[Supabase Store] Failed to delete from trash:`, deleteError)
    }

    console.log(`[Supabase Store] Restored doc from trash: ${slug}`)
    return true
  } catch (error) {
    console.error(`[Supabase Store] Failed to restore doc ${slug}:`, error)
    return false
  }
}

/**
 * 从回收站永久删除
 */
export async function deleteFromTrash(slug: string, trashTimestamp: string): Promise<boolean> {
  const client = await getSupabase()
  if (!client) {
    return false
  }

  try {
    // @ts-ignore
    const { error } = await client
      .from('trash')
      .delete()
      .eq('slug', slug)
      .eq('trash_timestamp', trashTimestamp)

    if (error) {
      console.error(`[Supabase Store] Failed to delete from trash:`, error)
      return false
    }

    console.log(`[Supabase Store] Deleted from trash: ${slug}`)
    return true
  } catch (error) {
    console.error(`[Supabase Store] Failed to delete from trash:`, error)
    return false
  }
}
