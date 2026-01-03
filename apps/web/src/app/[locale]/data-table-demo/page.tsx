'use client';

import { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/data-table';

// 类型定义（与 ProductsDisplay 组件一致）
interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
  is_offer?: boolean;
}

export default function DataTableDemoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载产品数据
  const loadProducts = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fastapi/items');
      const data = await response.json();

      if (response.ok) {
        setProducts(data || []);
        setLoading(false);
      } else {
        throw new Error(`HTTP ${response.status}: ${data?.error || '加载商品失败'}`);
      }
    } catch (err) {
      console.error('加载商品错误:', err);
      if (retryCount < 3) {
        // 重试最多3次，间隔1秒
        setTimeout(() => loadProducts(retryCount + 1), 1000);
      } else {
        setError(err instanceof Error ? err.message : '网络错误，无法加载商品');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // 添加延迟，确保 FastAPI 后端完全启动
    const timer = setTimeout(() => {
      loadProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const columns: Array<Column<Product>> = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (value: string | number | boolean | undefined) => {
        if (!value) return '-';
        return String(value);
      },
    },
    {
      key: 'price',
      label: 'Price (¥)',
      sortable: true,
      render: (value: string | number | boolean | undefined) => `¥${Number(value).toFixed(2)}`,
    },
    {
      key: 'is_offer',
      label: 'Offer',
      sortable: true,
      filterable: true,
      render: (value: string | number | boolean | undefined) => {
        const isOffer = Boolean(value);
        return isOffer ? (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            特惠
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (value: string | number | boolean | undefined) => {
        if (!value) return '-';
        const date = new Date(String(value));
        return date.toLocaleString('zh-CN');
      },
    },
  ];

  const handleRowClick = (row: Product) => {
    alert(`Selected: ${row.name}${row.category ? ` (${row.category})` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
            DataTable Component Demo
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Displaying products from FastAPI backend with sorting, filtering, and pagination
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading products...</p>
              <p className="text-slate-400 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-800 mb-1">加载失败</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button
                onClick={() => loadProducts()}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                重试
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <DataTable
                data={products}
                columns={columns}
                pageSize={5}
                onRowClick={handleRowClick}
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Component Features
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: '⬆️', title: 'Sortable columns', desc: 'Click column headers to sort data' },
                  { icon: '🔍', title: 'Filterable columns', desc: 'Search boxes for quick filtering' },
                  { icon: '📄', title: 'Pagination', desc: 'Navigate through large datasets' },
                  { icon: '🎨', title: 'Custom rendering', desc: 'Render cells with custom components' },
                  { icon: '👆', title: 'Row interaction', desc: 'Click rows to handle events' },
                  { icon: '🌐', title: 'Real data', desc: 'Fetches products from FastAPI backend' },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-5 p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-3xl flex-shrink-0">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2 text-base">{feature.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-sm border border-blue-200 p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Component Source</h3>
                    <p className="text-slate-700 leading-relaxed">
                      This DataTable component is part of the <span className="font-semibold text-blue-700">shadcn-registry</span> collection.
                      Explore more components and examples.
                    </p>
                  </div>
                </div>
                <a
                  href="https://erishen.github.io/shadcn-registry/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-blue-700 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-blue-200"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  shadcn-registry
                  <svg className="ml-2 w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
