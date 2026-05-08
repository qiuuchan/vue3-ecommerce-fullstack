/**
 * i18n 类型与工具函数。
 * 文案数据已迁移到 src/i18n/index.ts（由 src/i18n/locales/ 下的模块合并而成）。
 */
export type AppLocale = 'zh-CN' | 'en-US';

/** 权限码 product:view → 字典键 perm.product.view */
export function permissionMessageKey(code: string): string {
  return `perm.${code.replace(/:/g, '.')}`;
}
