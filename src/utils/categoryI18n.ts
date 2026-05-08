import { appMessages } from '@/i18n/index';

const CATEGORY_MAP: Record<string, string> = {
  '生鲜水果': 'category.freshFruit',
  '乳品饮品': 'category.dairy',
  '谷物粮油': 'category.grain',
  '地方特产': 'category.localSpecialty'
};

/**
 * 将后端返回的中文分类名翻译为当前语言。
 * 如果找不到映射，则原样返回。
 */
export function translateCategoryName(categoryName: string | undefined, locale: string): string {
  if (!categoryName) return '';
  const key = CATEGORY_MAP[categoryName];
  if (!key) return categoryName;
  const table = appMessages[locale as keyof typeof appMessages] ?? appMessages['zh-CN'];
  return (table[key] as string) || categoryName;
}
