<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Star, ShoppingCart, Goods, List, Location, Edit, Refresh } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import { fetchUserCenterApi, updateUserProfileApi } from '@/api/user';
import type { UserProfileDto } from '@/api/user';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const userStore = useUserStore();
const center = ref<UserProfileDto | null>(null);
const loading = ref(true);
const errorMsg = ref('');
const isEditing = ref(false);
const saving = ref(false);
const saveError = ref('');

const editForm = ref({
  displayName: '',
  avatar: '',
  email: '',
  city: '',
});

const loadCenter = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = '';
  try {
    center.value = await fetchUserCenterApi();
    userStore.setProfile({
      displayName: center.value.displayName,
      level: center.value.level,
      goodReviewCount: center.value.goodReviewCount,
      favoriteCount: center.value.favoriteCount,
      memberSince: center.value.memberSince,
      city: center.value.city,
    } as any);
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('common.loadFailed');
  } finally {
    loading.value = false;
  }
};

const startEdit = (): void => {
  if (!center.value) return;
  editForm.value = {
    displayName: center.value.displayName || '',
    avatar: center.value.avatar || '',
    email: center.value.email || '',
    city: center.value.city || '',
  };
  saveError.value = '';
  isEditing.value = true;
};

const cancelEdit = (): void => {
  isEditing.value = false;
  saveError.value = '';
};

const randomizeAvatar = (): void => {
  editForm.value.avatar = `https://api.dicebear.com/9.x/shapes/svg?seed=${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const handleSaveProfile = async (): Promise<void> => {
  if (saving.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    const updated = await updateUserProfileApi({
      displayName: editForm.value.displayName,
      avatar: editForm.value.avatar,
      email: editForm.value.email,
      city: editForm.value.city,
    });
    center.value = updated;
    userStore.setProfile({ displayName: updated.displayName, avatar: updated.avatar, city: updated.city } as any);
    isEditing.value = false;
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : t('user.edit.error');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void loadCenter();
});
</script>

<template>
  <div class="uc-page">
    <h1 class="uc-title">{{ t('user.title') }}</h1>

    <div v-if="loading" class="uc-state">{{ t('common.loading') }}</div>
    <div v-else-if="errorMsg" class="uc-state uc-state--error">
      {{ errorMsg }}
      <button type="button" class="uc-retry" @click="loadCenter">{{ t('common.retry') }}</button>
    </div>

    <template v-else-if="center">
      <!-- ====== View Mode ====== -->
      <template v-if="!isEditing">
        <section class="uc-card uc-profile">
          <img v-if="center.avatar" :src="center.avatar" :alt="center.displayName" class="uc-avatar">
          <div>
            <h2 class="uc-name">{{ center.displayName }}</h2>
            <p class="uc-meta">{{ center.level }} · {{ center.city || t('user.noCity') }}</p>
            <p class="uc-meta">{{ t('user.since') }} {{ center.memberSince || t('card.dash') }}</p>
          </div>
          <button type="button" class="uc-edit-btn" @click="startEdit">
            <el-icon :size="16"><Edit /></el-icon>
            {{ t('user.edit.btn') }}
          </button>
        </section>

        <section class="uc-stats">
          <div class="uc-stat">
            <span class="uc-stat__val">{{ center.goodReviewCount }}</span>
            <span class="uc-stat__lab">{{ t('user.statReviews') }}</span>
          </div>
          <div class="uc-stat">
            <span class="uc-stat__val">{{ center.favoriteCount }}</span>
            <span class="uc-stat__lab">{{ t('user.statFav') }}</span>
          </div>
        </section>

        <section class="uc-links">
          <router-link to="/favorites" class="uc-link-card">
            <span class="uc-link-card__icon"><el-icon :size="20"><Star /></el-icon></span>
            <span>{{ t('user.linkFav') }}</span>
            <span class="uc-link-card__arrow">→</span>
          </router-link>
          <router-link to="/cart" class="uc-link-card">
            <span class="uc-link-card__icon"><el-icon :size="20"><ShoppingCart /></el-icon></span>
            <span>{{ t('user.linkCart') }}</span>
            <span class="uc-link-card__arrow">→</span>
          </router-link>
          <router-link to="/user/orders" class="uc-link-card">
            <span class="uc-link-card__icon"><el-icon :size="20"><List /></el-icon></span>
            <span>{{ t('user.linkOrders') }}</span>
            <span class="uc-link-card__arrow">→</span>
          </router-link>
          <router-link to="/user/addresses" class="uc-link-card">
            <span class="uc-link-card__icon"><el-icon :size="20"><Location /></el-icon></span>
            <span>{{ t('user.linkAddress') }}</span>
            <span class="uc-link-card__arrow">→</span>
          </router-link>
          <router-link to="/products" class="uc-link-card">
            <span class="uc-link-card__icon"><el-icon :size="20"><Goods /></el-icon></span>
            <span>{{ t('user.linkShop') }}</span>
            <span class="uc-link-card__arrow">→</span>
          </router-link>
        </section>
      </template>

      <!-- ====== Edit Mode ====== -->
      <template v-else>
        <section class="uc-card uc-edit-form">
          <h3 class="uc-edit-title">{{ t('user.edit.btn') }}</h3>

          <div v-if="saveError" class="login-error">
            {{ saveError }}
          </div>

          <label class="ui-field">
            <span class="ui-label">{{ t('user.edit.label.displayName') }}</span>
            <input v-model="editForm.displayName" class="ui-input" type="text" :placeholder="t('user.edit.ph.displayName')">
          </label>

          <label class="ui-field">
            <span class="ui-label">{{ t('user.edit.label.avatar') }}</span>
            <div class="uc-avatar-row">
              <input v-model="editForm.avatar" class="ui-input uc-avatar-input" type="text" placeholder="https://...">
              <button type="button" class="uc-random-btn" @click="randomizeAvatar">
                <el-icon :size="14"><Refresh /></el-icon>
                {{ t('user.edit.randomAvatar') }}
              </button>
            </div>
            <img v-if="editForm.avatar" :src="editForm.avatar" class="uc-avatar-preview" alt="Preview">
          </label>

          <label class="ui-field">
            <span class="ui-label">{{ t('user.edit.label.email') }}</span>
            <input v-model="editForm.email" class="ui-input" type="email" :placeholder="t('user.edit.ph.email')">
          </label>

          <label class="ui-field">
            <span class="ui-label">{{ t('user.edit.label.city') }}</span>
            <input v-model="editForm.city" class="ui-input" type="text" :placeholder="t('user.edit.ph.city')">
          </label>

          <div class="uc-edit-actions">
            <button type="button" class="uc-cancel-btn" @click="cancelEdit">{{ t('user.edit.cancel') }}</button>
            <button type="button" class="uc-save-btn" :disabled="saving" @click="handleSaveProfile">
              {{ saving ? '...' : t('user.edit.save') }}
            </button>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.uc-page { max-width: 720px; margin: 0 auto; padding: 24px 20px 48px; }
.uc-title { font-size: 1.75rem; font-weight: 600; color: #1a1a1a; margin-bottom: 24px; }
.uc-state { text-align: center; padding: 40px; color: #6b6b6b; }
.uc-state--error { color: #e11d48; }
.uc-retry { margin-top: 12px; padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e5e5; background: #fff; cursor: pointer; }

/* Card */
.uc-card { background: #fff; border-radius: 6px; padding: 24px; border: 1px solid #e5e5e5; margin-bottom: 20px; }
.uc-profile { display: flex; align-items: center; gap: 20px; position: relative; }
.uc-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid #e5e5e5; }
.uc-name { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin: 0; }
.uc-meta { font-size: .85rem; color: #6b6b6b; margin-top: 4px; }

.uc-edit-btn { position: absolute; top: 24px; right: 24px; display: flex; align-items: center; gap: 4px; padding: 6px 14px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #6b6b6b; font-size: .8125rem; cursor: pointer; }
.uc-edit-btn:hover { border-color: #e8532d; color: #e8532d; }

/* Stats */
.uc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.uc-stat { background: #fff; border-radius: 6px; padding: 20px; text-align: center; border: 1px solid #e5e5e5; }
.uc-stat__val { display: block; font-size: 1.5rem; font-weight: 600; color: #1a1a1a; }
.uc-stat__lab { font-size: .8rem; color: #6b6b6b; margin-top: 4px; display: block; }

/* Links */
.uc-links { display: flex; flex-direction: column; gap: 10px; }
.uc-link-card { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: #fff; border-radius: 6px; border: 1px solid #e5e5e5; text-decoration: none; color: #1a1a1a; font-weight: 500; }
.uc-link-card:hover { border-color: #e8532d; }
.uc-link-card__icon { display: flex; color: #6b6b6b; }
.uc-link-card__arrow { margin-left: auto; color: #94a3b8; }

/* Edit Form */
.uc-edit-title { font-size: 1.1rem; font-weight: 600; color: #1a1a1a; margin: 0 0 16px; }
.uc-edit-form .ui-field { display: block; margin-bottom: 16px; }
.uc-edit-form :deep(.ui-label) { display: block; font-size: .8125rem; font-weight: 600; color: #6b6b6b; margin-bottom: 6px; }
.uc-edit-form :deep(.ui-input) { width: 100%; padding: 10px 12px; border: 1px solid #e5e5e5; border-radius: 6px; font-size: .875rem; color: #1a1a1a; background: #fff; outline: none; box-sizing: border-box; }
.uc-edit-form :deep(.ui-input:focus) { border-color: #e8532d; }

.uc-avatar-row { display: flex; gap: 8px; }
.uc-avatar-input { flex: 1; }
.uc-random-btn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #6b6b6b; font-size: .75rem; cursor: pointer; white-space: nowrap; }
.uc-random-btn:hover { border-color: #bdbdbd; }
.uc-avatar-preview { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin-top: 8px; border: 2px solid #e5e5e5; }

.uc-edit-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
.uc-cancel-btn { padding: 10px 24px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fff; color: #6b6b6b; font-size: .875rem; cursor: pointer; }
.uc-cancel-btn:hover { background: #f5f5f5; }
.uc-save-btn { padding: 10px 24px; border: none; border-radius: 6px; background: #e8532d; color: #fff; font-size: .875rem; font-weight: 600; cursor: pointer; }
.uc-save-btn:hover { background: #d14422; }
.uc-save-btn:disabled { opacity: .6; cursor: not-allowed; }

.login-error { padding: 10px 14px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; font-size: .85rem; color: #b91c1c; margin-bottom: 12px; }
</style>
