export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">
        📋 服务条款
      </h1>

      <div className="prose prose max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. 引言</h2>
          <p className="text-gray-700">
            欢迎使用我们的服务。这些服务条款（"条款"）规定了您使用我们网站和相关服务的规则和条件。
            使用我们的服务即表示您同意这些条款。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. 服务描述</h2>
          <p className="text-gray-700 mb-4">
            我们提供以下服务：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>商品展示</strong>：浏览和搜索商品信息</li>
            <li><strong>购物车</strong>：添加和管理商品</li>
            <li><strong>订单处理</strong>：创建和管理订单</li>
            <li><strong>客户支持</strong>：咨询和售后服务</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. 用户账户</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">3.1 账户创建</h3>
              <p className="text-gray-700">
                要使用某些服务，您可能需要创建账户。您必须提供准确、完整和最新的信息。
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">3.2 账户安全</h3>
              <p className="text-gray-700">
                您有责任维护您账户信息的机密性和安全性。您不得与任何人共享您的账户凭证。
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">3.3 账户责任</h3>
              <p className="text-gray-700">
                您对您账户下发生的所有活动负责。如果发现任何未经授权的访问，请立即通知我们。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. 用户行为规范</h2>
          <p className="text-gray-700 mb-4">
            使用我们的服务时，您同意：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>仅将服务用于合法目的</li>
            <li>不干扰或破坏服务的正常运行</li>
            <li>不传播恶意软件、病毒或其他有害代码</li>
            <li>不侵犯他人的知识产权或隐私权</li>
            <li>不从事任何欺诈或欺骗行为</li>
            <li>不违反适用的法律法规</li>
          </ul>
          <p className="text-gray-700 mt-4">
            违反这些条款可能会导致您的账户被暂停或终止。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. 智能财产</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">5.1 我们的内容</h3>
              <p className="text-gray-700">
                网站上的所有内容，包括但不限于文本、图像、图形、标志、软件等，
                均受版权、商标和其他知识产权法的保护。
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">5.2 您的内容</h3>
              <p className="text-gray-700">
                您保留对您提交的任何内容的所有权。通过提交内容，您授予我们使用、复制、显示和分发这些内容的权利，
                用于提供和改进我们的服务。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. 购买和支付</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">6.1 订单确认</h3>
              <p className="text-gray-700">
                所有订单确认都取决于库存可用性和验证。我们保留取消订单的权利，
                如果商品无法交付或发现付款问题。
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">6.2 价格</h3>
              <p className="text-gray-700">
                商品价格可能会随时更改。订单上显示的价格是订单确认时的价格。
                我们保留在任何时候更正价格错误的权利。
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">6.3 支付方式</h3>
              <p className="text-gray-700">
                我们支持多种支付方式。所有支付信息都通过安全加密传输。
                我们不存储您的完整信用卡信息。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. 退款和退货</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">7.1 退款政策</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>商品收到后 7 天内可申请退款</li>
                <li>商品必须保持原状，未经使用</li>
                <li>退货运费由买方承担（除非商品有缺陷）</li>
                <li>退款将在收到退货后 5-7 个工作日内处理</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">7.2 不可退款的情况</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>超过 7 天退款期的商品</li>
                <li>已使用或损坏的商品</li>
                <li>个性化定制商品</li>
                <li>卫生用品（如内衣、化妆品等）</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. 服务可用性</h2>
          <p className="text-gray-700 mb-4">
            我们努力确保服务的连续性和可用性，但不保证：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>服务将始终不间断、及时、安全或无错误</li>
            <li>错误或缺陷将被纠正</li>
            <li>网站或其服务器没有病毒或其他有害组件</li>
          </ul>
          <p className="text-gray-700 mt-4">
            我们不承担因服务中断或不可用而造成的任何损失。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. 免责声明</h2>
          <p className="text-gray-700 mb-4">
            在法律允许的最大范围内：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>服务按"原样"和"可用"基础提供，不提供任何明示或暗示的保证</li>
            <li>我们不保证服务满足您的特定要求</li>
            <li>我们不保证服务将不间断、及时、安全或无错误</li>
            <li>我们不对因使用或无法使用服务而造成的任何间接、附带、特殊或后果性损害负责</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. 责任限制</h2>
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-medium mb-2">最大责任</h3>
            <p className="text-gray-700">
              我们对您的最大责任不超过您为服务支付的费用金额。
              在任何情况下，我们都不对任何间接、附带、特殊或后果性损害承担责任。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. 条款变更</h2>
          <p className="text-gray-700 mb-4">
            我们保留随时修改这些条款的权利。修改后的条款将在网站上发布。
            继续使用服务即表示您接受修改后的条款。
          </p>
          <p className="text-gray-700">
            重大变更将通过以下方式通知：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>在网站首页发布通知</li>
            <li>通过电子邮件通知注册用户</li>
            <li>在 Cookie 同意弹窗中显示更新提醒</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. 终止</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">12.1 用户终止</h3>
              <p className="text-gray-700">
                您可以随时停止使用我们的服务。如果您有账户，您可以通过联系我们要求数据删除或账户注销。
                访问 <a href="/user-rights" className="text-blue-600 hover:underline">用户权利页面</a> 了解更多信息。
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">12.2 我们终止</h3>
              <p className="text-gray-700">
                我们可以随时暂停或终止您的账户和服务访问，如果有以下情况：
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>您违反这些条款</li>
                <li>我们无法验证您的身份</li>
                <li>我们怀疑您从事欺诈或非法活动</li>
                <li>因技术原因需要暂停服务</li>
                <li>不再提供某些服务</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">13. 隐私</h2>
          <p className="text-gray-700 mb-4">
            我们重视您的隐私。我们的隐私政策说明我们如何收集、使用和保护您的个人信息。
          </p>
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-gray-700">
              使用我们的服务即表示您同意我们按照
              <a href="/privacy" className="text-blue-600 hover:underline">
                隐私政策
              </a>
              收集和使用您的信息。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">14. 适用法律</h2>
          <p className="text-gray-700">
            这些条款受中华人民共和国法律管辖。与这些条款相关的任何争议将通过协商解决。
            如果协商失败，争议将通过中华人民共和国有管辖权的法院解决。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">15. 可分割性</h2>
          <p className="text-gray-700">
            如果这些条款的任何规定被认定为无效或不可执行，该规定将在最大可能范围内执行，
            其他规定将继续完全有效。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">16. 完整协议</h2>
          <p className="text-gray-700">
            这些条款（包括隐私政策）构成您与我们之间关于服务的完整协议，
            取代所有先前的协议、理解和通信。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">17. 联系我们</h2>
          <div className="p-6 bg-blue-50 rounded">
            <h3 className="font-medium mb-4">如有任何问题或疑虑</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>法律咨询</strong>: legal@example.com</li>
              <li><strong>服务条款咨询</strong>: terms@example.com</li>
              <li><strong>客服支持</strong>: support@example.com</li>
              <li><strong>电话</strong>: +86 400-XXX-XXXX</li>
            </ul>
          </div>
        </section>

        <section className="pt-8 border-t">
          <p className="text-gray-600 text-sm text-center">
            本条款最后更新：{new Date().toLocaleDateString('zh-CN')}
          </p>
        </section>
      </div>
    </div>
  )
}
