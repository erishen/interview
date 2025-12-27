'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@interview/ui'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  category?: string
  created_at?: string
  updated_at?: string
  is_offer?: boolean
}

interface CartItem extends Product {
  quantity: number
}

export default function ProductsDisplay() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  const loadProducts = async (retryCount = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/fastapi/items')
      const data = await response.json()

      if (response.ok) {
        setProducts(data || [])
        setLoading(false)
      } else {
        throw new Error(`HTTP ${response.status}: ${data?.error || '加载商品失败'}`)
      }
    } catch (err) {
      console.error('加载商品错误:', err)
      if (retryCount < 3) {
        // 重试最多3次，间隔1秒
        setTimeout(() => loadProducts(retryCount + 1), 1000)
      } else {
        setError(err instanceof Error ? err.message : '网络错误，无法加载商品')
        setLoading(false)
      }
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
    setShowCart(true)
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleShowDetail = async (product: Product) => {
    setDetailLoading(true)
    try {
      const response = await fetch(`/api/fastapi/items/${product.id}`)
      const data = await response.json()
      if (response.ok) {
        setSelectedProduct(data)
      } else {
        alert('加载商品详情失败')
      }
    } catch (err) {
      alert('网络错误，无法加载商品详情')
    }
    setDetailLoading(false)
  }

  useEffect(() => {
    // 添加延迟，确保 FastAPI 后端完全启动
    const timer = setTimeout(() => {
      loadProducts()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🛍️ 商品展示</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCart(!showCart)}
            size="sm"
            variant="outline"
            className="relative"
          >
            🛒 购物车
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
          <Button onClick={() => loadProducts()} size="sm" variant="outline">
            刷新
          </Button>
        </div>
      </div>

      {/* 购物车面板 */}
      {showCart && (
        <div className="mb-6 bg-gray-50 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">🛒 购物车</h3>
            <Button onClick={() => setShowCart(false)} size="sm" variant="outline">
              关闭
            </Button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-4 text-gray-500">购物车是空的</div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-white p-3 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">¥{item.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        +
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeFromCart(item.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">总计:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ¥{cartTotal.toFixed(2)}
                  </span>
                </div>
                <Button className="w-full mt-3">
                  结算
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">加载失败</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => loadProducts()} size="sm" variant="outline">
              重试
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📦</div>
          <p>暂无商品</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {product.name}
                </h3>
                {product.is_offer && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    特惠
                  </span>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ¥{product.price}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShowDetail(product)}
                  disabled={detailLoading}
                >
                  {detailLoading ? '加载中...' : '详情'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 商品详情模态框 */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedProduct.name}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {selectedProduct.is_offer && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <span className="font-medium">🔥 特惠商品</span>
                  </div>
                )}

                {selectedProduct.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">商品描述</h3>
                    <p className="text-gray-800 leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">价格</h3>
                    <p className="text-3xl font-bold text-green-600">
                      ¥{selectedProduct.price}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">商品ID</h3>
                    <p className="text-gray-800">{selectedProduct.id}</p>
                  </div>
                  {selectedProduct.category && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">分类</h3>
                      <p className="text-gray-800">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {selectedProduct.category}
                        </span>
                      </p>
                    </div>
                  )}
                  {selectedProduct.created_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">创建时间</h3>
                      <p className="text-gray-800">
                        {new Date(selectedProduct.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                  {selectedProduct.updated_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">更新时间</h3>
                      <p className="text-gray-800">
                        {new Date(selectedProduct.updated_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                    关闭
                  </Button>
                  <Button onClick={() => {
                    addToCart(selectedProduct!)
                    setSelectedProduct(null)
                  }}>
                    添加到购物车
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
