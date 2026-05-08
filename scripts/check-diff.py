import re

with open('src/i18n/messages.ts', 'r', encoding='utf-8') as f:
    content = f.read()

def parse_obj(text):
    result = {}
    for m in re.finditer(r"\s+'([^']+)':\s+'([^']*)',?", text):
        result[m.group(1)] = m.group(2)
    return result

zh_match = re.search(r"const zhCN: Record<string, string> = \{(.*?)\n\};", content, re.DOTALL)
en_match = re.search(r"const enUS: Record<string, string> = \{(.*?)\n\};", content, re.DOTALL)
zhCN = parse_obj(zh_match.group(1))
enUS = parse_obj(en_match.group(1))

zh_only = set(zhCN.keys()) - set(enUS.keys())
en_only = set(enUS.keys()) - set(zhCN.keys())
print('zh-CN only:', len(zh_only))
for k in sorted(zh_only):
    print(' ', k)
print('en-US only:', len(en_only))
for k in sorted(en_only):
    print(' ', k)
