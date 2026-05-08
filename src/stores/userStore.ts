import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCartStore } from './cartStore';
import { postData } from '@/api/request';
import { setAccessToken, clearAccessToken } from '@/utils/tokenStorage';

const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_PROFILE_KEY = 'user_profile';

export interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  userType: 'customer' | 'admin';
  avatar: string;
  level: string;
  phone: string;
  email: string;
  status: string;
  goodReviewCount: number;
  favoriteCount: number;
  memberSince: string;
  city: string;
  roleCodes: string[];
  permissionCodes: string[];
}

export interface UserLoginPayload {
  token: string;
  refreshToken?: string;
  profile?: Partial<UserProfile>;
}

const EMPTY_PROFILE: UserProfile = {
  id: 0, username: '', displayName: '', userType: 'customer', avatar: '',
  level: '', phone: '', email: '', status: 'enabled',
  goodReviewCount: 0, favoriteCount: 0, memberSince: '', city: '',
  roleCodes: [], permissionCodes: [],
};

const getSafeStorageValue = (key: string): string => {
  try { return window.localStorage.getItem(key)?.trim() || ''; }
  catch { return ''; }
};

const parseProfileFromStorage = (): UserProfile => {
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      id: parsed.id || 0,
      username: parsed.username || '',
      displayName: parsed.displayName || parsed.username || '',
      userType: parsed.userType || 'customer',
      avatar: parsed.avatar || '',
      level: parsed.level || '',
      phone: parsed.phone || '',
      email: parsed.email || '',
      status: parsed.status || 'enabled',
      goodReviewCount: parsed.goodReviewCount ?? 0,
      favoriteCount: parsed.favoriteCount ?? 0,
      memberSince: parsed.memberSince || '',
      city: parsed.city || '',
      roleCodes: parsed.roleCodes || [],
      permissionCodes: parsed.permissionCodes || [],
    };
  } catch {
    return { ...EMPTY_PROFILE };
  }
};

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('');
  const profile = ref<UserProfile>({ ...EMPTY_PROFILE });

  const isLogin = computed(() => token.value.length > 0);
  const isGuest = computed(() => !isLogin.value);
  const username = computed(() => profile.value.username);
  const displayName = computed(() => profile.value.displayName || profile.value.username);
  const userType = computed(() => profile.value.userType);
  const avatar = computed(() => profile.value.avatar);
  const level = computed(() => profile.value.level);
  const goodReviewCount = computed(() => profile.value.goodReviewCount);
  const roleCodes = computed(() => profile.value.roleCodes);
  const permissionCodes = computed(() => profile.value.permissionCodes);
  const isAdmin = computed(() => profile.value.userType === 'admin');
  const isCustomer = computed(() => userType.value === 'customer');
  const favoriteCount = computed(() => profile.value.favoriteCount);

  const initFromStorage = (): void => {
    profile.value = parseProfileFromStorage();
    const rt = getSafeStorageValue(REFRESH_TOKEN_KEY);
    if (rt) { void refreshAccessToken(); }
    else { token.value = ''; clearAccessToken(); }
  };

  const login = (payload: UserLoginPayload): void => {
    token.value = payload.token;
    setAccessToken(payload.token);
    const p = payload.profile;
    profile.value = {
      id: p?.id || 0,
      username: p?.username || '',
      displayName: p?.displayName || p?.username || '',
      userType: p?.userType || 'customer',
      avatar: p?.avatar || '',
      level: p?.level || '',
      phone: p?.phone || '',
      email: p?.email || '',
      status: p?.status || 'enabled',
      goodReviewCount: p?.goodReviewCount ?? 0,
      favoriteCount: p?.favoriteCount ?? 0,
      memberSince: p?.memberSince || '',
      city: p?.city || '',
      roleCodes: p?.roleCodes || [],
      permissionCodes: p?.permissionCodes || [],
    };
    if (payload.refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    }
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile.value));
  };

  const setProfile = (next: Partial<UserProfile>): void => {
    profile.value = { ...profile.value, ...next, displayName: next.displayName || profile.value.displayName };
    window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile.value));
  };

  const logout = (): void => {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_PROFILE_KEY);
    token.value = '';
    clearAccessToken();
    profile.value = { ...EMPTY_PROFILE };
    useCartStore().clearCart();
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    const rt = getSafeStorageValue(REFRESH_TOKEN_KEY);
    if (!rt) return false;
    try {
      const res = await postData<{ token: string }>('/auth/refresh', { refreshToken: rt });
      token.value = res.token;
      setAccessToken(res.token);
      return true;
    } catch {
      logout();
      return false;
    }
  };

  return {
    token, profile, username, displayName, userType, avatar, level,
    goodReviewCount, favoriteCount, roleCodes, permissionCodes,
    isLogin, isGuest, isAdmin, isCustomer,
    initFromStorage, login, setProfile, logout,
  };
});
