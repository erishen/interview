'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@interview/ui'

interface Doc {
  slug: string
  title: string
  description?: string
  content?: string
}

export default function DocEditorPage() {
  const router = useRouter()
  
  const [docs, setDocs] = useState<Doc[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // 加载文档列表
  const loadDocs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/docs')
      const data = await response.json()
      if (data.success) {
        setDocs(data.docs)
      }
    } catch (error) {
      showMessage('error', '加载文档列表失败')
    }
    setLoading(false)
  }

  // 加载文档内容
  const loadDocContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/docs/${slug}`)
      const data = await response.json()
      if (data.success) {
        setSelectedDoc(data.doc)
        setContent(data.doc.content || '')
      }
    } catch (error) {
      showMessage('error', '加载文档内容失败')
    }
  }

  // 保存文档
  const saveDoc = async () => {
    if (!selectedDoc) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/docs/${selectedDoc.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '文档保存成功！')
      } else {
        showMessage('error', data.error || '保存失败')
      }
    } catch (error) {
      showMessage('error', '保存文档失败')
    }
    setSaving(false)
  }

  // 创建新文档
  const createDoc = async () => {
    const slug = prompt('请输入新文档的文件名（不含 .md 后缀）:')
    if (!slug) return

    try {
      const response = await fetch('/api/admin/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title: '新文档', content: '# 新文档\n\n开始编写内容...' }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '文档创建成功！')
        loadDocs()
      } else {
        showMessage('error', data.error || '创建失败')
      }
    } catch (error) {
      showMessage('error', '创建文档失败')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  useEffect(() => {
    loadDocs()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">📝 文档编辑器</h1>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              返回 Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 文档列表 */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">文档列表</h2>
                  <div className="space-x-2">
                    <Button onClick={loadDocs} size="sm" variant="outline">刷新</Button>
                    <Button onClick={createDoc} size="sm">新建</Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">加载中...</div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {docs.map((doc) => (
                      <div
                        key={doc.slug}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedDoc?.slug === doc.slug
                            ? 'bg-blue-100 border-blue-300 border'
                            : 'hover:bg-gray-100 border'
                        }`}
                        onClick={() => loadDocContent(doc.slug)}
                      >
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-600">{doc.slug}.md</div>
                      </div>
                    ))}
                    {docs.length === 0 && (
                      <div className="text-center py-4 text-gray-500">暂无文档</div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* 编辑器 */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                {selectedDoc ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedDoc.title}</h2>
                        <div className="text-sm text-gray-500">{selectedDoc.slug}.md</div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          onClick={saveDoc}
                          disabled={saving}
                        >
                          {saving ? '保存中...' : '保存'}
                        </Button>
                        <Button
                          onClick={() => window.open(`${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/docs/${selectedDoc.slug}`, '_blank')}
                          variant="outline"
                        >
                          预览
                        </Button>
                      </div>
                    </div>

                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-[calc(100vh-350px)] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="开始编辑文档..."
                      spellCheck={false}
                    />
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-500">
                    <div className="text-6xl mb-4">📄</div>
                    <p>请从左侧选择一个文档开始编辑</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
