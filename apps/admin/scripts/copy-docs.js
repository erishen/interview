#!/usr/bin/env node
/**
 * 复制 docs 目录到 .next 目录，用于 Vercel 部署
 * Vercel 部署时只会包含应用目录下的文件，所以需要将 docs 复制到 .next 目录
 */

const fs = require('fs');
const path = require('path');

// 智能查找 docs 目录（支持多种路径结构）
function findDocsDir() {
  const possiblePaths = [
    // monorepo 结构：docs 在根目录
    path.resolve(__dirname, '../../../docs'),
    // 单独应用结构：docs 在 apps 目录
    path.resolve(__dirname, '../../docs'),
    // Vercel 默认结构
    path.resolve(process.cwd(), '../../docs'),
    path.resolve(process.cwd(), '../docs'),
  ];

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      return dirPath;
    }
  }

  return null;
}

const DOCS_SOURCE = findDocsDir();
const DOCS_DEST = path.resolve(__dirname, '../.next/docs');

console.log('Copying docs directory for deployment...');
console.log('Source:', DOCS_SOURCE);
console.log('Destination:', DOCS_DEST);

// 检查源目录是否存在
if (!DOCS_SOURCE || !fs.existsSync(DOCS_SOURCE)) {
  console.error('Error: docs directory not found');
  console.error('Tried paths:');
  console.error('  -', path.resolve(__dirname, '../../../docs'));
  console.error('  -', path.resolve(__dirname, '../../docs'));
  console.error('  -', path.resolve(process.cwd(), '../../docs'));
  console.error('  -', path.resolve(process.cwd(), '../docs'));
  process.exit(1);
}

// 创建目标目录
fs.mkdirSync(DOCS_DEST, { recursive: true });

// 递归复制目录
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制 docs 目录
copyDir(DOCS_SOURCE, DOCS_DEST);

console.log('✓ Docs directory copied successfully');
console.log('  Files copied:', fs.readdirSync(DOCS_DEST, { withFileTypes: true }).filter(e => e.isFile()).length);
