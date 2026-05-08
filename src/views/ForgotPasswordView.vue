<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Key, WarningFilled } from '@element-plus/icons-vue';
import { resetPasswordApi } from '@/api/user';
import { useAppI18n } from '@/composables/useAppI18n';
import AppLanguageSwitch from '@/components/AppLanguageSwitch.vue';

const router = useRouter();
const { t } = useAppI18n();

const account = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const isFormValid = computed(() => {
  return (
    account.value.trim().length > 0 &&
    newPassword.value.length >= 6 &&
    newPassword.value === confirmPassword.value
  );
});

const handleReset = async (): Promise<void> => {
  if (loading.value || !isFormValid.value) return;
  loading.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    await resetPasswordApi({
      username: account.value.trim(),
      newPassword: newPassword.value
    });
    successMsg.value = t('forgotPassword.success');
    setTimeout(() => {
      void router.push('/login');
    }, 1500);
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('forgotPassword.error.generic');
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
          <Key />
        </el-icon>
      </div>

      <h2 class="login-title">{{ t('forgotPassword.title') }}</h2>
      <p class="login-sub">{{ t('forgotPassword.subtitle') }}</p>

      <div v-if="errorMsg" class="login-error">
        <el-icon class="login-error__icon" :size="16" aria-hidden="true"><WarningFilled /></el-icon>
        <span>{{ errorMsg }}</span>
      </div>

      <div v-if="successMsg" class="login-success">
        <span>{{ successMsg }}</span>
      </div>

      <form @submit.prevent="handleReset">
        <label class="ui-field">
          <span class="ui-label">{{ t('forgotPassword.label.account') }}</span>
          <input
            v-model="account"
            class="ui-input"
            type="text"
            :placeholder="t('forgotPassword.ph.account')"
            autocomplete="username"
          >
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('forgotPassword.label.newPassword') }}</span>
          <input
            v-model="newPassword"
            class="ui-input"
            type="password"
            :placeholder="t('forgotPassword.ph.newPassword')"
            autocomplete="new-password"
          >
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('forgotPassword.label.confirmPassword') }}</span>
          <input
            v-model="confirmPassword"
            class="ui-input"
            type="password"
            :placeholder="t('forgotPassword.ph.confirmPassword')"
            autocomplete="new-password"
          >
        </label>

        <div class="register-hints">
          <p v-if="newPassword.length > 0 && newPassword.length < 6" class="hint-error">
            {{ t('register.error.passwordLength') }}
          </p>
          <p v-if="confirmPassword.length > 0 && newPassword !== confirmPassword" class="hint-error">
            {{ t('register.error.passwordMismatch') }}
          </p>
        </div>

        <el-button
          type="primary"
          native-type="submit"
          class="login-submit-el"
          :loading="loading"
          :disabled="!isFormValid"
          style="width: 100%; margin-top: 8px"
        >
          {{ t('forgotPassword.submit') }} →
        </el-button>
      </form>

      <p class="login-footer">
        <router-link to="/login" class="login-link">{{ t('forgotPassword.backLogin') }}</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  position: relative;
  background: #fafafa;
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

.login-success {
  padding: 10px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  font-size: .85rem;
  color: #15803d;
  margin-bottom: 8px;
}

.register-hints {
  margin-top: 4px;
  min-height: 20px;
}

.hint-error {
  font-size: .8125rem;
  color: #b91c1c;
  margin: 0;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: .8125rem;
  color: #9a9a9a;
}

.login-link {
  color: #e8532d;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
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
