<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { useRoute, useRouter, type RouteRecordNormalized } from 'vue-router';
import { useAdminMenuStore } from '@/stores/adminMenuStore';
import { useUserStore } from '@/stores/userStore';
import { useAppI18n } from '@/composables/useAppI18n';
import AppLanguageSwitch from '@/components/AppLanguageSwitch.vue';
import { fetchMessageList } from '@/api/message';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const adminMenuStore = useAdminMenuStore();
const userStore = useUserStore();
const { t } = useAppI18n();

const unreadCount = ref(0);

// 面包屑：用 titleKey 走后台语言包，没有则退回 meta.title
const breadcrumbs = computed(() => {
  return route.matched
    .filter((item: RouteRecordNormalized) => item.path.startsWith('/admin'))
    .map((item: RouteRecordNormalized) => {
      const m = item.meta;
      if (m.titleKey) return t(m.titleKey as string);
      return (m.title as string) || '';
    })
    .filter(Boolean);
});

const pageTitle = computed(() => {
  const m = route.meta;
  if (m.titleKey) return t(m.titleKey as string);
  return (m.title as string) || '';
});

// 菜单每项对应的图标（纯展示）
const menuIconMap: Record<string, string> = {
  dashboard: '▣',
  product: '◈',
  shop: '◆',
  category: '⊞',
  inventory: '◳',
  order: '◎',
  permission: '⊙',
  message: '◉',
  system: '⚙',
  'product-list': '≡',
  'product-create': '+',
  'inventory-list': '≡',
  'inventory-warning': '⚠',
  'order-list': '≡',
  'user-list': '≡',
  'role-list': '≡',
  profile: '☻'
};

const loadUnreadCount = async (): Promise<void> => {
  try {
    const list = await fetchMessageList();
    unreadCount.value = list.filter((item) => !item.isRead).length;
  } catch {
    // 静默失败，不影响侧栏
  }
};

const handleBackToFront = (): void => {
  void router.push('/');
};

const handleLogout = (): void => {
  userStore.logout();
  void router.replace('/login');
};

onMounted(() => {
  void loadUnreadCount();
});
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-layout__aside">
      <div class="admin-brand">
        <div class="admin-brand__logo">IO</div>
        <div>
          <p class="admin-brand__name">{{ t('layout.brand.name') }}</p>
          <p class="admin-brand__desc">{{ t('layout.brand.desc') }}</p>
        </div>
      </div>

      <nav class="admin-menu">
        <template v-for="menu in adminMenuStore.menus" :key="menu.key">
          <router-link
            v-if="menu.path"
            :to="menu.path"
            class="admin-menu__item"
          >
            <span class="admin-menu__icon">{{ menuIconMap[menu.key] || '·' }}</span>
            <span>{{ t(menu.titleKey) }}</span>
            <span
              v-if="menu.key === 'message' && unreadCount > 0"
              class="admin-menu__badge"
            >{{ unreadCount }}</span>
          </router-link>

          <div v-else class="admin-menu__group">
            <div class="admin-menu__group-title">
              <span class="admin-menu__icon">{{ menuIconMap[menu.key] || '·' }}</span>
              {{ t(menu.titleKey) }}
            </div>
            <router-link
              v-for="child in menu.children"
              :key="child.key"
              :to="child.path || '/admin/dashboard'"
              class="admin-menu__item admin-menu__item--child"
            >
              <span class="admin-menu__icon">{{ menuIconMap[child.key] || '·' }}</span>
              <span>{{ t(child.titleKey) }}</span>
            </router-link>
          </div>
        </template>
      </nav>
    </aside>

    <section class="admin-layout__main">
      <header class="admin-topbar">
        <div>
          <div class="admin-breadcrumb">
            <span v-for="(item, index) in breadcrumbs" :key="`${item}-${index}`">
              <span>{{ item }}</span>
              <span v-if="index < breadcrumbs.length - 1"> / </span>
            </span>
          </div>
          <h1 class="admin-topbar__title">{{ pageTitle }}</h1>
        </div>

        <div class="admin-topbar__actions">
          <AppLanguageSwitch class="admin-lang-switch" />
          <router-link to="/admin/message/list" class="admin-notify-btn">
            <el-icon :size="18" aria-hidden="true"><Bell /></el-icon>
            <span v-if="unreadCount > 0" class="admin-notify-dot">{{ unreadCount }}</span>
          </router-link>

          <div class="admin-user">
            <span class="admin-user__avatar">{{ (userStore.displayName || 'A').slice(0, 1) }}</span>
            <div>
              <p class="admin-user__name">{{ userStore.displayName || t('layout.user.fallback') }}</p>
              <p class="admin-user__role">{{ userStore.roleCodes[0] || 'operator' }}</p>
            </div>
          </div>

          <button type="button" class="admin-action-btn" @click="handleBackToFront">
            {{ t('layout.action.backFront') }}
          </button>
          <button type="button" class="admin-action-btn admin-action-btn--danger" @click="handleLogout">
            {{ t('layout.action.logout') }}
          </button>
        </div>
      </header>

      <main class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </section>
  </div>
</template>

<style scoped>
.admin-layout {
  color-scheme: light;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background: #f0f2f5;
}

.admin-layout__aside {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 14px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d4d4d4 transparent;
  border-right: 1px solid #e5e5e5;
  background: #fff;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.admin-brand__logo {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #e8532d;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.admin-brand__name {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.admin-brand__desc {
  font-size: 11px;
  color: #6b6b6b;
  white-space: nowrap;
}

.admin-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-menu__group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
}

.admin-menu__group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 4px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #9a9a9a;
  text-transform: uppercase;
}

.admin-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #6b6b6b;
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease;
  position: relative;
  text-decoration: none;
}

.admin-menu__item:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}

.admin-menu__item.router-link-active {
  background: rgba(61, 90, 128, 0.08);
  color: #e8532d;
  font-weight: 600;
  box-shadow: inset 3px 0 0 0 #e8532d;
}

.admin-menu__item--child {
  padding-left: 16px;
  font-size: 13px;
}

.admin-menu__icon {
  font-size: 12px;
  opacity: 0.85;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.admin-menu__badge {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: #dc2626;
  color: #fff;
  padding: 0 5px;
}

.admin-layout__main {
  min-width: 0;
  padding: 24px;
  overflow-x: hidden;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  margin-bottom: 24px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
}

.admin-breadcrumb {
  font-size: 12px;
  color: #9a9a9a;
  margin-bottom: 4px;
}

.admin-topbar__title {
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #1a1a1a;
}

.admin-topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.admin-lang-switch {
  margin-right: 4px;
}

.admin-notify-btn {
  position: relative;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  background: #fff;
  color: #6b6b6b;
  transition: border-color 0.15s ease, color 0.15s ease;
  text-decoration: none;
  cursor: pointer;
}

.admin-notify-btn:hover {
  border-color: #bdbdbd;
  color: #1a1a1a;
}

.admin-notify-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  background: #dc2626;
  color: #fff;
  display: grid;
  place-items: center;
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
}

.admin-user__avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e8532d;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.admin-user__name {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}

.admin-user__role {
  font-size: 11px;
  color: #6b6b6b;
}

.admin-action-btn {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 9px 14px;
  background: #fff;
  color: #1a1a1a;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
}

.admin-action-btn:hover {
  background: #fafafa;
  border-color: #bdbdbd;
}

.admin-action-btn--danger {
  background: #fff;
  border-color: #fecaca;
  color: #dc2626;
}

.admin-action-btn--danger:hover {
  background: #fef2f2;
}

.admin-content {
  min-height: calc(100vh - 160px);
}
</style>
