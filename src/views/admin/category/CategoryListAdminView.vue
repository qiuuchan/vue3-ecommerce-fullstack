<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { createCategoryApi, deleteCategoryApi, fetchCategoryList, updateCategoryApi, type CategoryItem } from '@/api/category';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const categories = ref<CategoryItem[]>([]);
const editingId = ref<number | null>(null);
const form = reactive({
  name: '',
  nameEn: '',
  sort: 1,
  enabled: true
});

const loadCategories = async (): Promise<void> => {
  categories.value = await fetchCategoryList();
};

const resetForm = (): void => {
  editingId.value = null;
  form.name = '';
  form.nameEn = '';
  form.sort = 1;
  form.enabled = true;
};

const startEdit = (item: CategoryItem): void => {
  editingId.value = item.id;
  form.name = item.name;
  form.nameEn = item.nameEn || '';
  form.sort = item.sort;
  form.enabled = item.enabled;
};

const submitCategory = async (): Promise<void> => {
  if (editingId.value) {
    await updateCategoryApi(editingId.value, {
      name: form.name,
      nameEn: form.nameEn,
      sort: form.sort,
      enabled: form.enabled
    });
  } else {
    await createCategoryApi({
      name: form.name,
      nameEn: form.nameEn,
      sort: form.sort,
      enabled: form.enabled
    });
  }
  resetForm();
  await loadCategories();
};

const removeCategory = async (id: number): Promise<void> => {
  if (!window.confirm(t('admin.category.confirmDel'))) return;
  await deleteCategoryApi(id);
  await loadCategories();
};

onMounted(() => {
  void loadCategories();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.category.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.category.sub') }}</p>
      </div>
    </section>

    <section class="admin-grid-2">
      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ editingId ? t('admin.category.formEdit') : t('admin.category.formAdd') }}</h3>
        <div class="admin-filters">
          <input v-model="form.name" class="admin-input" :placeholder="t('admin.category.namePh')" />
          <input v-model="form.nameEn" class="admin-input" :placeholder="t('admin.category.nameEnPh')" />
          <input v-model="form.sort" class="admin-input" type="number" :placeholder="t('admin.category.sortPh')" />
          <select v-model="form.enabled" class="admin-select">
            <option :value="true">{{ t('admin.status.enabled') }}</option>
            <option :value="false">{{ t('admin.status.disabled') }}</option>
          </select>
        </div>
        <div class="admin-actions submit-actions">
          <button type="button" class="ui-btn ui-btn--ghost" @click="resetForm">{{ t('admin.btn.reset') }}</button>
          <button type="button" class="ui-btn ui-btn--primary" @click="submitCategory">{{ t('admin.category.save') }}</button>
        </div>
      </article>

      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.category.list') }}</h3>
        <div v-if="categories.length === 0" class="admin-empty">{{ t('admin.category.empty') }}</div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('admin.category.col.name') }}</th>
                <th>{{ t('admin.category.col.count') }}</th>
                <th>{{ t('admin.category.col.sort') }}</th>
                <th>{{ t('admin.category.col.status') }}</th>
                <th>{{ t('admin.category.col.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in categories" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.productCount }}</td>
                <td>{{ item.sort }}</td>
                <td>
                  <span class="admin-chip" :class="item.enabled ? 'admin-chip--success' : 'admin-chip--warning'">
                    {{ item.enabled ? t('admin.status.enabled') : t('admin.status.disabled') }}
                  </span>
                </td>
                <td>
                  <div class="admin-actions">
                    <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="startEdit(item)">{{ t('admin.btn.edit') }}</button>
                    <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="removeCategory(item.id)">{{ t('admin.btn.delete') }}</button>
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
</style>
