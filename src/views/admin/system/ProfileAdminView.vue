<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { updateProfileApi, fetchProfileApi } from '@/api/profile';
import { useAppI18n } from '@/composables/useAppI18n';
import { useUserStore } from '@/stores/userStore';

const { t } = useAppI18n();
const userStore = useUserStore();
const saving = ref(false);
const savedOk = ref(false);
const errorMsg = ref('');

const form = reactive({
  displayName: '',
  phone: '',
  email: ''
});

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const savingPwd = ref(false);
const pwdError = ref('');
const pwdOk = ref(false);

const loadProfile = async (): Promise<void> => {
  try {
    const profile = await fetchProfileApi();
    form.displayName = profile.displayName;
    form.phone = profile.phone;
    form.email = profile.email;
  } catch {
    // 如果后端没有 profile 接口，使用 store 中的数据
    form.displayName = userStore.displayName;
  }
};

const saveProfile = async (): Promise<void> => {
  if (!form.displayName.trim()) {
    errorMsg.value = t('admin.profile.err.display');
    return;
  }
  saving.value = true;
  errorMsg.value = '';
  try {
    const profile = await updateProfileApi({ ...form });
    userStore.setProfile({
      username: profile.username,
      displayName: profile.displayName,
      roleCodes: profile.roleCodes,
      permissionCodes: profile.permissionCodes
    });
    savedOk.value = true;
    setTimeout(() => { savedOk.value = false; }, 2000);
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('admin.profile.err.save');
  } finally {
    saving.value = false;
  }
};

const changePassword = (): void => {
  pwdError.value = '';
  if (!pwdForm.oldPassword) {
    pwdError.value = t('admin.profile.pwdErrOld');
    return;
  }
  if (pwdForm.newPassword.length < 6) {
    pwdError.value = t('admin.profile.pwdErrLen');
    return;
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = t('admin.profile.pwdErrMatch');
    return;
  }
  // 这里前端演示场景模拟成功
  savingPwd.value = true;
  setTimeout(() => {
    savingPwd.value = false;
    pwdOk.value = true;
    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';
    setTimeout(() => { pwdOk.value = false; }, 2000);
  }, 800);
};

onMounted(() => {
  void loadProfile();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.profile.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.profile.sub') }}</p>
      </div>
    </section>

    <section class="admin-grid-2 anim-fade-up anim-delay-1">
      <!-- 基础资料 -->
      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.profile.basic') }}</h3>

        <div v-if="errorMsg" class="form-tip form-tip--error">⚠ {{ errorMsg }}</div>
        <div v-if="savedOk" class="form-tip form-tip--ok">{{ t('admin.profile.saved') }}</div>

        <label class="form-row">
          <span class="form-label">{{ t('admin.profile.accountReadonly') }}</span>
          <input class="admin-input" :value="userStore.username" disabled />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.profile.displayName') }}</span>
          <input v-model="form.displayName" class="admin-input" :placeholder="t('admin.profile.displayPh')" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.profile.phone') }}</span>
          <input v-model="form.phone" class="admin-input" placeholder="138xxxx0000" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.profile.email') }}</span>
          <input v-model="form.email" class="admin-input" type="email" placeholder="you@example.com" />
        </label>

        <div class="admin-actions" style="margin-top: 18px;">
          <button
            type="button"
            class="ui-btn ui-btn--primary"
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? t('admin.profile.saving') : t('admin.profile.save') }}
          </button>
        </div>
      </article>

      <!-- 右侧：头像卡 + 修改密码 -->
      <div class="side-col">
        <!-- 头像 -->
        <article class="admin-panel profile-card">
          <div class="profile-avatar">{{ (userStore.displayName || 'A').slice(0, 1) }}</div>
          <p class="profile-name">{{ userStore.displayName || t('admin.profile.noName') }}</p>
          <p class="profile-username">@{{ userStore.username }}</p>
          <div class="profile-roles">
            <span
              v-for="code in userStore.roleCodes"
              :key="code"
              class="admin-chip admin-chip--info"
            >{{ code }}</span>
          </div>
        </article>

        <!-- 修改密码 -->
        <article class="admin-panel">
          <h3 class="admin-panel__title">{{ t('admin.profile.pwdTitle') }}</h3>

          <div v-if="pwdError" class="form-tip form-tip--error">⚠ {{ pwdError }}</div>
          <div v-if="pwdOk" class="form-tip form-tip--ok">{{ t('admin.profile.pwdOk') }}</div>

          <label class="form-row">
            <span class="form-label">{{ t('admin.profile.pwdOld') }}</span>
            <input v-model="pwdForm.oldPassword" class="admin-input" type="password" :placeholder="t('admin.profile.pwdPhOld')" />
          </label>

          <label class="form-row">
            <span class="form-label">{{ t('admin.profile.pwdNew') }}</span>
            <input v-model="pwdForm.newPassword" class="admin-input" type="password" :placeholder="t('admin.profile.pwdPhNew')" />
          </label>

          <label class="form-row">
            <span class="form-label">{{ t('admin.profile.pwdConfirm') }}</span>
            <input v-model="pwdForm.confirmPassword" class="admin-input" type="password" :placeholder="t('admin.profile.pwdPhConfirm')" />
          </label>

          <div class="admin-actions" style="margin-top: 18px;">
            <button
              type="button"
              class="ui-btn ui-btn--ghost"
              :disabled="savingPwd"
              @click="changePassword"
            >
              {{ savingPwd ? t('admin.profile.pwdDoing') : t('admin.profile.pwdBtn') }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--admin-text-muted, #6b6b6b);
}

.form-tip {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 14px;
}

.form-tip--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.form-tip--ok {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px;
  text-align: center;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #e8532d;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  box-shadow: none;
}

.profile-name {
  color: var(--admin-text, #1a1a1a);
  font-size: 18px;
  font-weight: 600;
}

.profile-username {
  color: var(--admin-text-muted, #6b6b6b);
  font-size: 13px;
}

.profile-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
</style>
