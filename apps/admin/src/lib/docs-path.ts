import fs from 'fs'
import path from 'path'

/**
 * 动态获取 docs 目录路径，支持本地开发和 Vercel 部署
 * 在 monorepo 环境下，docs 目录位于根目录
 */
export function getDocsDir(): string {
  const possiblePaths = [
    // Vercel 部署：docs 复制到 .next 目录
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
  // 在 Vercel 上使用 /tmp 目录
  if (process.env.VERCEL === '1') {
    const tmpDir = path.join('/tmp', `interview-docs-${subDir}`)
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }
    return tmpDir
  }

  // 本地开发使用 docs 目录下的子目录
  const docsDir = getDocsDir()
  const targetDir = path.join(docsDir, subDir)
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
