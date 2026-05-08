import re, os, json, ast

with open('src/i18n/messages.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract object body text between braces
def extract_body(start_marker):
    idx = content.find(start_marker)
    if idx == -1:
        return ''
    start = content.find('{', idx) + 1
    depth = 1
    end = start
    while depth > 0 and end < len(content):
        if content[end] == '{':
            depth += 1
        elif content[end] == '}':
            depth -= 1
        end += 1
    return content[start:end-1]

zh_body = extract_body('const zhCN: Record<string, string> =')
en_body = extract_body('const enUS: Record<string, string> =')

def parse_pairs(body):
    result = {}
    # Match 'key': 'value' allowing escaped quotes inside value
    pattern = r"\s+'((?:[^'\\]|\\.)*)':\s+'((?:[^'\\]|\\.)*)',?"
    for m in re.finditer(pattern, body):
        k = m.group(1)
        v = m.group(2)
        result[k] = v
    return result

zhCN = parse_pairs(zh_body)
enUS = parse_pairs(en_body)

print(f'zhCN keys: {len(zhCN)}, enUS keys: {len(enUS)}')
zh_only = set(zhCN.keys()) - set(enUS.keys())
en_only = set(enUS.keys()) - set(zhCN.keys())
if zh_only:
    print('zh only:', sorted(zh_only))
if en_only:
    print('en only:', sorted(en_only))

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
all_keys = sorted(set(zhCN.keys()) | set(enUS.keys()))
for key in all_keys:
    prefix = key.split('.')[0]
    group = PREFIX_MAP.get(prefix, 'common')
    if group not in groups:
        groups[group] = []
    groups[group].append(key)

os.makedirs('src/i18n/locales/zh-CN', exist_ok=True)
os.makedirs('src/i18n/locales/en-US', exist_ok=True)

for group, keys in sorted(groups.items()):
    for lang, source in [('zh-CN', zhCN), ('en-US', enUS)]:
        path = f'src/i18n/locales/{lang}/{group}.ts'
        with open(path, 'w', encoding='utf-8') as f:
            f.write(f'export const {group}Messages = {{\n')
            for k in keys:
                v = source.get(k, '')
                # Escape single quotes in value
                v = v.replace("\\", "\\\\").replace("'", "\\'")
                f.write(f"  '{k}': '{v}',\n")
            f.write('};\n')
        print(f'Written: {path} ({len(keys)} keys)')

# Generate index.ts
modules = sorted(groups.keys())
index_content = "import type { AppLocale } from './messages';\n\n"

for m in modules:
    index_content += f"import {{ {m}Messages as zh{m.capitalize()} }} from './locales/zh-CN/{m}';\n"
for m in modules:
    index_content += f"import {{ {m}Messages as en{m.capitalize()} }} from './locales/en-US/{m}';\n"

index_content += "\nexport const appMessages: Record<AppLocale, Record<string, string>> = {\n"
index_content += "  'zh-CN': {\n"
for m in modules:
    index_content += f"    ...zh{m.capitalize()},\n"
index_content += "  },\n"
index_content += "  'en-US': {\n"
for m in modules:
    index_content += f"    ...en{m.capitalize()},\n"
index_content += "  },\n"
index_content += "};\n"

with open('src/i18n/index.ts', 'w', encoding='utf-8') as f:
    f.write(index_content)
print('Written: src/i18n/index.ts')
