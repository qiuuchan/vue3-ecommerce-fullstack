import os

files = [
    'src/composables/useAppI18n.ts',
    'src/router/index.ts',
    'src/utils/categoryI18n.ts',
    'src/utils/creditI18n.ts',
]

for f in files:
    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()
    content = content.replace("from '@/i18n/messages'", "from '@/i18n/index'")
    with open(f, 'w', encoding='utf-8') as fh:
        fh.write(content)
    print('Updated:', f)
