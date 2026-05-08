<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchRoleList, type AdminRoleItem } from '@/api/permission';
import { useAppI18n } from '@/composables/useAppI18n';

const { t, perm } = useAppI18n();
const roles = ref<AdminRoleItem[]>([]);

onMounted(async () => {
  try {
    roles.value = await fetchRoleList();
  } catch (e) {
    console.error(t('role.loadFail'), e);
  }
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('role.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('role.subtitle') }}</p>
      </div>
    </section>

    <section class="admin-card-list">
      <article v-for="item in roles" :key="item.id" class="admin-mini-card">
        <h3 class="role-name">{{ item.name }}</h3>
        <p class="role-code">{{ item.code }}</p>
        <p class="role-desc">{{ item.description }}</p>
        <div class="role-perms">
          <span
            v-for="code in item.permissionCodes"
            :key="code"
            class="admin-chip admin-chip--info"
            :title="code"
          >{{ perm(code) }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.role-name {
  color: var(--admin-text, #1a1a1a);
  font-weight: 600;
  margin-bottom: 6px;
}

.role-code,
.role-desc {
  color: var(--admin-text-muted, #6b6b6b);
  font-size: 13px;
}

.role-perms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
</style>
