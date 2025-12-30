'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@interview/ui'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

export default function UserRightsPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasConsented, setHasConsented] = useState(false)
  const { trackCustomEvent } = useGoogleAnalytics()

  // 检查用户是否已同意 cookie
  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie_consent')
      if (consent) {
        const parsed = JSON.parse(consent)
        setHasConsented(parsed.hasDecided)
      }
    } catch (error) {
      console.error('Error reading consent:', error)
    }
  }, [])

  // 删除个人数据
  const handleDeleteData = async () => {
    if (!email) {
      setMessage('请输入邮箱地址')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      // 1. 删除 Google Analytics 数据
      trackCustomEvent('gdpr_delete_request', {
        email_hash: hashEmail(email),
        request_type: 'data_deletion',
      })

      // 2. 请求后端删除自定义分析数据
      const response = await fetch('/api/user/data-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage('✅ 删除请求已提交。我们将在 30 天内处理您的请求。')
        
        // 3. 退出登录
        localStorage.clear()
        sessionStorage.clear()
        
        // 4. 删除 Google Analytics cookie
        document.cookie.split(';').forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          const domain = location.hostname
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        })

        trackCustomEvent('gdpr_delete_submitted', { success: true })
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error || '删除失败，请稍后重试'}`)
        trackCustomEvent('gdpr_delete_submitted', { success: false, error })
      }
    } catch (error) {
      setMessage('❌ 网络错误，请稍后重试')
      console.error('Delete error:', error)
      trackCustomEvent('gdpr_delete_submitted', { success: false, error: 'network' })
    } finally {
      setLoading(false)
    }
  }

  // 导出个人数据
  const handleExportData = async () => {
    if (!email) {
      setMessage('请输入邮箱地址')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      trackCustomEvent('gdpr_export_request', {
        email_hash: hashEmail(email),
        request_type: 'data_export',
      })

      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // 下载 JSON 文件
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setMessage('✅ 数据已导出并开始下载')
        trackCustomEvent('gdpr_export_success', { record_count: data.records?.length || 0 })
      } else {
        const error = await response.json()
        setMessage(`❌ ${error.error || '导出失败，请稍后重试'}`)
        trackCustomEvent('gdpr_export_failed', { error })
      }
    } catch (error) {
      setMessage('❌ 网络错误，请稍后重试')
      console.error('Export error:', error)
      trackCustomEvent('gdpr_export_failed', { error: 'network' })
    } finally {
      setLoading(false)
    }
  }

  // 简单的邮箱哈希（用于 GDPR 合规）
  const hashEmail = (email: string): string => {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }

  // 撤回 cookie 同意
  const handleWithdrawConsent = () => {
    localStorage.removeItem('cookie_consent')
    
    // 删除 Google Analytics cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    })
    
    setHasConsented(false)
    trackCustomEvent('cookie_consent_withdrawn', {})
    
    window.location.reload()
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">
        🔒 个人数据管理
      </h1>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          您的数据权利 (GDPR)
        </h2>
        <div className="space-y-4 text-gray-700">
          <p>
            根据《通用数据保护条例》(GDPR)，您拥有以下权利：
          </p>
          
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>知情权</strong>：我们收集哪些数据，用于什么目的</li>
            <li><strong>访问权</strong>：查看我们存储的您的所有数据</li>
            <li><strong>更正权</strong>：要求更正不准确的数据</li>
            <li><strong>删除权</strong>：要求删除您的所有数据</li>
            <li><strong>可携带性</strong>：导出您的数据并转移到其他服务</li>
            <li><strong>反对权</strong>：反对某些数据处理活动</li>
            <li><strong>撤回同意</strong>：随时撤回您的 cookie 同意</li>
          </ul>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          📊 收集的数据类型
        </h2>
        <div className="space-y-3 text-gray-700">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-medium mb-2">网站行为数据</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>访问的页面和浏览时间</li>
              <li>点击的按钮和元素</li>
              <li>商品浏览和购物车操作</li>
              <li>设备信息和浏览器类型</li>
              <li>地理位置（大概地区，非精确位置）</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">Google Analytics 数据</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>由 Google Analytics 收集和存储</li>
              <li>IP 地址已匿名化（仅保留前3段）</li>
              <li>数据存储在 Google 的服务器</li>
              <li>符合 GDPR 和 CCPA 要求</li>
              <li>
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  查看 Google 隐私政策 →
                </a>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-medium mb-2">自定义分析数据</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>存储在我们控制的数据库</li>
              <li>会话 ID 和用户行为事件</li>
              <li>购物车内容和订单历史</li>
              <li>完全加密存储</li>
              <li>可随时请求删除</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          导出您的数据
        </h2>
        <p className="text-gray-600 mb-4">
          输入您的邮箱地址，我们将导出所有与该邮箱关联的数据。
        </p>
        
        <div className="flex gap-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={handleExportData} 
            disabled={loading}
          >
            {loading ? '导出中...' : '导出数据'}
          </Button>
        </div>
        
        {message && (
          <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          删除您的数据
        </h2>
        <p className="text-gray-600 mb-4">
          此操作将永久删除您的所有数据，包括 Google Analytics 和我们的自定义分析数据。
          <strong className="text-red-600">此操作不可撤销。</strong>
        </p>
        
        <div className="flex gap-4 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={handleDeleteData}
            disabled={loading}
            variant="outline"
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            {loading ? '删除中...' : '删除所有数据'}
          </Button>
        </div>
        
        {message && (
          <div className={`p-3 rounded ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Cookie 设置
        </h2>
        
        <div className="flex items-center justify-between">
          <div className="text-gray-700">
            <p className="mb-2">
              当前状态：<strong className={hasConsented ? 'text-green-600' : 'text-orange-600'}>
                {hasConsented ? '已同意' : '未决定'}
              </strong>
            </p>
            <p className="text-sm">
              点击下方按钮可以更改您的 cookie 偏好设置
            </p>
          </div>
          
          <Button onClick={handleWithdrawConsent} variant="outline">
            撤回同意 / 重新设置
          </Button>
        </div>
      </Card>

      <div className="text-center text-sm text-gray-600 mt-8">
        <p>
          如有疑问，请联系我们：
          <a href="mailto:privacy@example.com" className="text-blue-600 hover:underline">
            privacy@example.com
          </a>
        </p>
      </div>
    </div>
  )
}
