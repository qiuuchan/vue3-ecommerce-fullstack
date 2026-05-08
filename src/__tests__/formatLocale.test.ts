import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateTime } from '@/utils/formatLocale';

describe('formatCurrency', () => {
  it('中文环境应格式化为人民币', () => {
    const result = formatCurrency(39.9, 'zh-CN');
    expect(result).toContain('39.90');
    expect(result).toContain('¥');
  });

  it('英文环境应格式化为 CNY', () => {
    const result = formatCurrency(39.9, 'en-US');
    expect(result).toContain('39.90');
    // Intl.NumberFormat 在 en-US 环境下输出 CN¥ 而非 CNY
    expect(result).toContain('CN');
  });

  it('零值应正确格式化', () => {
    const result = formatCurrency(0, 'zh-CN');
    expect(result).toContain('0.00');
  });

  it('整数应补齐两位小数', () => {
    const result = formatCurrency(100, 'zh-CN');
    expect(result).toContain('100.00');
  });
});

describe('formatDateTime', () => {
  it('应正确格式化 ISO 字符串', () => {
    const result = formatDateTime('2026-04-03T09:30:00', 'zh-CN');
    expect(result).toContain('2026');
    expect(result).toContain('04');
    expect(result).toContain('03');
  });

  it('应正确格式化 Date 对象', () => {
    const d = new Date(2026, 3, 3, 9, 30);
    const result = formatDateTime(d, 'zh-CN');
    expect(result).toContain('2026');
  });

  it('无效日期应返回空字符串', () => {
    const result = formatDateTime('invalid-date', 'zh-CN');
    expect(result).toBe('');
  });

  it('英文环境应使用对应格式', () => {
    const result = formatDateTime('2026-04-03T09:30:00', 'en-US');
    expect(result.length).toBeGreaterThan(0);
  });
});
