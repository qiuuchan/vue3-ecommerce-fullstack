import re, os

files = [
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
    'src/views/admin/dashboard/DashboardView.vue',
]

for f in files:
    if not os.path.exists(f):
        continue
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()

    original = content

    # 1. Add formatCurrency import if missing
    if 'formatCurrency' not in content:
        content = re.sub(
            r"import\s*{\s*useAppI18n\s*}\s*from\s*'@/composables/useAppI18n';?",
            "import { useAppI18n } from '@/composables/useAppI18n';\nimport { formatCurrency } from '@/utils/formatLocale';",
            content
        )

    # 2. Ensure locale is destructured
    if 'locale }' not in content:
        content = re.sub(
            r"const\s*{\s*t\s*}\s*=\s*useAppI18n\(\);",
            "const { t, locale } = useAppI18n();",
            content
        )

    # 3. Replace ¥ expressions in templates
    # ¥{{ expr.toFixed(2) }}
    content = re.sub(r'¥\{\{\s*([^}]+?)\.toFixed\(2\)\s*\}\}', r'{{ formatCurrency(\1, locale) }}', content)
    # ¥{{ (expr).toFixed(2) }}
    content = re.sub(r'¥\{\{\s*\(([^)]+)\)\.toFixed\(2\)\s*\}\}', r'{{ formatCurrency(\1, locale) }}', content)
    # ¥{{ Number(expr).toFixed(2) }}
    content = re.sub(r'¥\{\{\s*Number\(([^)]+)\)\.toFixed\(2\)\s*\}\}', r'{{ formatCurrency(\1, locale) }}', content)
    # ¥{{ expr.toLocaleString() }}
    content = re.sub(r'¥\{\{\s*([^}]+?)\.toLocaleString\(\)\s*\}\}', r'{{ formatCurrency(\1, locale) }}', content)
    # `¥${expr.toFixed(2)}`
    content = re.sub(r'`¥\$\{([^}]+?)\.toFixed\(2\)\}`', r'formatCurrency(\1, locale)', content)

    if content != original:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(content)
        print(f'Updated: {f}')
    else:
        print(f'No changes: {f}')
