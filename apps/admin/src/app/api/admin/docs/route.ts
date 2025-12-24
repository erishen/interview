import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), '../../docs')

// 获取文档列表
export async function GET() {
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      return NextResponse.json({ success: false, error: 'Docs directory not found' }, { status: 404 })
    }

    const files = fs.readdirSync(DOCS_DIR)
    const docs = files
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '')
        const filePath = path.join(DOCS_DIR, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : slug
        
        const descMatch = content.match(/^> (.+)$/m)
        const description = descMatch ? descMatch[1] : undefined

        return { slug, title, description }
      })

    return NextResponse.json({ success: true, docs })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load docs' }, { status: 500 })
  }
}

// 创建新文档
export async function POST(request: NextRequest) {
  try {
    const { slug, title, content } = await request.json()

    if (!slug || !title || !content) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const filePath = path.join(DOCS_DIR, `${slug}.md`)
    
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Document already exists' }, { status: 409 })
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return NextResponse.json({ success: true, message: 'Document created' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create document' }, { status: 500 })
  }
}
