import { describe, it, expect } from 'vitest';
import { setAccessToken, getAccessToken, clearAccessToken } from '@/utils/tokenStorage';

describe('tokenStorage', () => {
  it('初始状态应为空字符串', () => {
    expect(getAccessToken()).toBe('');
  });

  it('setAccessToken 应正确设置 token', () => {
    setAccessToken('demo-token-123');
    expect(getAccessToken()).toBe('demo-token-123');
  });

  it('clearAccessToken 应清空 token', () => {
    setAccessToken('demo-token-123');
    clearAccessToken();
    expect(getAccessToken()).toBe('');
  });

  it('连续设置应覆盖之前的值', () => {
    setAccessToken('token-a');
    setAccessToken('token-b');
    expect(getAccessToken()).toBe('token-b');
  });
});
