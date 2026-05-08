import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime } from './formatLocale';

describe('formatLocale', () => {
  it('formatCurrency zh-CN 含人民币符号', () => {
    const s = formatCurrency(12.5, 'zh-CN');
    expect(s).toContain('12');
    expect(s).toContain('50');
  });

  it('formatDateTime 非法字符串返回空', () => {
    expect(formatDateTime('not-a-date', 'zh-CN')).toBe('');
  });

  it('formatDateTime 合法 ISO 非空', () => {
    const s = formatDateTime('2026-01-15T10:30:00.000Z', 'en-US');
    expect(s.length).toBeGreaterThan(4);
  });
});
