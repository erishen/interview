'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Card, Input } from '@interview/ui'

interface Doc {
  slug: string
  title: string
  description?: string
  content?: string
  created_at?: string
  updated_at?: string
}

interface DocVersion {
  id: string
  doc_slug: string
  content: string
  message: string
  author: string
  created_at: string
}

export default function DocEditorPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user: passportUser } = useAuth()

  // 检查是否已登录（NextAuth 或 Passport.js）
  const isAuthenticated = status === 'authenticated' || !!passportUser

  // 获取请求头（用于 Passport.js 认证）
  const getAuthHeaders = (): Record<string, string> => {
    if (passportUser) {
      return {
        'X-User-Id': passportUser.id,
        'X-User-Email': passportUser.email,
      }
    }
    return {}
  }

  const [docs, setDocs] = useState<Doc[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showTrash, setShowTrash] = useState(false)

  // 创建文档模态框
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDocSlug, setNewDocSlug] = useState('')
  const [newDocTitle, setNewDocTitle] = useState('')

  // 删除确认模态框
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [docToDelete, setDocToDelete] = useState<Doc | null>(null)

  // 版本历史相关
  const [showVersionsModal, setShowVersionsModal] = useState(false)
  const [versions, setVersions] = useState<DocVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<DocVersion | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersion1, setCompareVersion1] = useState<DocVersion | null>(null)
  const [compareVersion2, setCompareVersion2] = useState<DocVersion | null>(null)

  // 检查登录状态 - 不再自动跳转，让用户主动选择
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/auth/signin?redirect=/docs-editor')
  //   }
  // }, [status, session, passportUser, isAuthenticated, router])

  // 加载文档列表
  const loadDocs = async () => {
    setLoading(true)
    try {
      const trashParam = showTrash ? '?trash=true' : ''
      const response = await fetch(`/api/admin/docs${trashParam}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          ...getAuthHeaders(),
        },
      })
      const data = await response.json()
      if (data.success) {
        setDocs(data.docs)
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '加载文档列表失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Load docs error:', error)
      showMessage('error', '加载文档列表失败')
    }
    setLoading(false)
  }

  // 加载文档内容
  const loadDocContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/docs/${slug}`, {
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      })
      const data = await response.json()
      if (data.success) {
        setSelectedDoc(data.doc)
        setContent(data.doc.content || '')
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '加载文档内容失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Load doc content error:', error)
      showMessage('error', '加载文档内容失败')
    }
  }

  // 加载版本列表
  const loadVersions = async () => {
    if (!selectedDoc) return

    try {
      const response = await fetch(`/api/admin/docs/${selectedDoc.slug}/versions`, {
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      })
      const data = await response.json()
      if (data.success) {
        setVersions(data.versions)
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '加载版本列表失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Load versions error:', error)
      showMessage('error', '加载版本列表失败')
    }
  }

  // 恢复到指定版本
  const revertToVersion = async (versionId: string) => {
    if (!selectedDoc) return

    try {
      const response = await fetch(`/api/admin/docs/${selectedDoc.slug}/versions/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ version_id: versionId }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '已恢复到该版本！')
        setShowVersionsModal(false)
        setSelectedVersion(null)
        setCompareMode(false)
        loadDocContent(selectedDoc.slug)
        loadVersions()
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '恢复版本失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Revert version error:', error)
      showMessage('error', '恢复版本失败')
    }
  }

  // 保存文档
  const saveDoc = async () => {
    if (!selectedDoc) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/docs/${selectedDoc.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '文档保存成功！')
        loadDocs() // 刷新列表以更新标题等元数据
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '保存失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Save doc error:', error)
      showMessage('error', '保存文档失败')
    }
    setSaving(false)
  }

  // 创建新文档
  const createDoc = async () => {
    if (!newDocSlug.trim() || !newDocTitle.trim()) {
      showMessage('error', '请填写文件名和标题')
      return
    }

    const slug = newDocSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')

    try {
      const response = await fetch('/api/admin/docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ slug, title: newDocTitle.trim(), content: `# ${newDocTitle.trim()}\n\n开始编写内容...` }),
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '文档创建成功！')
        setShowCreateModal(false)
        setNewDocSlug('')
        setNewDocTitle('')
        // 刷新列表后自动选中新创建的文档
        await loadDocs()
        loadDocContent(slug)
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '创建失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Create doc error:', error)
      showMessage('error', '创建文档失败')
    }
  }

  // 删除文档
  const deleteDoc = async () => {
    if (!docToDelete) return

    try {
      const response = await fetch(`/api/admin/docs/${docToDelete.slug}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...getAuthHeaders(),
        },
      })
      const data = await response.json()
      if (data.success) {
        showMessage('success', '文档删除成功！')
        setShowDeleteModal(false)
        setDocToDelete(null)
        if (selectedDoc?.slug === docToDelete.slug) {
          setSelectedDoc(null)
          setContent('')
        }
        loadDocs()
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '删除失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Delete doc error:', error)
      showMessage('error', '删除文档失败')
    }
  }

  // 恢复文档
  const restoreDoc = async (slug: string) => {
    try {
      console.log('[Docs Editor] Restoring document with slug:', slug)
      const response = await fetch(`/api/admin/docs/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'restore' }),
      })
      const data = await response.json()
      console.log('[Docs Editor] Restore response:', data)
      if (data.success) {
        showMessage('success', '文档恢复成功！')
        loadDocs()
      } else if (response.status === 401) {
        showMessage('error', '请先登录')
        router.push('/auth/signin')
      } else {
        showMessage('error', data.error || '恢复失败')
      }
    } catch (error) {
      console.error('[Docs Editor] Restore doc error:', error)
      showMessage('error', '恢复文档失败')
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // 只在登录后才加载文档
  useEffect(() => {
    if (isAuthenticated) {
      loadDocs()
    }
  }, [isAuthenticated])

  // 当切换回收站时重新加载文档
  useEffect(() => {
    if (isAuthenticated) {
      loadDocs()
      // 切换到回收站时清空选中的文档
      if (showTrash) {
        setSelectedDoc(null)
        setContent('')
      }
    }
  }, [showTrash])

  // 当打开版本历史模态框时加载版本
  useEffect(() => {
    if (showVersionsModal && selectedDoc) {
      loadVersions()
    }
  }, [showVersionsModal, selectedDoc?.slug])

  // 简单的 Markdown 转换（仅用于预览）
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 登录检查 */}
      {status === 'loading' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">检查登录状态...</p>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">需要登录</h2>
            <p className="text-gray-600 mb-4">请登录后访问文档编辑器</p>
            <Button onClick={() => router.push('/auth/signin?redirect=/docs-editor')}>前往登录</Button>
          </div>
        </div>
      )}

      {/* Header */}
      {isAuthenticated && (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">文档编辑器</h1>
                  <p className="text-sm text-gray-500">{session?.user?.name || passportUser?.name}</p>
                </div>
              </div>
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                ← 返回 Dashboard
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      {isAuthenticated && (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg shadow-sm animate-in ${
                message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 文档列表 */}
              <div className="lg:col-span-1">
                <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {showTrash ? '🗑️ 回收站' : '📚 文档列表'}
                    </h2>
                    <div className="flex gap-2">
                      {!showTrash && (
                        <Button onClick={() => setShowCreateModal(true)} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          + 新建
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowTrash(!showTrash)}
                        size="sm"
                        variant={showTrash ? 'outline' : 'ghost'}
                        className={showTrash ? 'text-green-600 border-green-300 hover:bg-green-50' : 'text-gray-500 hover:text-gray-700'}
                      >
                        {showTrash ? '↩ 返回' : '🗑️ 回收站'}
                      </Button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-3 text-gray-500 text-sm">加载中...</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                      {docs.map((doc) => (
                        <div
                          key={doc.slug}
                          className={`p-4 rounded-lg border transition-all group hover:shadow-md ${
                            selectedDoc?.slug === doc.slug
                              ? 'bg-blue-50 border-blue-300 shadow-md'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                          } ${showTrash ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => !showTrash && loadDocContent(doc.slug)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{doc.title}</div>
                              <div className="text-sm text-gray-500 mt-1">{doc.slug}.md</div>
                              {doc.description && (
                                <div className="text-sm text-gray-600 mt-1 truncate">{doc.description}</div>
                              )}
                              {showTrash && doc.created_at && (
                                <div className="text-xs text-gray-400 mt-2">
                                  删除于: {new Date(doc.created_at).toLocaleString('zh-CN')}
                                </div>
                              )}
                            </div>
                            {showTrash ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  restoreDoc(doc.slug)
                                }}
                                className="ml-3 p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors flex-shrink-0"
                                title="恢复文档"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDocToDelete(doc)
                                  setShowDeleteModal(true)
                                }}
                                className="ml-3 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                title="删除文档"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {docs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-5xl mb-3">{showTrash ? '🗑️' : '📭'}</div>
                          <p>{showTrash ? '回收站为空' : '暂无文档'}</p>
                          <p className="text-sm mt-2">
                            {showTrash ? '已删除的文档会显示在这里' : '点击"新建"按钮创建第一个文档'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>

              {/* 编辑器和预览 */}
              <div className="lg:col-span-2 space-y-6">
                {showTrash ? (
                  <Card className="p-12 shadow-lg border-0 bg-white/90 backdrop-blur">
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">回收站模式</h3>
                      <p className="text-gray-600 mb-4">回收站中的文档无法查看或编辑</p>
                      <p className="text-sm text-gray-500">点击文档卡片右侧的"↩"按钮恢复文档到正常列表</p>
                    </div>
                  </Card>
                ) : selectedDoc ? (
                  <>
                    {/* 编辑器 */}
                    <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h2>
                          <div className="text-sm text-gray-500">{selectedDoc.slug}.md</div>
                        </div>
                        <div className="space-x-2">
                          <Button
                            onClick={() => setShowVersionsModal(true)}
                            variant="outline"
                          >
                            📜 版本历史
                          </Button>
                          <Button
                            onClick={saveDoc}
                            disabled={saving}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            {saving ? '保存中...' : '💾 保存'}
                          </Button>
                          <Button
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}/docs/${selectedDoc.slug}`, '_blank')}
                            variant="outline"
                          >
                            👁️ 预览
                          </Button>
                        </div>
                      </div>

                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-[400px] p-4 font-mono text-sm bg-slate-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="开始编辑文档..."
                        spellCheck={false}
                      />
                    </Card>

                    {/* 实时预览 */}
                    <Card className="p-6 shadow-lg border-0 bg-white/90 backdrop-blur">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                        <span className="text-lg font-semibold text-gray-900">👁️ 实时预览</span>
                        <span className="text-xs text-gray-500">（Markdown 渲染）</span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '暂无内容...') }}
                      />
                    </Card>
                  </>
                ) : (
                  <Card className="p-12 shadow-lg border-0 bg-white/90 backdrop-blur">
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">选择一个文档</h3>
                      <p className="text-gray-600">从左侧列表中选择一个文档开始编辑</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 创建文档模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">📝 创建新文档</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文件名</label>
                <Input
                  value={newDocSlug}
                  onChange={(e) => setNewDocSlug(e.target.value)}
                  placeholder="my-doc"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">只允许小写字母、数字和连字符</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <Input
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="我的新文档"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => {
                setShowCreateModal(false)
                setNewDocSlug('')
                setNewDocTitle('')
              }} variant="outline">
                取消
              </Button>
              <Button onClick={createDoc} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && docToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-600 mb-6">
                确定要删除文档 <strong>"{docToDelete.title}"</strong> 吗？
                <br />
                <span className="text-sm text-red-600">此操作不可恢复！</span>
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => {
                  setShowDeleteModal(false)
                  setDocToDelete(null)
                }} variant="outline">
                  取消
                </Button>
                <Button
                  onClick={deleteDoc}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 版本历史模态框 */}
      {showVersionsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">📜 版本历史</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedDoc?.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setCompareMode(!compareMode)
                      setSelectedVersion(null)
                      setCompareVersion1(null)
                      setCompareVersion2(null)
                    }}
                    variant={compareMode ? 'default' : 'outline'}
                    size="sm"
                  >
                    {compareMode ? '🔍 退出对比' : '📊 对比模式'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowVersionsModal(false)
                      setSelectedVersion(null)
                      setCompareMode(false)
                      setCompareVersion1(null)
                      setCompareVersion2(null)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    ✕ 关闭
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {versions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-3">📭</div>
                  <p>暂无历史版本</p>
                  <p className="text-sm mt-2">保存文档后会自动创建版本历史</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 版本列表 */}
                  <div className="space-y-3">
                    {compareMode && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>对比模式：</strong>请选择两个版本进行对比
                          <br />
                          <span className="text-xs">已选择：{compareVersion1 ? '1个' : '0个'}/2 个版本</span>
                        </p>
                      </div>
                    )}
                    {versions.map((version, index) => {
                      const isCompareSelected1 = compareVersion1?.id === version.id
                      const isCompareSelected2 = compareVersion2?.id === version.id
                      const isSelected = !compareMode && selectedVersion?.id === version.id

                      return (
                        <div
                          key={version.id}
                          className={`p-4 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300'
                              : isCompareSelected1 || isCompareSelected2
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => {
                            if (compareMode) {
                              if (!compareVersion1) {
                                setCompareVersion1(version)
                              } else if (!compareVersion2 && compareVersion1.id !== version.id) {
                                setCompareVersion2(version)
                              } else if (compareVersion1?.id === version.id) {
                                setCompareVersion1(null)
                              } else if (compareVersion2?.id === version.id) {
                                setCompareVersion2(null)
                              }
                            } else {
                              setSelectedVersion(version)
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {index === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">最新</span>}
                                <span className="font-semibold text-gray-900">
                                  {new Date(version.created_at).toLocaleString('zh-CN')}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1 truncate">
                                {version.message || '更新文档'}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {version.author}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(version.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                          {compareMode && (isCompareSelected1 || isCompareSelected2) && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              {isCompareSelected1 ? '✓ 已选为版本1' : '✓ 已选为版本2'}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* 版本详情或对比 */}
                  <div>
                    {compareMode && compareVersion1 && compareVersion2 ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">版本对比</h4>
                          <div className="text-sm space-y-2">
                            <div><strong>版本1:</strong> {new Date(compareVersion1.created_at).toLocaleString('zh-CN')}</div>
                            <div><strong>版本2:</strong> {new Date(compareVersion2.created_at).toLocaleString('zh-CN')}</div>
                            <div className="text-xs text-gray-600 mt-2">
                              {compareVersion1.content.length} 字符 → {compareVersion2.content.length} 字符
                              ({compareVersion2.content.length > compareVersion1.content.length ? '+' : ''}{compareVersion2.content.length - compareVersion1.content.length})
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-rows-2 gap-4 h-[500px]">
                          <div className="flex-1 border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 px-3 py-2 border-b font-semibold text-sm">
                              版本1 - {compareVersion1.message || '更新文档'}
                            </div>
                            <pre className="p-3 h-full overflow-auto text-xs bg-white text-gray-800 whitespace-pre-wrap break-words">
                              {compareVersion1.content}
                            </pre>
                          </div>
                          <div className="flex-1 border rounded-lg overflow-hidden">
                            <div className="bg-blue-100 px-3 py-2 border-b font-semibold text-sm">
                              版本2 - {compareVersion2.message || '更新文档'}
                            </div>
                            <pre className="p-3 h-full overflow-auto text-xs bg-white text-gray-800 whitespace-pre-wrap break-words">
                              {compareVersion2.content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : !compareMode && selectedVersion ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">版本详情</h4>
                          <div className="text-sm space-y-1">
                            <div><strong>时间:</strong> {new Date(selectedVersion.created_at).toLocaleString('zh-CN')}</div>
                            <div><strong>作者:</strong> {selectedVersion.author}</div>
                            <div><strong>说明:</strong> {selectedVersion.message || '更新文档'}</div>
                            <div><strong>字符数:</strong> {selectedVersion.content.length}</div>
                          </div>
                          <Button
                            onClick={() => revertToVersion(selectedVersion.id)}
                            className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            size="sm"
                          >
                            ↩️ 恢复到此版本
                          </Button>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-100 px-3 py-2 border-b font-semibold text-sm">
                            版本内容
                          </div>
                          <pre className="p-4 h-[400px] overflow-auto text-sm bg-white text-gray-800 whitespace-pre-wrap break-words">
                            {selectedVersion.content}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📄</div>
                          <p>{compareMode ? '选择两个版本进行对比' : '选择一个版本查看详情'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
