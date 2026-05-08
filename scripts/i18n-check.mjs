/**
 * i18n-check: 扫描 Vue 模板中的硬编码中文
 * 用法: node scripts/i18n-check.mjs
 */
import fs from 'fs';
import path from 'path';

const CHINESE_REGEX = /[\u4e00-\u9fff]/;
const EXCLUDE_PATTERNS = [
  /<!--[\s\S]*?-->/,          // HTML 注释
  /\bt\([^)]*\)/,              // t(...)
  /\b\$t\([^)]*\)/,            // $t(...)
  /:\s*['"][^'"]*['"]\s*[,}]/, // 对象属性值（如 { name: 'xxx' }）
];

function extractTemplate(content) {
  const match = content.match(/<template>([\s\S]*?)<\/template>/);
  return match ? match[1] : '';
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const template = extractTemplate(content);
  if (!template) return [];

  const lines = template.split('\n');
  const hits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 跳过纯注释行
    if (trimmed.startsWith('<!--')) continue;

    // 如果行中有中文
    if (!CHINESE_REGEX.test(line)) continue;

    // 检查是否被排除
    let excluded = false;
    for (const pat of EXCLUDE_PATTERNS) {
      if (pat.test(line)) {
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    hits.push({ line: i + 1, text: trimmed.slice(0, 120) });
  }

  return hits;
}

function walkDir(dir, pattern, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, pattern, results);
    } else if (entry.isFile() && entry.name.endsWith(pattern)) {
      results.push(fullPath);
    }
  }
  return results;
}

const dirs = ['src/views', 'src/components', 'src/layouts'];
let totalHits = 0;
let totalFiles = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = walkDir(dir, '.vue');
  for (const file of files) {
    const hits = scanFile(file);
    if (hits.length) {
      totalFiles++;
      totalHits += hits.length;
      console.log(`\n📄 ${file}`);
      for (const h of hits) {
        console.log(`   L${h.line}: ${h.text}`);
      }
    }
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`  扫描完成: ${totalHits} 处疑似硬编码中文, 涉及 ${totalFiles} 个文件`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

if (totalHits > 0) {
  process.exit(1);
}
