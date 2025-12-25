#!/usr/bin/env node
/**
 * 密码哈希生成工具
 * 用于生成 Admin 应用的 bcrypt 密码哈希值
 *
 * 使用方法:
 *   node scripts/generate-password-hash.js [密码]
 *
 * 如果不提供密码参数，会提示输入密码
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function generateHash(password) {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

async function main() {
  const args = process.argv.slice(2);
  let password;

  if (args.length > 0) {
    password = args[0];
  } else {
    password = await new Promise((resolve) => {
      rl.question('请输入要哈希的密码: ', resolve);
    });
  }

  if (!password) {
    console.log('❌ 密码不能为空');
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.log('⚠️  警告：建议使用至少 8 个字符的密码');
  }

  const hashed = await generateHash(password);

  console.log('\n' + '='.repeat(60));
  console.log('🔐 密码哈希生成成功');
  console.log('='.repeat(60));
  console.log(`原始密码: ${password}`);
  console.log(`哈希结果: ${hashed}`);
  console.log('='.repeat(60));
  console.log('\n将以下配置添加到 .env 文件（NextAuth - 使用 bcrypt）：');
  console.log(`ADMIN_EMAIL=admin@example.com`);
  console.log(`NEXTAUTH_ADMIN_PASSWORD_HASH=${hashed}`);
  console.log(`NEXTAUTH_ADMIN_PASSWORD=`);

  rl.close();
}

main().catch(err => {
  console.error('❌ 错误:', err);
  rl.close();
  process.exit(1);
});
