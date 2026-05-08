const fs = require('fs');

const files = [
  'src/views/HomeView.vue',
  'src/views/CartView.vue',
  'src/views/CheckoutView.vue',
  'src/views/OrderSuccessView.vue',
  'src/views/UserOrdersView.vue',
  'src/views/UserOrderDetailView.vue',
  'src/views/admin/order/OrderListAdminView.vue',
  'src/views/admin/order/OrderDetailAdminView.vue',
  'src/views/admin/product/ProductDetailAdminView.vue',
  'src/views/admin/product/ProductListAdminView.vue',
  'src/views/admin/dashboard/DashboardView.vue'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');

  // 1. 添加 formatCurrency 导入（如果还没有）
  if (!content.includes('formatCurrency')) {
    content = content.replace(
      /import\s*{\s*useAppI18n\s*}\s*from\s*'@\/composables\/useAppI18n';?/,
      "import { useAppI18n } from '@/composables/useAppI18n';\nimport { formatCurrency } from '@/utils/formatLocale';"
    );
  }

  // 2. 确保 locale 被解构（如果还没有）
  if (!content.includes('locale }')) {
    content = content.replace(
      /const\s*{\s*t\s*}\s*=\s*useAppI18n\(\);/,
      'const { t, locale } = useAppI18n();'
    );
  }

  // 3. 替换模板中的 ¥ 表达式
  // ¥{{ expr.toFixed(2) }} → {{ formatCurrency(expr, locale) }}
  content = content.replace(/¥\{\{\s*([^}]+?)\.toFixed\(2\)\s*\}\}/g, (match, expr) => {
    return '{{ formatCurrency(' + expr.trim() + ', locale) }}';
  });

  // ¥{{ (expr).toFixed(2) }} → {{ formatCurrency(expr, locale) }}
  content = content.replace(/¥\{\{\s*\(([^)]+)\)\.toFixed\(2\)\s*\}\}/g, (match, expr) => {
    return '{{ formatCurrency(' + expr.trim() + ', locale) }}';
  });

  // ¥{{ Number(expr).toFixed(2) }} → {{ formatCurrency(expr, locale) }}
  content = content.replace(/¥\{\{\s*Number\(([^)]+)\)\.toFixed\(2\)\s*\}\}/g, (match, expr) => {
    return '{{ formatCurrency(' + expr.trim() + ', locale) }}';
  });

  // ¥{{ expr.toLocaleString() }} → {{ formatCurrency(expr, locale) }}
  content = content.replace(/¥\{\{\s*([^}]+?)\.toLocaleString\(\)\s*\}\}/g, (match, expr) => {
    return '{{ formatCurrency(' + expr.trim() + ', locale) }}';
  });

  // `¥${expr.toFixed(2)}` (模板字符串在属性中)
  content = content.replace(/`¥\$\{([^}]+?)\.toFixed\(2\)\}`/g, (match, expr) => {
    return 'formatCurrency(' + expr.trim() + ', locale)';
  });

  fs.writeFileSync(f, content);
  console.log('Updated: ' + f);
});
