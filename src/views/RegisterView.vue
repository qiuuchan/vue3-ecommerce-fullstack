<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, WarningFilled, Refresh } from '@element-plus/icons-vue';
import { registerApi } from '@/api/user';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { useAppI18n } from '@/composables/useAppI18n';
import AppLanguageSwitch from '@/components/AppLanguageSwitch.vue';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const { t } = useAppI18n();

// Step tracking
const step = ref<1 | 2>(1);

// Step 1 fields
const account = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMsg = ref('');

const isStep1Valid = computed(() =>
  account.value.trim().length > 0 &&
  password.value.length >= 6 &&
  password.value === confirmPassword.value
);

// Step 2 fields
const displayName = ref('');
const email = ref('');

// Avatar picker
const generateAvatar = (seed?: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${seed || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const avatarStyles = [
  { name: 'shapes', seed: 'cube' },
  { name: 'bottts', seed: 'robot' },
  { name: 'pixel-art', seed: 'pixel' },
  { name: 'lorelei', seed: 'lorelei' },
  { name: 'notionists', seed: 'notion' },
  { name: 'rings', seed: 'ring' },
];

const avatars = ref(avatarStyles.map((s, i) => ({
  url: generateAvatar(`${s.seed}-${i}`),
  key: `${s.name}-${s.seed}-${i}`,
})));
const selectedAvatar = ref(avatars.value[0].url);

const randomizeAvatars = (): void => {
  avatars.value = avatarStyles.map((s, i) => ({
    url: generateAvatar(`${s.seed}-${Date.now()}-${i}`),
    key: `${s.name}-${s.seed}-${Date.now()}-${i}`,
  }));
  selectedAvatar.value = avatars.value[0].url;
};

const goStep2 = (): void => {
  if (!isStep1Valid.value) return;
  errorMsg.value = '';
  displayName.value = account.value.trim();
  step.value = 2;
};

const goBack = (): void => {
  step.value = 1;
  errorMsg.value = '';
};

const handleRegister = async (): Promise<void> => {
  if (loading.value) return;
  loading.value = true;
  errorMsg.value = '';
  try {
    const result = await registerApi({
      username: account.value.trim(),
      password: password.value,
      displayName: displayName.value.trim() || account.value.trim(),
      email: email.value.trim() || undefined,
      avatar: selectedAvatar.value,
    });
    userStore.login({
      token: result.token,
      refreshToken: result.refreshToken,
      profile: result.profile,
    });
    await cartStore.loadCart({ silent: true });
    await router.push('/products');
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('register.error.generic');
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
          <User />
        </el-icon>
      </div>

      <h2 class="login-title">{{ t('register.title') }}</h2>
      <p class="login-sub">
        {{ step === 1 ? t('register.subtitle') : t('register.subtitle2') }}
      </p>

      <!-- Step indicator -->
      <div class="register-steps">
        <span class="register-step" :class="{ 'register-step--active': step >= 1, 'register-step--done': step > 1 }">1</span>
        <span class="register-step__line" :class="{ 'register-step__line--done': step > 1 }" />
        <span class="register-step" :class="{ 'register-step--active': step >= 2 }">2</span>
      </div>

      <div v-if="errorMsg" class="login-error">
        <el-icon class="login-error__icon" :size="16" aria-hidden="true"><WarningFilled /></el-icon>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- ========== Step 1: Account ========== -->
      <form v-if="step === 1" @submit.prevent="goStep2">
        <label class="ui-field">
          <span class="ui-label">{{ t('register.label.account') }}</span>
          <input v-model="account" class="ui-input" type="text" :placeholder="t('register.ph.account')" autocomplete="username">
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('register.label.password') }}</span>
          <input v-model="password" class="ui-input" type="password" :placeholder="t('register.ph.password')" autocomplete="new-password">
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('register.label.confirmPassword') }}</span>
          <input v-model="confirmPassword" class="ui-input" type="password" :placeholder="t('register.ph.confirmPassword')" autocomplete="new-password">
        </label>

        <div class="register-hints">
          <p v-if="password.length > 0 && password.length < 6" class="hint-error">{{ t('register.error.passwordLength') }}</p>
          <p v-if="confirmPassword.length > 0 && password !== confirmPassword" class="hint-error">{{ t('register.error.passwordMismatch') }}</p>
        </div>

        <el-button type="primary" native-type="submit" class="login-submit-el" :disabled="!isStep1Valid" style="width: 100%; margin-top: 8px">
          {{ t('register.btn.next') }} →
        </el-button>
      </form>

      <!-- ========== Step 2: Profile ========== -->
      <form v-else @submit.prevent="handleRegister">
        <label class="ui-field">
          <span class="ui-label">{{ t('register.label.displayName') }}</span>
          <input v-model="displayName" class="ui-input" type="text" :placeholder="t('register.ph.displayName')" autocomplete="nickname">
        </label>

        <label class="ui-field">
          <span class="ui-label">{{ t('register.label.email') }}</span>
          <input v-model="email" class="ui-input" type="email" :placeholder="t('register.ph.email')">
        </label>

        <div class="register-avatar-section">
          <span class="ui-label">{{ t('register.label.avatar') }}</span>
          <div class="register-avatar-grid">
            <button
              v-for="av in avatars"
              :key="av.key"
              type="button"
              class="register-avatar-item"
              :class="{ 'register-avatar-item--active': selectedAvatar === av.url }"
              @click="selectedAvatar = av.url"
            >
              <img :src="av.url" alt="Avatar" class="register-avatar-img">
            </button>
          </div>
          <button type="button" class="register-random-btn" @click="randomizeAvatars">
            <el-icon :size="14"><Refresh /></el-icon>
            {{ t('register.btn.randomAvatar') }}
          </button>
        </div>

        <div class="register-step2-btns">
          <button type="button" class="register-back-btn" @click="goBack">
            ← {{ t('register.btn.back') }}
          </button>
          <el-button type="primary" native-type="submit" class="login-submit-el" :loading="loading" style="flex:1; margin:0">
            {{ t('register.submit') }} →
          </el-button>
        </div>
      </form>

      <p class="login-footer">
        <router-link to="/login" class="login-link">{{ t('register.hasAccount') }}</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 16px; background: #fafafa; }
.login-card { width: 100%; max-width: 420px; padding: 48px 40px; background: #fff; border: 1px solid #e5e5e5; border-radius: 6px; }
.login-card__top { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.login-logo { text-align: center; margin-bottom: 20px; }
.login-logo__icon { color: #e8532d; opacity: 0.9; }
.login-title { text-align: center; font-size: 1.35rem; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
.login-sub { text-align: center; font-size: .875rem; color: #6b6b6b; margin-bottom: 20px; }
.login-error { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; font-size: .85rem; color: #b91c1c; margin-bottom: 8px; }
.login-error__icon { flex-shrink: 0; margin-top: 2px; }
.login-footer { text-align: center; margin-top: 20px; font-size: .8125rem; color: #9a9a9a; }
.login-link { color: #e8532d; text-decoration: none; }
.login-link:hover { text-decoration: underline; }

/* Steps */
.register-steps { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 24px; }
.register-step { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .8125rem; font-weight: 700; background: #f0f0f0; color: #9a9a9a; }
.register-step--active { background: #e8532d; color: #fff; }
.register-step--done { background: #22c55e; color: #fff; }
.register-step__line { width: 40px; height: 2px; background: #e5e5e5; }
.register-step__line--done { background: #22c55e; }

.register-hints { margin-top: 4px; min-height: 20px; }
.hint-error { font-size: .8125rem; color: #b91c1c; margin: 0; }

/* Avatar */
.register-avatar-section { margin-bottom: 16px; }
.register-avatar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
.register-avatar-item { width: 100%; aspect-ratio: 1; border: 2px solid #e5e5e5; border-radius: 8px; overflow: hidden; cursor: pointer; padding: 2px; background: #fff; transition: border-color .2s; }
.register-avatar-item:hover { border-color: #bdbdbd; }
.register-avatar-item--active { border-color: #e8532d; background: #fdf0ec; }
.register-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
.register-random-btn { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 6px 14px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #6b6b6b; font-size: .8125rem; cursor: pointer; }
.register-random-btn:hover { border-color: #bdbdbd; color: #1a1a1a; }

.register-step2-btns { display: flex; gap: 12px; align-items: center; margin-top: 12px; }
.register-back-btn { padding: 10px 20px; border: 1px solid #e5e5e5; border-radius: 4px; background: #fff; color: #6b6b6b; font-size: .875rem; cursor: pointer; white-space: nowrap; }
.register-back-btn:hover { background: #f5f5f5; }

.login-card :deep(.ui-label) { color: #6b6b6b; font-weight: 500; letter-spacing: 0.02em; }
.login-card :deep(.ui-input) { color: #1a1a1a; background: #fff; border: 1px solid #e5e5e5; border-radius: 4px; }
.login-card :deep(.ui-input::placeholder) { color: #9a9a9a; }
.login-card :deep(.ui-input:hover) { border-color: #bdbdbd; background: #fff; }
.login-card :deep(.ui-input:focus) { border-color: #e8532d; background: #fff; box-shadow: 0 0 0 2px rgba(232,83,45,0.12); }
</style>
