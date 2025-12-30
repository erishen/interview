export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">
        🔒 隐私政策
      </h1>

      <div className="prose prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. 引言</h2>
          <p className="text-gray-700">
            本隐私政策说明我们如何收集、使用、存储和保护您的个人信息。
            使用我们的服务即表示您同意本政策的条款。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. 收集的信息</h2>
          
          <h3 className="text-xl font-medium mb-3">2.1 网站行为数据</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>访问的页面和浏览时间</li>
            <li>点击的按钮和元素</li>
            <li>商品浏览和购物车操作</li>
            <li>设备信息（浏览器类型、操作系统）</li>
            <li>IP 地址（已匿名化，仅保留前 3 段）</li>
            <li>地理位置（大概地区，非精确位置）</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Google Analytics 数据</h3>
          <p className="text-gray-700 mb-2">
            我们使用 Google Analytics 4 (GA4) 来分析网站流量和用户行为。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>数据存储在 Google 的服务器</li>
            <li>IP 地址已匿名化</li>
            <li>数据仅用于网站改进和分析</li>
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
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. 数据使用目的</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>改进产品</strong>：了解用户如何使用网站，优化功能和性能</li>
            <li><strong>个性化推荐</strong>：基于浏览历史推荐相关商品</li>
            <li><strong>分析统计</strong>：生成访问量、转化率等报表</li>
            <li><strong>故障排查</strong>：诊断和修复技术问题</li>
            <li><strong>安全保护</strong>：检测和防止滥用行为</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. 数据共享</h2>
          <p className="text-gray-700 mb-4">
            我们不会出售、交易或出租您的个人信息。我们仅在以下情况下共享数据：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Google Analytics</strong>：匿名化的使用统计数据</li>
            <li><strong>法律要求</strong>：遵守法律、法规或法院命令</li>
            <li><strong>业务转让</strong>：如出售或合并资产（会提前通知）</li>
            <li><strong>服务提供商</strong>：协助我们运营的第三方（受保密协议保护）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. 数据存储和保留</h2>
          <table className="w-full border-collapse border border-gray-200 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-3 text-left">数据类型</th>
                <th className="border border-gray-200 p-3 text-left">保留期限</th>
                <th className="border border-gray-200 p-3 text-left">存储位置</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-3">用户行为事件</td>
                <td className="border border-gray-200 p-3">2 年</td>
                <td className="border border-gray-200 p-3">中国（加密）</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3">购物车</td>
                <td className="border border-gray-200 p-3">30 天（未购买）</td>
                <td className="border border-gray-200 p-3">中国（加密）</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3">订单历史</td>
                <td className="border border-gray-200 p-3">7 年</td>
                <td className="border border-gray-200 p-3">中国（加密）</td>
              </tr>
              <tr>
                <td className="border border-gray-200 p-3">Google Analytics</td>
                <td className="border border-gray-200 p-3">26 个月</td>
                <td className="border border-gray-200 p-3">Google 服务器（欧盟/美国）</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Cookie 管理</h2>
          <p className="text-gray-700 mb-4">
            我们使用 Cookie 和类似技术来改善您的体验。您可以随时管理您的 Cookie 偏好：
          </p>
          <div className="bg-blue-50 p-4 rounded mb-4">
            <h3 className="font-medium mb-2">Cookie 同意管理</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>访问 <a href="/user-rights" className="text-blue-600 hover:underline">用户权利页面</a></li>
              <li>点击 "撤回同意" 按钮</li>
              <li>选择您偏好的 Cookie 设置</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. 您的权利 (GDPR/CCPA)</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">🔍 访问权</h3>
              <p className="text-gray-700">
                您有权查看我们存储的您的所有个人信息。
                <a href="/user-rights" className="text-blue-600 hover:underline">
                  请在此页面请求访问 →
                </a>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">📤 导出权</h3>
              <p className="text-gray-700">
                您有权以机器可读格式导出您的数据。
                <a href="/user-rights" className="text-blue-600 hover:underline">
                  请在此页面请求导出 →
                </a>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">🗑️ 删除权</h3>
              <p className="text-gray-700">
                您有权要求删除您的所有个人数据。
                <a href="/user-rights" className="text-blue-600 hover:underline">
                  请在此页面请求删除 →
                </a>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">🔄 撤回权</h3>
              <p className="text-gray-700">
                您有权随时撤回您的 Cookie 同意。
                <a href="/user-rights" className="text-blue-600 hover:underline">
                  请在此页面管理设置 →
                </a>
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. 数据安全</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>传输加密</strong>：所有数据传输使用 TLS 1.3 加密</li>
            <li><strong>存储加密</strong>：数据库使用 AES-256 加密</li>
            <li><strong>访问控制</strong>：严格的权限管理和身份验证</li>
            <li><strong>定期审计</strong>：定期检查和测试安全措施</li>
            <li><strong>备份保护</strong>：定期备份并加密存储</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. 儿童隐私</h2>
          <p className="text-gray-700">
            我们不有意收集 13 岁以下儿童的个人信息。
            如果我们发现收集了此类信息，我们将立即删除。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. 国际数据传输</h2>
          <p className="text-gray-700 mb-4">
            我们的数据存储在中国。如需传输到其他国家，我们将：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>确保接收方有充分的数据保护</li>
            <li>使用适当的法律机制（如标准合同条款）</li>
            <li>通知您并征得同意（如适用）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. 政策更新</h2>
          <p className="text-gray-700 mb-4">
            我们可能会不时更新本隐私政策。重大变更时，我们将：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>在网站首页发布通知</li>
            <li>通过电子邮件通知注册用户</li>
            <li>更新生效日期</li>
          </ul>
          <p className="text-gray-700">
            建议您定期查看本政策。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. 联系我们</h2>
          <div className="p-6 bg-blue-50 rounded">
            <h3 className="font-medium mb-4">如有任何问题或疑虑</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>数据保护官 (DPO)</strong>: dpo@example.com</li>
              <li><strong>隐私咨询</strong>: privacy@example.com</li>
              <li><strong>客服支持</strong>: support@example.com</li>
              <li><strong>电话</strong>: +86 400-XXX-XXXX</li>
            </ul>
          </div>
        </section>

        <section className="pt-8 border-t">
          <p className="text-gray-600 text-sm text-center">
            本政策最后更新：{new Date().toLocaleDateString('zh-CN')}
          </p>
        </section>
      </div>
    </div>
  )
}
