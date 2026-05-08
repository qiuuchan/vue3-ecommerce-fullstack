<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchAdminUserList, type AdminUserItem } from '@/api/permission';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const users = ref<AdminUserItem[]>([]);

onMounted(async () => {
  users.value = await fetchAdminUserList();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.user.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.user.sub') }}</p>
      </div>
    </section>

    <section class="admin-panel">
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.user.col.user') }}</th>
              <th>{{ t('admin.user.col.name') }}</th>
              <th>{{ t('admin.user.col.roles') }}</th>
              <th>{{ t('admin.user.col.contact') }}</th>
              <th>{{ t('admin.user.col.status') }}</th>
              <th>{{ t('admin.user.col.login') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in users" :key="item.id">
              <td>{{ item.username }}</td>
              <td>{{ item.displayName }}</td>
              <td>{{ item.roleCodes.join(' / ') }}</td>
              <td>{{ item.phone }} / {{ item.email }}</td>
              <td>
                <span class="admin-chip" :class="item.status === 'enabled' ? 'admin-chip--success' : 'admin-chip--warning'">
                  {{ item.status === 'enabled' ? t('admin.status.enabled') : t('admin.status.disabled') }}
                </span>
              </td>
              <td>{{ item.lastLoginAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
