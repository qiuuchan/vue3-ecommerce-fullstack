import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('初始未登录', () => {
    const store = useUserStore();
    store.initFromStorage();
    expect(store.isLogin).toBe(false);
    expect(store.isAdmin).toBe(false);
  });

  it('login 后写入 token 与 profile', () => {
    const store = useUserStore();
    store.login({
      token: 'demo-token',
      profile: {
        username: 'admin',
        displayName: '管理员',
        userType: 'admin',
        permissionCodes: ['product:view']
      }
    });
    expect(store.isLogin).toBe(true);
    expect(store.isAdmin).toBe(true);
    expect(store.token).toBe('demo-token');
    expect(store.token).toBe('demo-token');
  });

  it('logout 清空状态', () => {
    const store = useUserStore();
    store.login({ token: 't', profile: { username: 'u', userType: 'customer' } });
    store.logout();
    expect(store.isLogin).toBe(false);
    expect(store.token).toBe('');
  });
});
