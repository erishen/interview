import Link from 'next/link';
import { getAllDocs, type Doc } from '@/lib/docs';

export default async function DocsPage() {
  const docs = await getAllDocs();

  // Group docs by category based on title
  const coreDocs = docs.filter(doc => ['frontend', 'frontend-extended'].includes(doc.slug));
  const algorithmDocs = docs.filter(doc => ['dynamic-programming', 'min-path-sum-explained', 'frontend-algorithms-practical'].includes(doc.slug));
  const otherDocs = docs.filter(doc =>
    !['frontend', 'frontend-extended', 'dynamic-programming', 'min-path-sum-explained', 'frontend-algorithms-practical'].includes(doc.slug)
  );

  const DocList = ({ title, docs }: { title: string; docs: Doc[] }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
            {doc.description && (
              <p className="text-gray-600 text-sm">{doc.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Interview Web App</h1>
            <div className="space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-900 font-medium">Home</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                📚 文档
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📚 前端面试知识库
            </h1>
            <p className="text-lg text-gray-600">
              系统化的前端面试复习资料，从基础到进阶，全面覆盖前端开发核心知识点
            </p>
          </div>

          {docs.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">未找到文档文件，请确保 docs 目录存在且包含 .md 文件</p>
            </div>
          ) : (
            <>
              <DocList title="🎯 核心基础知识" docs={coreDocs} />
              <DocList title="🧮 算法与数据结构" docs={algorithmDocs} />
              {otherDocs.length > 0 && <DocList title="📋 其他文档" docs={otherDocs} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
