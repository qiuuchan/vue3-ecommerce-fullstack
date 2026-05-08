/**
 * 跨区域展示：金额 / 日期随语言区格式化（工程化：集中封装，页面少写魔法字符串）
 */

export type AppLocaleTag = 'zh-CN' | 'en-US';

const localeMap: Record<AppLocaleTag, string> = {
  'zh-CN': 'zh-CN',
  'en-US': 'en-US'
};

/** 金额：人民币基准，英文环境用 CNY 展示 */
export function formatCurrency(amount: number, locale: AppLocaleTag): string {
  const tag = localeMap[locale] ?? 'zh-CN';
  return new Intl.NumberFormat(tag, {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/** 日期：中等长度，适合订单/个人中心 */
export function formatDateTime(isoOrDate: string | Date, locale: AppLocaleTag): string {
  const tag = localeMap[locale] ?? 'zh-CN';
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}
