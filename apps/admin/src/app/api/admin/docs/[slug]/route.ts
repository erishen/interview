import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DOCS_DIR = path.join(process.cwd(), '../../docs')

// 获取单个文档内容
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const filePath = path.join(DOCS_DIR, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    
    // 提取标题和描述
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : slug
    
    const descMatch = content.match(/^> (.+)$/m)
    const description = descMatch ? descMatch[1] : undefined

    return NextResponse.json({ 
      success: true, 
      doc: { 
        slug, 
        title, 
        description,
        content 
      } 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load document' }, { status: 500 })
  }
}

// 更新文档
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    const filePath = path.join(DOCS_DIR, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    return NextResponse.json({ success: true, message: 'Document updated' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update document' }, { status: 500 })
  }
}

// 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const filePath = path.join(DOCS_DIR, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true, message: 'Document deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 })
  }
}
