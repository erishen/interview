// 模拟用户数据库（实际项目中应该连接真实数据库）
export const userDatabase: Record<string, any[]> = {
  'user@example.com': [
    {
      id: 'evt_001',
      type: 'page_view',
      timestamp: '2024-01-15T10:30:00Z',
      data: {
        page: '/products',
        referrer: 'https://google.com',
        device: 'Chrome 120',
        ip: '192.168.1.100',
      },
    },
    {
      id: 'evt_002',
      type: 'product_view',
      timestamp: '2024-01-15T10:35:00Z',
      data: {
        product_id: '123',
        product_name: '示例商品',
        price: 99.00,
      },
    },
    {
      id: 'evt_003',
      type: 'add_to_cart',
      timestamp: '2024-01-15T10:40:00Z',
      data: {
        product_id: '123',
        product_name: '示例商品',
        price: 99.00,
        quantity: 1,
      },
    },
  ],
  'test@test.com': [
    {
      id: 'evt_004',
      type: 'page_view',
      timestamp: '2025-12-30T10:30:00Z',
      data: {
        page: '/home',
        referrer: 'https://bing.com',
        device: 'Safari 17',
        ip: '10.0.0.50',
      },
    },
    {
      id: 'evt_005',
      type: 'product_view',
      timestamp: '2025-12-30T10:35:00Z',
      data: {
        product_id: '456',
        product_name: '测试商品',
        price: 199.00,
      },
    },
  ],
}

// IP 匿名化（移除最后一段）
// 符合 GDPR 的数据最小化原则
export function anonymizeIP(ip: string): string {
  if (!ip || typeof ip !== 'string') return ''
  
  const parts = ip.split('.')
  if (parts.length < 2) return ip
  
  // 移除最后一段，保留前两段
  // 例如：192.168.1.100 -> 192.168.1.0
  return `${parts[0]}.${parts[1]}.0.0`
}
