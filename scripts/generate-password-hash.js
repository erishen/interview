#!/usr/bin/env node
/**
 * 生成 bcrypt password hash
 * 用法: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

function generateHash(password, saltRounds = 12) {
  if (!password) {
    console.error('错误: 请提供密码');
    console.log('用法: node scripts/generate-password-hash.js <password>');
    console.log('示例: node scripts/generate-password-hash.js admin123');
    process.exit(1);
  }

  const hash = bcrypt.hashSync(password, saltRounds);

  console.log('');
  console.log('='.repeat(60));
  console.log('Bcrypt Password Hash 生成成功');
  console.log('='.repeat(60));
  console.log('');
  console.log('密码:', password);
  console.log('Hash:', hash);
  console.log('Salt Rounds:', saltRounds);
  console.log('');
  console.log('复制以下内容到 apps/admin/.env.local 文件:');
  console.log('-'.repeat(60));
  console.log(`ADMIN_EMAIL="your-admin@example.com"`);
  console.log(`NEXTAUTH_ADMIN_PASSWORD_HASH_BASE64="${Buffer.from(hash).toString('base64')}"`);
  console.log('-'.repeat(60));
  console.log('');
  console.log('说明: bcrypt hash 已使用 Base64 编码存储，避免 $ 符号被环境变量解析器截断');
  console.log('');
}

// 从命令行参数获取密码
const password = process.argv[2];
const saltRounds = process.argv[3] ? parseInt(process.argv[3]) : 12;

generateHash(password, saltRounds);
