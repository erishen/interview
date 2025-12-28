/**
 * 将本地 docs 目录中的 Markdown 文件导入到 Supabase
 * 运行方式: npx ts-node scripts/import-docs-to-supabase.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.vercel') })

import { createClient } from '@supabase/supabase-js'

// Supabase 配置（支持多种环境变量名）
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^['"]|['"]$/g, '')
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/^['"]|['"]$/g, '')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量: SUPABASE_URL 和 SUPABASE_ANON_KEY')
  console.error('   SUPABASE_URL:', supabaseUrl)
  console.error('   SUPABASE_ANON_KEY:', supabaseKey ? '✓ 已设置' : '✗ 未设置')
  process.exit(1)
}

console.log('🔗 Supabase URL:', supabaseUrl)

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey)

// Docs 目录路径（从 scripts 目录向上两级到 interview 目录）
const DOCS_DIR = path.join(__dirname, '../../../docs')

/**
 * 从 Markdown 内容中提取标题
 */
function extractTitle(content: string, slug: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : slug
}

/**
 * 从 Markdown 内容中提取描述
 */
function extractDescription(content: string): string | undefined {
  const match = content.match(/^>\s*(.+)$/m)
  return match ? match[1].trim() : undefined
}

/**
 * 获取文件统计信息
 */
function getFileInfo(filePath: string) {
  const stats = fs.statSync(filePath)
  return {
    created_at: stats.birthtime.toISOString(),
    updated_at: stats.mtime.toISOString(),
  }
}

/**
 * 导入单个文档到 Supabase
 */
async function importDoc(filePath: string, slug: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const title = extractTitle(content, slug)
  const description = extractDescription(content)
  const { created_at, updated_at } = getFileInfo(filePath)

  console.log(`📄 导入: ${slug} - ${title}`)

  // 检查文档是否已存在
  const { data: existingDoc } = await supabase
    .from('docs')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existingDoc) {
    // 更新现有文档
    const { error } = await supabase
      .from('docs')
      .update({
        title,
        content,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)

    if (error) {
      console.error(`❌ 更新失败 ${slug}:`, error.message)
      return false
    }

    console.log(`✅ 已更新: ${slug}`)
    return true
  }

  // 创建新文档
  const { error } = await supabase.from('docs').insert({
    slug,
    title,
    content,
    description,
    created_at,
    updated_at,
  })

  if (error) {
    console.error(`❌ 插入失败 ${slug}:`, error.message)
    return false
  }

  console.log(`✅ 已创建: ${slug}`)
  return true
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始导入文档到 Supabase...\n')

  // 检查 docs 目录
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`❌ Docs 目录不存在: ${DOCS_DIR}`)
    process.exit(1)
  }

  // 读取所有 .md 文件
  const files = fs.readdirSync(DOCS_DIR).filter(file => file.endsWith('.md'))

  if (files.length === 0) {
    console.log('❌ Docs 目录中没有 Markdown 文件')
    process.exit(0)
  }

  console.log(`📁 找到 ${files.length} 个 Markdown 文件\n`)

  // 导入每个文件
  let successCount = 0
  let failCount = 0

  for (const file of files) {
    const slug = file.replace(/\.md$/, '')
    const filePath = path.join(DOCS_DIR, file)

    const success = await importDoc(filePath, slug)
    if (success) {
      successCount++
    } else {
      failCount++
    }

    console.log()
  }

  // 显示总结
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 导入完成:`)
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ❌ 失败: ${failCount}`)
  console.log(`   📦 总计: ${files.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(error => {
  console.error('❌ 导入过程中出错:', error)
  process.exit(1)
})
