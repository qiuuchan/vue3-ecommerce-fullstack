<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Shop, Key, WarningFilled } from '@element-plus/icons-vue';
import { loginApi } from '@/api/user';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { useAppI18n } from '@/composables/useAppI18n';
import AppLanguageSwitch from '@/components/AppLanguageSwitch.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const { t, locale } = useAppI18n();

const loginType = ref<'customer' | 'admin'>('customer');
const account = ref('user01');
const password = ref('123456');
const loading = ref(false);
const errorMsg = ref('');

const redirectPath = computed(() => {
  return typeof route.query.redirect === 'string' ? route.query.redirect : '';
});

const accountHint = computed(() => {
  void locale.value;
  return loginType.value === 'customer' ? t('login.hint.customer') : t('login.hint.admin');
});

const handleSwitchLoginType = (type: 'customer' | 'admin'): void => {
  loginType.value = type;
  errorMsg.value = '';
  if (type === 'customer') {
    account.value = 'user01';
    password.value = '123456';
    return;
  }
  account.value = 'admin';
  password.value = '123456';
};

const handleLogin = async (): Promise<void> => {
  if (loading.value) return;
  loading.value = true;
  errorMsg.value = '';
  try {
    const result = await loginApi({
      username: account.value,
      password: password.value,
      loginType: loginType.value,
    });
    userStore.login({
      token: result.token,
      refreshToken: result.refreshToken,
      profile: result.profile
    });
    await cartStore.loadCart({ silent: true });
    await router.push(redirectPath.value || (userStore.isAdmin ? '/admin/dashboard' : '/products'));
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('login.error.generic');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page login-standalone">
    <div class="login-card">
      <div class="login-card__top">
        <AppLanguageSwitch />
      </div>
      <div class="login-logo">
        <el-icon class="login-logo__icon" :size="36" aria-hidden="true">
          <Shop />
        </el-icon>
      </div>

      <h2 class="login-title">{{ t('login.title') }}</h2>
      <p class="login-sub">{{ t('login.subtitle') }}</p>

      <div class="login-tabs">
        <button
          type="button"
          class="login-tabs__item"
          :class="{ 'login-tabs__item--active': loginType === 'customer' }"
          @click="handleSwitchLoginType('customer')"
        >
          {{ t('login.tab.customer') }}
        </button>
        <button
          type="button"
          class="login-tabs__item"
          :class="{ 'login-tabs__item--active': loginType === 'admin' }"
          @click="handleSwitchLoginType('admin')"
        >
          {{ t('login.tab.admin') }}
        </button>
      </div>

      <div class="login-hint-bar">
        <el-icon :size="16" aria-hidden="true"><Key /></el-icon>
        <span>{{ accountHint }}</span>
      </div>

      <div v-if="errorMsg" class="login-error">
        <el-icon class="login-error__icon" :size="16" aria-hidden="true"><WarningFilled /></el-icon>
        <span>{{ errorMsg }}</span>
      </div>

      <form @submit.prevent="handleLogin">
        <label class="ui-field">
          <span class="ui-label">{{ t('login.label.account') }}</span>
          <input
            v-model="account"
            class="ui-input"
            type="text"
            :placeholder="t('login.ph.account')"
            autocomplete="username"
          >
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('login.label.password') }}</span>
          <input
            v-model="password"
            class="ui-input"
            type="password"
            :placeholder="t('login.ph.password')"
            autocomplete="current-password"
          >
        </label>

        <el-button
          type="primary"
          native-type="submit"
          class="login-submit-el"
          :loading="loading"
          style="width: 100%; margin-top: 8px"
        >
          {{ loginType === 'customer' ? t('login.submit.mall') : t('login.submit.admin') }} →
        </el-button>
      </form>

      <p class="login-footer">
        {{ loginType === 'customer' ? t('login.footer.customer') : t('login.footer.admin') }}
      </p>

      <div class="login-links">
        <router-link to="/register" class="login-link">{{ t('login.link.register') }}</router-link>
        <span class="login-link-sep">·</span>
        <router-link to="/forgot-password" class="login-link">{{ t('login.link.forgotPassword') }}</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 独立登录页：与前台一致的极简纸面风格 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  position: relative;
  background: #fafafa;
}

.login-bg-blob {
  display: none;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 48px 40px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  box-shadow: none;
}

.login-card__top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.login-logo {
  text-align: center;
  margin-bottom: 20px;
}

.login-logo__icon {
  color: #e8532d;
  opacity: 0.9;
}

.login-title {
  text-align: center;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.login-sub {
  text-align: center;
  font-size: .875rem;
  color: #6b6b6b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.login-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.login-tabs__item {
  height: 42px;
  border: 1px solid #e5e5e5;
  background: #fafafa;
  color: #6b6b6b;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color .2s, background .2s, color .2s;
}

.login-tabs__item--active {
  color: #e8532d;
  background: #fff;
  border-color: #e8532d;
  box-shadow: none;
}

.login-hint-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b6b6b;
  padding: 10px 14px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: .8125rem;
  margin-bottom: 16px;
}

.login-error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  font-size: .85rem;
  color: #b91c1c;
  margin-bottom: 8px;
}

.login-error__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.login-submit {
  margin-top: 24px;
  height: 48px;
  font-size: 1rem;
  letter-spacing: .02em;
  border-radius: var(--r-md);
}

.login-submit.loading {
  opacity: .7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: .8125rem;
  color: #9a9a9a;
}

.login-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  font-size: .8125rem;
}

.login-link {
  color: #e8532d;
  text-decoration: none;
  transition: color .2s;
}

.login-link:hover {
  color: #2c435f;
  text-decoration: underline;
}

.login-link-sep {
  color: #d1d5db;
}

/* 覆盖全局深色 ui-* 表单样式，适配白底卡片 */
.login-card :deep(.ui-label) {
  color: #6b6b6b;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.02em;
}

.login-card :deep(.ui-input) {
  color: #1a1a1a;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}

.login-card :deep(.ui-input::placeholder) {
  color: #9a9a9a;
}

.login-card :deep(.ui-input:hover) {
  border-color: #bdbdbd;
  background: #fff;
}

.login-card :deep(.ui-input:focus) {
  border-color: #e8532d;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(61, 90, 128, 0.12);
}
</style>
