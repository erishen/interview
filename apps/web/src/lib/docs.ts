import fs from 'fs';
import path from 'path';

export interface Doc {
  slug: string;
  title: string;
  description?: string;
}

const DOCS_DIR = path.join(process.cwd(), '../../docs');

export function getAllDocs(): Doc[] {
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

export function getDocBySlug(slug: string): string | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.readFileSync(filePath, 'utf-8');
}
