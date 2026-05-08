import { appMessages } from '@/i18n/index';

const CREDIT_MAP: Record<string, string> = {
  '皇冠': 'credit.crown',
  '钻石': 'credit.diamond'
};

/**
 * 将后端返回的中文信用等级翻译为当前语言。
 * 如果找不到映射，则原样返回。
 */
export function translateCreditLevel(level: string | undefined, locale: string): string {
  if (!level) return '';
  const key = CREDIT_MAP[level];
  if (!key) return level;
  const table = appMessages[locale as keyof typeof appMessages] ?? appMessages['zh-CN'];
  return (table[key] as string) || level;
}
