<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchAdminShopList } from '@/api/adminShop';
import { fetchCategoryList } from '@/api/category';
import { createProductApi, fetchAdminProductDetail, updateProductApi } from '@/api/product';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const route = useRoute();
const router = useRouter();
const categories = ref<{ id: number; name: string }[]>([]);
const shops = ref<{ id: number; name: string }[]>([]);
const saving = ref(false);
const errorMsg = ref('');

const isEdit = computed(() => Boolean(route.params.id));

const form = reactive({
  name: '',
  nameEn: '',
  sku: '',
  categoryId: '',
  shopId: '',
  price: 0,
  originalPrice: 0,
  stock: 0,
  sales: 0,
  status: 'on_sale',
  cover: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80',
  description: '',
  descriptionEn: ''
});

const validateForm = (): string => {
  if (!form.name.trim()) return t('admin.form.err.name');
  if (!form.sku.trim()) return t('admin.form.err.sku');
  if (!form.categoryId) return t('admin.form.err.cat');
  if (Number(form.price) <= 0) return t('admin.form.err.price');
  if (Number(form.stock) < 0) return t('admin.form.err.stock');
  return '';
};

const loadData = async (): Promise<void> => {
  const [catList, shopList] = await Promise.all([fetchCategoryList(), fetchAdminShopList()]);
  categories.value = catList;
  shops.value = shopList.map((s) => ({ id: s.id, name: s.name }));
  if (isEdit.value) {
    const detail = await fetchAdminProductDetail(Number(route.params.id));
    form.name = detail.name;
    form.nameEn = detail.nameEn || '';
    form.sku = detail.sku || '';
    form.categoryId = detail.categoryId ? String(detail.categoryId) : '';
    form.shopId = detail.shopId ? String(detail.shopId) : shopList[0] ? String(shopList[0].id) : '';
    form.price = detail.price;
    form.originalPrice = detail.originalPrice || 0;
    form.stock = detail.stock || 0;
    form.sales = detail.sales || 0;
    form.status = detail.status || 'on_sale';
    form.cover = detail.cover;
    form.description = detail.description || '';
    form.descriptionEn = detail.descriptionEn || '';
  } else if (shopList.length && !form.shopId) {
    form.shopId = String(shopList[0].id);
  }
};

const handleSubmit = async (): Promise<void> => {
  errorMsg.value = '';
  const errText = validateForm();
  if (errText) {
    errorMsg.value = errText;
    return;
  }

  saving.value = true;
  const payload = {
    name: form.name.trim(),
    nameEn: form.nameEn.trim(),
    sku: form.sku.trim(),
    categoryId: Number(form.categoryId),
    shopId: form.shopId ? Number(form.shopId) : undefined,
    price: Number(form.price),
    originalPrice: Number(form.originalPrice),
    stock: Number(form.stock),
    sales: Number(form.sales),
    status: form.status as 'on_sale' | 'off_sale',
    cover: form.cover,
    description: form.description,
    descriptionEn: form.descriptionEn
  };

  try {
    if (isEdit.value) {
      await updateProductApi(Number(route.params.id), payload);
    } else {
      await createProductApi(payload);
    }
    void router.push('/admin/product/list');
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('admin.form.saveFail');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void loadData();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ isEdit ? t('admin.form.titleEdit') : t('admin.form.titleCreate') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.form.sub') }}</p>
      </div>
      <div class="admin-actions">
        <button type="button" class="ui-btn ui-btn--ghost" @click="router.back()">{{ t('admin.form.back') }}</button>
      </div>
    </section>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="form-error anim-fade-in">
      ⚠ {{ errorMsg }}
    </div>

    <section class="admin-grid-2 anim-fade-up anim-delay-1">
      <!-- 基础信息 -->
      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.form.basic') }}</h3>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.name') }} <em>*</em></span>
          <input v-model="form.name" class="admin-input" :placeholder="t('admin.form.namePh')" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.nameEn') }}</span>
          <input v-model="form.nameEn" class="admin-input" :placeholder="t('admin.form.nameEnPh')" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.sku') }} <em>*</em></span>
          <input v-model="form.sku" class="admin-input" :placeholder="t('admin.form.skuPh')" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.category') }} <em>*</em></span>
          <select v-model="form.categoryId" class="admin-select">
            <option value="">{{ t('admin.form.catPlaceholder') }}</option>
            <option v-for="item in categories" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.shop') }}</span>
          <select v-model="form.shopId" class="admin-select">
            <option value="">{{ t('admin.form.shopDefault') }}</option>
            <option v-for="item in shops" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
          </select>
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.shelfStatus') }}</span>
          <select v-model="form.status" class="admin-select">
            <option value="on_sale">{{ t('admin.form.onSaleNow') }}</option>
            <option value="off_sale">{{ t('admin.form.offSaleNow') }}</option>
          </select>
        </label>

        <div class="form-price-row">
          <label class="form-row">
            <span class="form-label">{{ t('admin.form.price') }} <em>*</em></span>
            <input v-model="form.price" class="admin-input" type="number" min="0" step="0.01" placeholder="0.00" />
          </label>
          <label class="form-row">
            <span class="form-label">{{ t('admin.form.original') }}</span>
            <input v-model="form.originalPrice" class="admin-input" type="number" min="0" step="0.01" placeholder="0.00" />
          </label>
        </div>

        <div class="form-price-row">
          <label class="form-row">
            <span class="form-label">{{ t('admin.form.stock') }}</span>
            <input v-model="form.stock" class="admin-input" type="number" min="0" placeholder="0" />
          </label>
          <label class="form-row">
            <span class="form-label">{{ t('admin.form.salesTotal') }}</span>
            <input v-model="form.sales" class="admin-input" type="number" min="0" placeholder="0" />
          </label>
        </div>
      </article>

      <!-- 展示信息 -->
      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.form.display') }}</h3>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.cover') }}</span>
          <input v-model="form.cover" class="admin-input" :placeholder="t('admin.form.coverPh')" />
        </label>

        <div class="cover-preview">
          <img v-if="form.cover" :src="form.cover" alt="cover" class="cover-preview__img" />
          <div v-else class="cover-placeholder">{{ t('admin.form.noPreview') }}</div>
        </div>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.descLabel') }}</span>
          <textarea v-model="form.description" class="admin-textarea" :placeholder="t('admin.form.descPh')" />
        </label>

        <label class="form-row">
          <span class="form-label">{{ t('admin.form.descEnLabel') }}</span>
          <textarea v-model="form.descriptionEn" class="admin-textarea" :placeholder="t('admin.form.descEnPh')" />
        </label>
      </article>
    </section>

    <!-- 底部操作 -->
    <section class="admin-panel anim-fade-up anim-delay-2">
      <div class="admin-actions form-footer">
        <button type="button" class="ui-btn ui-btn--ghost" @click="router.push('/admin/product/list')">{{ t('admin.btn.cancel') }}</button>
        <button
          type="button"
          class="ui-btn ui-btn--primary"
          :disabled="saving"
          @click="handleSubmit"
        >
          <span v-if="saving" class="saving-spinner" />
          {{ saving ? t('admin.form.saving') : (isEdit ? t('admin.form.saveEdit') : t('admin.form.publish')) }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.form-error {
  padding: 12px 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 14px;
  margin-bottom: 4px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--admin-text-muted, #6b6b6b);
}

.form-label em {
  font-style: normal;
  color: #f43f5e;
  margin-left: 2px;
}

.form-price-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cover-preview {
  margin: 0 0 16px;
  padding: 14px;
  border-radius: 8px;
  background: var(--admin-fill, #f5f5f5);
  border: 1px dashed var(--admin-border, #e5e5e5);
}

.cover-preview__img {
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

.cover-placeholder {
  height: 100px;
  display: grid;
  place-items: center;
  color: var(--admin-text-subtle, #9a9a9a);
  font-size: 13px;
}

.form-footer {
  justify-content: flex-end;
}

.saving-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--admin-border, #e5e5e5);
  border-top-color: #e8532d;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
