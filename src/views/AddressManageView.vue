<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Location, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '@/api/address';
import type { Address, AddressPayload } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();

const addresses = ref<Address[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editId = ref<number | null>(null);

const form = ref<AddressPayload>({
  recipient: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
});

const loadAddresses = async (): Promise<void> => {
  loading.value = true;
  try {
    addresses.value = await fetchAddresses();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const openAdd = (): void => {
  isEdit.value = false;
  editId.value = null;
  form.value = {
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  };
  dialogVisible.value = true;
};

const openEdit = (item: Address): void => {
  isEdit.value = true;
  editId.value = item.id;
  form.value = {
    recipient: item.recipient,
    phone: item.phone,
    province: item.province,
    city: item.city,
    district: item.district,
    detail: item.detail,
    isDefault: item.isDefault
  };
  dialogVisible.value = true;
};

const handleSave = async (): Promise<void> => {
  if (!form.value.recipient || !form.value.phone || !form.value.detail) {
    ElMessage.warning(t('address.formIncomplete'));
    return;
  }
  try {
    if (isEdit.value && editId.value !== null) {
      await updateAddress(editId.value, form.value);
      ElMessage.success(t('address.updateSuccess'));
    } else {
      await createAddress(form.value);
      ElMessage.success(t('address.addSuccess'));
    }
    dialogVisible.value = false;
    await loadAddresses();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('address.saveFail'));
  }
};

const handleDelete = async (id: number): Promise<void> => {
  try {
    await ElMessageBox.confirm(t('address.deleteConfirm'), t('address.deleteTitle'), {
      confirmButtonText: t('admin.btn.delete'),
      cancelButtonText: t('admin.btn.cancel'),
      type: 'warning'
    });
    await deleteAddress(id);
    ElMessage.success(t('address.deleteSuccess'));
    await loadAddresses();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error instanceof Error ? error.message : t('address.deleteFail'));
    }
  }
};

const handleSetDefault = async (id: number): Promise<void> => {
  try {
    await setDefaultAddress(id);
    ElMessage.success(t('address.setDefaultSuccess'));
    await loadAddresses();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('address.setDefaultFail'));
  }
};

onMounted(() => {
  void loadAddresses();
});
</script>

<template>
  <div class="addr-page">
    <header class="addr-head">
      <h1 class="addr-title">{{ t('address.title') }}</h1>
      <el-button type="primary" :icon="Plus" @click="openAdd">
        {{ t('address.add') }}
      </el-button>
    </header>

    <div v-if="loading" class="addr-state">{{ t('common.loading') }}</div>
    <div v-else-if="addresses.length === 0" class="addr-empty">
      <el-icon :size="40"><Location /></el-icon>
      <p>{{ t('address.empty') }}</p>
    </div>
    <div v-else class="addr-list">
      <div
        v-for="item in addresses"
        :key="item.id"
        class="addr-card"
        :class="{ 'addr-card--default': item.isDefault }"
      >
        <div class="addr-card__info">
          <div class="addr-card__row">
            <span class="addr-card__name">{{ item.recipient }}</span>
            <span class="addr-card__phone">{{ item.phone }}</span>
            <span v-if="item.isDefault" class="addr-card__badge">{{ t('address.default') }}</span>
          </div>
          <p class="addr-card__detail">
            {{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}
          </p>
        </div>
        <div class="addr-card__actions">
          <button type="button" class="addr-btn" @click="openEdit(item)">
            <el-icon><Edit /></el-icon>
            {{ t('admin.btn.edit') }}
          </button>
          <button type="button" class="addr-btn addr-btn--danger" @click="handleDelete(item.id)">
            <el-icon><Delete /></el-icon>
            {{ t('admin.btn.delete') }}
          </button>
          <button
            v-if="!item.isDefault"
            type="button"
            class="addr-btn addr-btn--primary"
            @click="handleSetDefault(item.id)"
          >
            {{ t('address.setDefault') }}
          </button>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? t('address.editTitle') : t('address.addTitle')"
      width="480px"
    >
      <div class="addr-form">
        <label class="ui-field">
          <span class="ui-label">{{ t('address.label.recipient') }}</span>
          <input v-model="form.recipient" class="ui-input" type="text" :placeholder="t('address.ph.recipient')">
        </label>
        <label class="ui-field">
          <span class="ui-label">{{ t('address.label.phone') }}</span>
          <input v-model="form.phone" class="ui-input" type="tel" :placeholder="t('address.ph.phone')">
        </label>
        <div class="addr-form__row">
          <label class="ui-field">
            <span class="ui-label">{{ t('address.label.province') }}</span>
            <input v-model="form.province" class="ui-input" type="text" :placeholder="t('address.ph.province')">
          </label>
          <label class="ui-field">
            <span class="ui-label">{{ t('address.label.city') }}</span>
            <input v-model="form.city" class="ui-input" type="text" :placeholder="t('address.ph.city')">
          </label>
        </div>
        <label class="ui-field">
          <span class="ui-label">{{ t('address.label.district') }}</span>
          <input v-model="form.district" class="ui-input" type="text" :placeholder="t('address.ph.district')">
        </label>
        <label class="ui-field">
          <span class="ui-label">{{ t('address.label.detail') }}</span>
          <input v-model="form.detail" class="ui-input" type="text" :placeholder="t('address.ph.detail')">
        </label>
        <label class="addr-check">
          <input v-model="form.isDefault" type="checkbox">
          <span>{{ t('address.setDefault') }}</span>
        </label>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('admin.btn.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('admin.btn.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.addr-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.addr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.addr-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.addr-state {
  text-align: center;
  padding: 40px 0;
  color: #6b6b6b;
}

.addr-empty {
  text-align: center;
  padding: 60px 0;
  color: #9a9a9a;
}

.addr-empty p {
  margin-top: 12px;
}

.addr-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addr-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  transition: border-color .2s;
}

.addr-card--default {
  border-color: #e8532d;
  background: #f8fafc;
}

.addr-card__info {
  flex: 1;
}

.addr-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.addr-card__name {
  font-weight: 600;
  color: #1a1a1a;
}

.addr-card__phone {
  color: #6b6b6b;
  font-size: .875rem;
}

.addr-card__badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: .75rem;
  color: #fff;
  background: #e8532d;
  border-radius: 4px;
}

.addr-card__detail {
  margin: 0;
  color: #4b4b4b;
  font-size: .875rem;
  line-height: 1.5;
}

.addr-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: 16px;
}

.addr-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: .8125rem;
  color: #e8532d;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all .2s;
}

.addr-btn:hover {
  background: #f5f5f5;
}

.addr-btn--danger {
  color: #b91c1c;
}

.addr-btn--danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.addr-btn--primary {
  color: #e8532d;
  border-color: #e8532d;
}

.addr-btn--primary:hover {
  background: #e8532d;
  color: #fff;
}

.addr-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.addr-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.addr-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .875rem;
  color: #4b4b4b;
  cursor: pointer;
}

.addr-check input {
  width: 16px;
  height: 16px;
  accent-color: #e8532d;
}
</style>
