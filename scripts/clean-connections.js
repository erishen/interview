#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🧹 清理网络连接脚本')
console.log('==================\n')

// 定义要检查的端口
const PORTS = [3000, 3001, 3002, 3003, 3004, 3005, 6006]

PORTS.forEach(port => {
  try {
    console.log(`📍 检查端口 ${port}...`)

    // 获取该端口的所有连接
    const output = execSync(`lsof -i :${port} 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 5000
    }).trim()

    if (!output) {
      console.log(`   ✅ 端口 ${port} 无活动连接\n`)
      return
    }

    const lines = output.split('\n').slice(1) // 跳过标题行
    let cleanedCount = 0

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 9) {
        const command = parts[0]
        const pid = parts[1]
        const status = parts[9]

        // 只清理非活跃的连接
        if (status && (status.includes('CLOSED') || status.includes('CLOSE_WAIT') || status.includes('FIN_WAIT'))) {
          try {
            // 发送 SIGTERM 信号，让进程有机会正常清理
            execSync(`kill -TERM ${pid}`, { timeout: 2000 })
            console.log(`   🧽 清理 ${command} (PID: ${pid}) - ${status}`)
            cleanedCount++
          } catch (killError) {
            // 如果 SIGTERM 不工作，尝试 SIGKILL
            try {
              execSync(`kill -KILL ${pid}`, { timeout: 1000 })
              console.log(`   💀 强制清理 ${command} (PID: ${pid}) - ${status}`)
              cleanedCount++
            } catch (forceKillError) {
              console.log(`   ❌ 无法清理 ${command} (PID: ${pid}): ${forceKillError.message}`)
            }
          }
        }
      }
    })

    if (cleanedCount === 0) {
      console.log(`   ℹ️  端口 ${port} 只有活跃连接，无需清理`)
    }

    console.log('')
  } catch (error) {
    // 端口没有监听或没有连接
    console.log(`   📭 端口 ${port} 无连接\n`)
  }
})

console.log('✅ 连接清理完成！')
console.log('\n💡 提示：')
console.log('   - CLOSE_WAIT/CLOSED 连接通常会自动清理')
console.log('   - 如果连接持续不清理，重启开发服务器即可')
console.log('   - 在生产环境中，建议使用连接池和超时设置')
