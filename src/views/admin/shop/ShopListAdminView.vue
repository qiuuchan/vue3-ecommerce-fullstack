<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  createAdminShopApi,
  deleteAdminShopApi,
  fetchAdminShopList,
  updateAdminShopApi
} from '@/api/adminShop';
import { useAppI18n } from '@/composables/useAppI18n';
import type { ShopAdminRecord } from '@/types/shop';
import { toastError } from '@/utils/toast';

const { t } = useAppI18n();
const shops = ref<ShopAdminRecord[]>([]);
const editingId = ref<number | null>(null);
const form = reactive({
  name: '',
  nameEn: '',
  tagline: '',
  taglineEn: '',
  description: '',
  descriptionEn: '',
  logo: '',
  banner: '',
  followerCount: 0,
  goodReviewCount: 0,
  status: 'active' as 'active' | 'off'
});

const loadShops = async (): Promise<void> => {
  try {
    shops.value = await fetchAdminShopList();
  } catch (error) {
    const msg = error instanceof Error ? error.message : t('admin.shop.loadFail');
    console.error(msg);
    toastError(msg);
  }
};

const resetForm = (): void => {
  editingId.value = null;
  form.name = '';
  form.nameEn = '';
  form.tagline = '';
  form.taglineEn = '';
  form.description = '';
  form.descriptionEn = '';
  form.logo = '';
  form.banner = '';
  form.followerCount = 0;
  form.goodReviewCount = 0;
  form.status = 'active';
};

const startEdit = (row: ShopAdminRecord): void => {
  editingId.value = row.id;
  form.name = row.name;
  form.nameEn = row.nameEn || '';
  form.tagline = row.tagline || '';
  form.taglineEn = row.taglineEn || '';
  form.description = row.description || '';
  form.descriptionEn = row.descriptionEn || '';
  form.logo = row.logo || '';
  form.banner = row.banner || '';
  form.followerCount = row.followerCount || 0;
  form.goodReviewCount = row.goodReviewCount || 0;
  form.status = row.status === 'off' ? 'off' : 'active';
};

const submitShop = async (): Promise<void> => {
  if (!form.name.trim()) {
    toastError(t('admin.shop.nameRequired'));
    return;
  }
  try {
    if (editingId.value) {
      await updateAdminShopApi(editingId.value, { ...form });
    } else {
      await createAdminShopApi({ ...form });
    }
    resetForm();
    await loadShops();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.shop.saveFail'));
  }
};

const removeShop = async (id: number): Promise<void> => {
  if (!window.confirm(t('admin.shop.delConfirm'))) return;
  try {
    await deleteAdminShopApi(id);
    await loadShops();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.shop.delFail'));
  }
};

onMounted(() => {
  void loadShops();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.shop.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.shop.sub') }}</p>
      </div>
    </section>

    <section class="admin-grid-2">
      <article class="admin-panel admin-panel--accent">
        <h3 class="admin-panel__title">{{ editingId ? t('admin.shop.formEdit') : t('admin.shop.formAdd') }}</h3>
        <div class="admin-filters admin-filters--stack">
          <input v-model="form.name" class="admin-input" :placeholder="t('admin.shop.ph.name')" >
          <input v-model="form.nameEn" class="admin-input" :placeholder="t('admin.shop.ph.nameEn')" >
          <input v-model="form.tagline" class="admin-input" :placeholder="t('admin.shop.ph.tagline')" >
          <input v-model="form.taglineEn" class="admin-input" :placeholder="t('admin.shop.ph.taglineEn')" >
          <textarea v-model="form.description" class="admin-textarea" :placeholder="t('admin.shop.ph.desc')" />
          <textarea v-model="form.descriptionEn" class="admin-textarea" :placeholder="t('admin.shop.ph.descEn')" />
          <input v-model="form.logo" class="admin-input" :placeholder="t('admin.shop.ph.logo')" >
          <input v-model="form.banner" class="admin-input" :placeholder="t('admin.shop.ph.banner')" >
          <input v-model.number="form.followerCount" class="admin-input" type="number" :placeholder="t('admin.shop.ph.followers')" >
          <input v-model.number="form.goodReviewCount" class="admin-input" type="number" :placeholder="t('admin.shop.ph.reviews')" >
          <select v-model="form.status" class="admin-select">
            <option value="active">{{ t('admin.shop.statusActive') }}</option>
            <option value="off">{{ t('admin.shop.statusOff') }}</option>
          </select>
        </div>
        <div class="admin-actions submit-actions">
          <button type="button" class="ui-btn ui-btn--ghost" @click="resetForm">{{ t('admin.btn.reset') }}</button>
          <button type="button" class="ui-btn ui-btn--primary" @click="submitShop">{{ t('admin.btn.save') }}</button>
        </div>
      </article>

      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.shop.list') }}</h3>
        <div v-if="shops.length === 0" class="admin-empty">{{ t('admin.shop.empty') }}</div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('admin.shop.col.name') }}</th>
                <th>{{ t('admin.shop.col.count') }}</th>
                <th>{{ t('admin.shop.col.status') }}</th>
                <th>{{ t('admin.shop.col.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in shops" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.productCount ?? 0 }}</td>
                <td>
                  <span
                    class="admin-chip"
                    :class="item.status === 'off' ? 'admin-chip--warning' : 'admin-chip--success'"
                  >
                    {{ item.status === 'off' ? t('admin.shop.rest') : t('admin.shop.open') }}
                  </span>
                </td>
                <td>
                  <div class="admin-actions">
                    <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="startEdit(item)">
                      {{ t('admin.btn.edit') }}
                    </button>
                    <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="removeShop(item.id)">
                      {{ t('admin.btn.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.submit-actions {
  margin-top: 16px;
}

.admin-filters--stack {
  grid-template-columns: 1fr;
}
</style>
