<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Shop, Search, Star, ShoppingCart, Bell } from '@element-plus/icons-vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useAppI18n } from '@/composables/useAppI18n';
import AppLanguageSwitch from '@/components/AppLanguageSwitch.vue';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const userStore = useUserStore();
const { t } = useAppI18n();

const scrolled = ref(false);

const onScroll = (): void => {
  scrolled.value = window.scrollY > 10;
};

const cartTotalCount = computed(() =>
  cartStore.cartList.reduce((sum, item) => sum + item.count, 0)
);

onMounted(() => {
  if (userStore.isLogin) void cartStore.loadCart({ silent: true });
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

const handleLogout = (): void => {
  userStore.logout();
  void router.replace('/login');
};

// 游客点收藏/购物车：去登录并带回跳地址
const loginWithRedirect = (path: string): void => {
  void router.push({ path: '/login', query: { redirect: path } });
};

const levelClass = computed(() => {
  if (userStore.isAdmin) return 'user-level user-level--admin';
  if (userStore.goodReviewCount >= 100) return 'user-level user-level--diamond';
  if (userStore.goodReviewCount >= 50) return 'user-level user-level--gold';
  if (userStore.goodReviewCount >= 10) return 'user-level user-level--silver';
  return 'user-level user-level--normal';
});
</script>

<template>
  <header class="mall-header" :class="{ 'mall-header--scrolled': scrolled }">
    <div class="mall-header__inner">
      <!-- 品牌 LOGO -->
      <router-link to="/" class="mall-brand">
        <el-icon class="mall-brand__icon" :size="20" aria-hidden="true">
          <Shop />
        </el-icon>
        <h1 class="mall-brand__text">{{ t('front.brand') }}</h1>
      </router-link>

      <!-- 搜索框占位（点击跳搜索页） -->
      <router-link to="/search" class="mall-search">
        <el-icon class="mall-search__icon" :size="16" aria-hidden="true">
          <Search />
        </el-icon>
        <span class="mall-search__placeholder">{{ t('front.searchPlaceholder') }}</span>
      </router-link>

      <!-- 右侧操作区 -->
      <nav class="mall-actions">
        <AppLanguageSwitch class="mall-lang-switch" />
        <!-- 导航链接 -->
        <router-link
          class="mall-nav-link"
          :class="{ 'mall-nav-link--active': route.path === '/' }"
          to="/"
        >{{ t('front.nav.home') }}</router-link>
        <router-link
          class="mall-nav-link"
          :class="{ 'mall-nav-link--active': route.path.startsWith('/products') }"
          to="/products"
        >{{ t('front.nav.products') }}</router-link>

        <!-- 管理员后台入口 -->
        <router-link
          v-if="userStore.isAdmin"
          class="mall-nav-link mall-nav-link--admin"
          :class="{ 'mall-nav-link--active': route.path.startsWith('/admin') }"
          to="/admin/dashboard"
        >
          {{ t('front.nav.admin') }}
        </router-link>

        <!-- 分割线 -->
        <span class="mall-divider" />

        <span v-if="userStore.isGuest" class="mall-guest-tag" :title="t('front.fav.loginHint')">{{ t('front.guest.hint') }}</span>

        <!-- 收藏：已登录直达，游客先登录 -->
        <router-link
          v-if="userStore.isLogin"
          class="mall-icon-btn"
          to="/favorites"
          :title="t('front.fav.title')"
        >
          <el-icon class="mall-icon-btn__icon" :size="20" aria-hidden="true">
            <Star />
          </el-icon>
        </router-link>

        <!-- 消息通知 -->
        <router-link
          v-if="userStore.isLogin"
          class="mall-icon-btn"
          to="/notifications"
          :title="t('front.notifications.title')"
        >
          <el-icon class="mall-icon-btn__icon" :size="20" aria-hidden="true">
            <Bell />
          </el-icon>
          <span class="mall-badge mall-badge--notif">3</span>
        </router-link>
        <button
          v-else
          type="button"
          class="mall-icon-btn"
          :title="t('front.fav.loginHint')"
          @click="loginWithRedirect('/favorites')"
        >
          <el-icon class="mall-icon-btn__icon" :size="20" aria-hidden="true">
            <Star />
          </el-icon>
        </button>

        <!-- 购物车 -->
        <router-link
          v-if="userStore.isLogin"
          class="mall-icon-btn mall-icon-btn--cart"
          to="/cart"
          :title="t('front.cart.title')"
        >
          <el-icon class="mall-icon-btn__icon" :size="20" aria-hidden="true">
            <ShoppingCart />
          </el-icon>
          <span v-if="cartTotalCount > 0" class="mall-badge">{{ cartTotalCount }}</span>
        </router-link>
        <button
          v-else
          type="button"
          class="mall-icon-btn mall-icon-btn--cart"
          :title="t('front.cart.loginHint')"
          @click="loginWithRedirect('/cart')"
        >
          <el-icon class="mall-icon-btn__icon" :size="20" aria-hidden="true">
            <ShoppingCart />
          </el-icon>
        </button>

        <!-- 分割线 -->
        <span class="mall-divider" />

        <!-- 已登录：用户信息（点击进入用户中心） -->
        <router-link v-if="userStore.isLogin && !userStore.isAdmin" to="/user" class="mall-user mall-user--link">
          <div class="mall-user__avatar-wrap">
            <img
              v-if="userStore.avatar"
              :src="userStore.avatar"
              :alt="userStore.displayName"
              class="mall-user__avatar"
            >
            <span v-else class="mall-user__avatar mall-user__avatar--fallback">
              {{ (userStore.displayName || 'U').slice(0, 1) }}
            </span>
          </div>
          <div class="mall-user__info">
            <p class="mall-user__name">{{ userStore.displayName }}</p>
            <div class="mall-user__meta">
              <span :class="levelClass">{{ userStore.level || t('front.user.levelDefault') }}</span>
              <span class="mall-user__role">{{ userStore.userType === 'admin' ? t('front.user.roleAdmin') : t('front.user.roleUser') }}</span>
            </div>
          </div>
        </router-link>
        <div v-else-if="userStore.isLogin" class="mall-user">
          <div class="mall-user__avatar-wrap">
            <img
              v-if="userStore.avatar"
              :src="userStore.avatar"
              :alt="userStore.displayName"
              class="mall-user__avatar"
            >
            <span v-else class="mall-user__avatar mall-user__avatar--fallback">
              {{ (userStore.displayName || 'U').slice(0, 1) }}
            </span>
          </div>
          <div class="mall-user__info">
            <p class="mall-user__name">{{ userStore.displayName }}</p>
            <div class="mall-user__meta">
              <span :class="levelClass">{{ userStore.level || t('front.user.levelDefault') }}</span>
              <span class="mall-user__role">{{ userStore.userType === 'admin' ? t('front.user.roleAdmin') : t('front.user.roleUser') }}</span>
            </div>
          </div>
        </div>

        <!-- 退出 / 登录 -->
        <button
          v-if="userStore.isLogin"
          type="button"
          class="mall-btn mall-btn--ghost"
          @click="handleLogout"
        >
          {{ t('front.auth.logout') }}
        </button>
        <router-link
          v-else
          class="mall-btn mall-btn--primary"
          :to="{ path: '/login', query: { redirect: route.fullPath } }"
        >
          {{ t('front.auth.login') }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
/* ===== 顶栏：白底细线，无磨砂装饰 ===== */
.mall-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  transition: box-shadow 0.3s ease;
}

.mall-header--scrolled {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.mall-header__inner {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
}

/* ===== 品牌 ===== */
.mall-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  flex-shrink: 0;
}

.mall-brand__icon {
  color: var(--f-text, #1a1a1a);
  opacity: 0.55;
  flex-shrink: 0;
}

.mall-brand__text {
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--f-text, #1a1a1a);
  white-space: nowrap;
}

/* ===== 搜索框占位 ===== */
.mall-search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 400px;
  height: 38px;
  padding: 0 16px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 20px;
  text-decoration: none;
  transition: border-color .2s, background .2s, box-shadow .2s;
}

.mall-search:hover {
  border-color: #bdbdbd;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.mall-search__icon {
  color: var(--f-text-subtle, #9a9a9a);
  flex-shrink: 0;
}

.mall-search__placeholder {
  font-size: .85rem;
  color: var(--f-text-subtle, #9a9a9a);
}

/* ===== 右侧操作区 ===== */
.mall-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.mall-lang-switch {
  margin-right: 4px;
}

/* 导航链接 */
.mall-nav-link {
  padding: 6px 12px;
  font-size: .875rem;
  font-weight: 500;
  color: var(--f-text-muted, #6b6b6b);
  text-decoration: none;
  border-radius: 4px;
  position: relative;
  transition: color .2s, background .2s;
}

.mall-nav-link:hover {
  color: var(--f-text, #1a1a1a);
  background: rgba(0, 0, 0, 0.04);
}

.mall-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: var(--f-brand, #e8532d);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.mall-nav-link--active {
  color: var(--f-text, #1a1a1a);
  font-weight: 600;
  box-shadow: none;
  border-radius: 4px;
}

.mall-nav-link--active::after {
  transform: scaleX(1);
}

.mall-nav-link--admin {
  color: var(--f-text, #1a1a1a);
  font-weight: 600;
}

/* 分割线 */
.mall-divider {
  width: 1px;
  height: 20px;
  background: var(--f-border, #e5e5e5);
  margin: 0 4px;
}

/* 游客提示 */
.mall-guest-tag {
  font-size: .72rem;
  font-weight: 500;
  color: var(--f-text-muted, #6b6b6b);
  padding: 4px 10px;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  white-space: nowrap;
}

/* 图标按钮 */
.mall-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  transition: background .2s;
}

.mall-icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.mall-icon-btn__icon {
  color: var(--f-text-muted, #6b6b6b);
}

/* 购物车角标 */
.mall-badge {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: .65rem;
  font-weight: 600;
  color: #fff;
  background: var(--f-primary, #1a1a1a);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ===== 用户区 ===== */
.mall-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
}

.mall-user--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}

.mall-user--link:hover {
  border-color: #bdbdbd;
}

.mall-user__avatar-wrap {
  flex-shrink: 0;
}

.mall-user__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  display: grid;
  place-items: center;
}

.mall-user__avatar--fallback {
  background: #e8e8e8;
  color: #1a1a1a;
  font-size: .8rem;
  font-weight: 600;
}

.mall-user__info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mall-user__name {
  font-size: .8rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
}

.mall-user__meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mall-user__role {
  font-size: .65rem;
  color: var(--f-text-subtle, #9a9a9a);
}

/* 等级标签 */
.user-level {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: .6rem;
  font-weight: 700;
  letter-spacing: .03em;
}

.user-level--admin {
  color: #e11d48;
  background: rgba(225, 29, 72, .1);
}

.user-level--diamond {
  color: #0891b2;
  background: rgba(8, 145, 178, .1);
}

.user-level--gold {
  color: #d97706;
  background: rgba(217, 119, 6, .1);
}

.user-level--silver {
  color: #64748b;
  background: rgba(100, 116, 139, .1);
}

.user-level--normal {
  color: #4a4a4a;
  background: rgba(0, 0, 0, 0.06);
}

/* ===== 操作按钮 ===== */
.mall-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  font-size: .8rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background .2s, box-shadow .2s, transform .15s;
}

.mall-btn:active {
  transform: scale(.97);
}

.mall-btn--primary {
  background: var(--f-primary, #1a1a1a);
  color: #fff;
  box-shadow: none;
}

.mall-btn--primary:hover {
  background: var(--f-brand-hover, #c94522);
}

.mall-btn--ghost {
  background: transparent;
  color: var(--f-text-muted, #6b6b6b);
  border: 1px solid var(--f-border, #e5e5e5);
}

.mall-btn--ghost:hover {
  background: #fafafa;
  color: var(--f-text, #1a1a1a);
}

/* ===== 响应式 ===== */
@media (max-width: 860px) {
  .mall-search {
    display: none;
  }
  .mall-nav-link {
    display: none;
  }
}
</style>
