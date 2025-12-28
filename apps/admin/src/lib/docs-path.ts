import * as fs from 'fs'
import * as path from 'path'

/**
 * 动态获取只读的 docs 目录路径，支持本地开发和 Vercel 部署
 * 在 monorepo 环境下，docs 目录位于根目录
 */
export function getDocsDir(): string {
  const possiblePaths = [
    // Vercel 部署：docs 复制到 .next 目录（只读）
    path.join(process.cwd(), '.next/docs'),
    // Vercel 部署：docs 在根目录
    path.join(process.cwd(), 'docs'),
    // 本地开发：从 apps/admin 向上两级
    path.join(process.cwd(), '../../docs'),
    // 备选路径
    path.join(__dirname, '../../../../docs'),
  ]

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath
    }
  }

  // 如果都不存在，返回第一个（用于错误提示）
  return possiblePaths[0]
}

/**
 * 获取可写的 docs 目录路径
 * 在 Vercel 生产环境中，使用本地文件系统（仅演示用，不持久化）
 * 生产环境应该使用 FastAPI 后端或 Vercel KV 等持久化存储
 */
export function getWritableDocsDir(): string {
  const docsDir = getDocsDir()

  // 在 Vercel 上，返回只读目录（写入会失败，但可以读取）
  if (process.env.VERCEL === '1') {
    console.log('[Docs] Vercel environment detected')
    console.log('[Docs] Using read-only docs directory')
    console.log('[Docs] WARNING: File modifications will NOT persist in Vercel Serverless')
    console.log('[Docs] Please use FastAPI backend or Vercel KV for production')
    return docsDir
  }

  // 本地开发直接使用原始 docs 目录
  return docsDir
}

/**
 * 检查是否在只读模式（Vercel）
 * 注意：如果配置了 Vercel KV，就不是只读模式
 */
export function isReadOnlyMode(): boolean {
  return process.env.VERCEL === '1' && !process.env.KV_REST_API_URL
}

/**
 * 确保目录存在，不存在则创建
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 获取可写的存储目录
 * 在 Vercel 生产环境中，使用 /tmp 目录来存储临时数据
 */
export function getWritableDir(subDir: string): string {
  const baseWritableDir = getWritableDocsDir()
  const targetDir = path.join(baseWritableDir, subDir)

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  return targetDir
}

/**
 * 安全地创建子目录（如果父目录存在）
 * 在 Vercel 生产环境中，使用 /tmp 目录来存储回收站/版本数据
 */
export function ensureDocsSubdir(subDir: string): string | null {
  try {
    return getWritableDir(subDir)
  } catch (error) {
    console.warn(`[Docs] Failed to create directory ${subDir}:`, error)
    return null
  }
}

/**
 * 初始化可写的 docs 目录（从只读目录复制初始文件）
 * 仅在首次运行时执行
 */
export function initializeWritableDocs(): void {
  if (process.env.VERCEL === '1') {
    const readOnlyDocs = getDocsDir()
    const writableDocs = getWritableDocsDir()

    // 如果可写目录为空，从只读目录复制初始文件
    try {
      const files = fs.readdirSync(writableDocs)
      if (files.length === 0) {
        console.log('[Docs] Initializing writable docs directory...')
        copyDir(readOnlyDocs, writableDocs)
      }
    } catch (error) {
      console.warn('[Docs] Failed to initialize writable docs:', error)
    }
  }
}

/**
 * 递归复制目录
 */
function copyDir(src: string, dest: string): void {
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}
