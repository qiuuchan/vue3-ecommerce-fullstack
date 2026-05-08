import { describe, expect, it } from 'vitest';
import type { AxiosError } from 'axios';
import { getAxiosErrorMessage } from './request';

describe('getAxiosErrorMessage', () => {
  it('优先使用后端 message 字段', () => {
    const err = {
      message: 'Network Error',
      response: { data: { message: '账号或密码错误' } }
    } as AxiosError<{ message?: string }>;
    expect(getAxiosErrorMessage(err)).toBe('账号或密码错误');
  });

  it('无后端 message 时用 axios message', () => {
    const err = {
      message: 'timeout of 15000ms exceeded',
      response: undefined
    } as AxiosError<{ message?: string }>;
    expect(getAxiosErrorMessage(err)).toContain('timeout');
  });
});
