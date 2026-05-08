import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import * as tokenStorage from '@/utils/tokenStorage';

vi.mock('@/api/request', () => ({
  postData: vi.fn()
}));

vi.mock('@/stores/cartStore', () => ({
  useCartStore: vi.fn(() => ({
    clearCart: vi.fn()
  }))
}));

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('初始状态应为未登录', () => {
    const store = useUserStore();
    expect(store.isLogin).toBe(false);
    expect(store.isGuest).toBe(true);
    expect(store.isAdmin).toBe(false);
    expect(store.username).toBe('');
  });

  it('login 应更新状态和 localStorage', () => {
    const store = useUserStore();
    store.login({
      token: 'test-token',
      refreshToken: 'refresh-123',
      profile: {
        username: 'user01',
        displayName: 'Test User',
        userType: 'customer'
      }
    });

    expect(store.isLogin).toBe(true);
    expect(store.username).toBe('user01');
    expect(store.displayName).toBe('Test User');
    expect(localStorage.getItem('user_profile')).toContain('user01');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-123');
  });

  it('login 为 admin 时 isAdmin 应为 true', () => {
    const store = useUserStore();
    store.login({
      token: 'admin-token',
      profile: { username: 'admin', userType: 'admin' }
    });
    expect(store.isAdmin).toBe(true);
    expect(store.isCustomer).toBe(false);
  });

  it('logout 应清空所有状态', () => {
    const store = useUserStore();
    store.login({
      token: 'test-token',
      profile: { username: 'user01', userType: 'customer' }
    });
    store.logout();

    expect(store.isLogin).toBe(false);
    expect(store.token).toBe('');
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_profile')).toBeNull();
  });

  it('setProfile 应更新资料并持久化', () => {
    const store = useUserStore();
    store.login({
      token: 'test-token',
      profile: { username: 'user01', displayName: 'Old', userType: 'customer' }
    });
    store.setProfile({ displayName: 'New Name' });

    expect(store.displayName).toBe('New Name');
    expect(localStorage.getItem('user_profile')).toContain('New Name');
  });

  it('initFromStorage 应从 localStorage 恢复资料', () => {
    const profile = {
      username: 'user01',
      displayName: 'Test',
      userType: 'customer',
      avatar: '',
      level: '',
      goodReviewCount: 0,
      favoriteCount: 0,
      memberSince: '',
      city: '',
      roleCodes: [],
      permissionCodes: []
    };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    const store = useUserStore();
    store.initFromStorage();

    expect(store.username).toBe('user01');
  });

  it('initFromStorage 无数据时应保持默认空状态', () => {
    const store = useUserStore();
    store.initFromStorage();
    expect(store.isLogin).toBe(false);
  });
});
