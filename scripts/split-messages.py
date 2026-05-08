import re, os, json

with open('src/i18n/messages.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract zhCN object
zh_match = re.search(r"const zhCN: Record<string, string> = \{(.*?)\n\};", content, re.DOTALL)
en_match = re.search(r"const enUS: Record<string, string> = \{(.*?)\n\};", content, re.DOTALL)

def parse_obj(text):
    result = {}
    # Match 'key': 'value',
    for m in re.finditer(r"\s+'([^']+)':\s+'([^']*)',?", text):
        result[m.group(1)] = m.group(2)
    return result

zhCN = parse_obj(zh_match.group(1))
enUS = parse_obj(en_match.group(1))

# Prefix to file mapping
PREFIX_MAP = {
    'layout': 'layout',
    'menu': 'admin',
    'route': 'route',
    'dash': 'admin',
    'admin': 'admin',
    'perm': 'admin',
    'home': 'home',
    'front': 'layout',
    'footer': 'layout',
    'login': 'user',
    'register': 'user',
    'forgotPassword': 'user',
    'address': 'address',
    'checkout': 'cart',
    'orderSuccess': 'cart',
    'order': 'order',
    'productList': 'product',
    'cart': 'cart',
    'user': 'user',
    'fav': 'user',
    'detail': 'product',
    'shop': 'product',
    'card': 'common',
    'star': 'common',
    'common': 'common',
    'role': 'admin',
    'notFound': 'common',
    'lang': 'common',
    'credit': 'common',
    'category': 'common',
}

groups = {}
for key in zhCN:
    prefix = key.split('.')[0]
    group = PREFIX_MAP.get(prefix, 'common')
    if group not in groups:
        groups[group] = []
    groups[group].append(key)

# Create directories
os.makedirs('src/i18n/locales/zh-CN', exist_ok=True)
os.makedirs('src/i18n/locales/en-US', exist_ok=True)

for group, keys in sorted(groups.items()):
    zh_lines = [f"  '{k}': '{zhCN[k]}'," for k in keys]
    en_lines = [f"  '{k}': '{enUS[k]}'," for k in keys]

    for lang, lines in [('zh-CN', zh_lines), ('en-US', en_lines)]:
        path = f'src/i18n/locales/{lang}/{group}.ts'
        with open(path, 'w', encoding='utf-8') as f:
            f.write(f'export const {group}Messages = {{\n')
            f.write('\n'.join(lines))
            f.write('\n};\n')
        print(f'Written: {path} ({len(lines)} keys)')

# Generate index.ts
index_content = """import type { AppLocale } from './messages';

// zh-CN modules
"""

modules = sorted(groups.keys())
for m in modules:
    index_content += f"import {{ {m}Messages as zh{m.capitalize()} }} from './locales/zh-CN/{m}';\n"

index_content += "\n// en-US modules\n"
for m in modules:
    index_content += f"import {{ {m}Messages as en{m.capitalize()} }} from './locales/en-US/{m}';\n"

index_content += """
export const appMessages: Record<AppLocale, Record<string, string>> = {
  'zh-CN': {
"""
for m in modules:
    index_content += f"    ...zh{m.capitalize()},\n"
index_content += """  },
  'en-US': {
"""
for m in modules:
    index_content += f"    ...en{m.capitalize()},\n"
index_content += """  }
};
"""

with open('src/i18n/index.ts', 'w', encoding='utf-8') as f:
    f.write(index_content)
print('Written: src/i18n/index.ts')
