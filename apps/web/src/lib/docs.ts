import fs from 'fs';
import path from 'path';

export interface Doc {
  slug: string;
  title: string;
  description?: string;
}

const DOCS_DIR = path.join(process.cwd(), '../../docs');

// Admin API 配置
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3003';
const DOCS_API_ENDPOINT = `${ADMIN_API_URL}/api/docs-public`; // 使用公开 API，无需认证

// 是否为生产环境
const isProduction = process.env.NODE_ENV === 'production';

// 是否为构建时（静态生成）
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                     process.env.NEXT_PHASE === 'phase-development-build';

// 从 Admin API 获取文档列表
async function fetchDocsFromAdmin(): Promise<Doc[]> {
  // 构建时不请求 Admin API，直接返回空数组
  if (isBuildTime) {
    console.log('[Docs API] Build time detected, skipping Admin API fetch');
    return [];
  }

  try {
    const response = await fetch(DOCS_API_ENDPOINT, {
      next: { revalidate: 60 }, // 缓存 60 秒
    });

    if (!response.ok) {
      console.error(`[Docs API] Failed to fetch docs: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.success ? data.docs : [];
  } catch (error) {
    console.error('[Docs API] Error fetching docs from Admin:', error);
    return [];
  }
}

// 从 Admin API 获取单个文档
async function fetchDocFromAdmin(slug: string): Promise<string | null> {
  // 构建时不请求 Admin API，直接返回 null
  if (isBuildTime) {
    console.log('[Docs API] Build time detected, skipping Admin API fetch');
    return null;
  }

  try {
    const response = await fetch(`${DOCS_API_ENDPOINT}/${slug}`, {
      next: { revalidate: 60 }, // 缓存 60 秒
    });

    if (!response.ok) {
      console.error(`[Docs API] Failed to fetch doc ${slug}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.success ? data.doc.content : null;
  } catch (error) {
    console.error(`[Docs API] Error fetching doc ${slug} from Admin:`, error);
    return null;
  }
}

// 从本地文件系统获取文档列表（开发环境回退）
function getLocalDocs(): Doc[] {
  if (!fs.existsSync(DOCS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(DOCS_DIR);
  const docs = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');

      // Extract title from first h1 or use slug
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      // Extract description from first paragraph after title
      const descMatch = content.match(/^> (.+)$/m);
      const description = descMatch ? descMatch[1] : undefined;

      return { slug, title, description };
    });

  return docs.sort((a, b) => a.title.localeCompare(b.title));
}

// 从本地文件系统获取单个文档（开发环境回退）
function getLocalDocBySlug(slug: string): string | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath, 'utf-8');
}

// 获取所有文档（构建时优先本地，生产环境优先 Admin API，失败则降级）
export async function getAllDocs(): Promise<Doc[]> {
  // 构建时或开发环境：优先本地文件
  if (isBuildTime || !isProduction) {
    const localDocs = getLocalDocs();
    if (localDocs.length > 0) {
      return localDocs;
    }
    // 如果本地没有文档，尝试从 Admin 获取
    const adminDocs = await fetchDocsFromAdmin();
    return adminDocs.length > 0 ? adminDocs : [];
  }

  // 生产环境：优先从 Admin API，失败则降级到本地文件
  const adminDocs = await fetchDocsFromAdmin();
  if (adminDocs.length > 0) {
    return adminDocs;
  }
  // Admin API 返回空，降级到本地文件
  console.log('[Docs API] Admin returned empty, falling back to local files');
  return getLocalDocs();
}

// 获取单个文档（构建时优先本地，生产环境优先 Admin API，失败则降级）
export async function getDocBySlug(slug: string): Promise<string | null> {
  // 构建时或开发环境：优先本地文件
  if (isBuildTime || !isProduction) {
    const localDoc = getLocalDocBySlug(slug);
    if (localDoc) {
      return localDoc;
    }
    // 如果本地没有，尝试从 Admin 获取
    return await fetchDocFromAdmin(slug);
  }

  // 生产环境：优先从 Admin API，失败则降级到本地文件
  const adminDoc = await fetchDocFromAdmin(slug);
  if (adminDoc) {
    return adminDoc;
  }
  // Admin API 没有该文档，降级到本地文件
  console.log(`[Docs API] Admin returned null for ${slug}, falling back to local file`);
  return getLocalDocBySlug(slug);
}

// 同步版本（用于客户端组件）
export function getAllDocsSync(): Doc[] {
  return getLocalDocs();
}

export function getDocBySlugSync(slug: string): string | null {
  return getLocalDocBySlug(slug);
}
