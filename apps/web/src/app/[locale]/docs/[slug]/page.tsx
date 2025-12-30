import Link from 'next/link';
import { getDocBySlug } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getTranslations } from 'next-intl/server';

// 禁用静态生成，强制每次请求都动态渲染
export const dynamic = 'force-dynamic';

export default async function DocDetailPage({ params }: { params: { slug: string; locale: string } }) {
  const content = await getDocBySlug(params.slug);
  const t = await getTranslations('common');

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-bold text-gray-900">Interview Web App</h1>
              <div className="space-x-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">{t('home')}</Link>
                <Link href="/docs" className="text-blue-600 hover:text-blue-900 font-medium">
                  📚 {t('docs')}
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">文档未找到</h1>
            <p className="text-gray-600 mb-6">找不到名为 &quot;{params.slug}&quot; 的文档</p>
            <Link
              href="/docs"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回文档列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Interview Web App</h1>
            <div className="space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">{t('home')}</Link>
              <Link href="/docs" className="text-blue-600 hover:text-blue-900 font-medium">
                📚 {t('docs')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/docs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← {t('back')}
          </Link>
          
          <article className="bg-white rounded-lg shadow-sm p-8 md:p-12 prose prose-slate prose-lg max-w-none dark:prose-invert">
            <MDXRemote 
              source={content}
              options={{
                mdxOptions: {
                  remarkPlugins: [],
                  rehypePlugins: [],
                },
              }}
            />
          </article>
        </div>
      </div>
    </div>
  );
}
