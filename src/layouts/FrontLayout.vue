<script setup lang="ts">
import Header from '@/components/Header.vue';
import CompareBar from '@/components/CompareBar.vue';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
</script>

<template>
  <div class="front-layout">
    <Header />
    <main class="front-layout__main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <CompareBar />
    <footer class="front-footer">
      <div class="front-footer__inner">
        <div class="front-footer__top">
          <div class="front-footer__brand">
            <span class="front-footer__logo">{{ t('footer.logo') }}</span>
            <p class="front-footer__slogan">{{ t('footer.slogan') }}</p>
          </div>
          <div class="front-footer__links">
            <div class="front-footer__col">
              <h4 class="front-footer__col-title">{{ t('footer.col.service') }}</h4>
              <router-link to="/products" class="front-footer__link">{{ t('footer.link.allProducts') }}</router-link>
              <router-link to="/cart" class="front-footer__link">{{ t('footer.link.cart') }}</router-link>
            </div>
            <div class="front-footer__col">
              <h4 class="front-footer__col-title">{{ t('footer.col.help') }}</h4>
              <span class="front-footer__link">{{ t('footer.link.afterSale') }}</span>
              <span class="front-footer__link">{{ t('footer.link.shipping') }}</span>
            </div>
            <div class="front-footer__col">
              <h4 class="front-footer__col-title">{{ t('footer.col.about') }}</h4>
              <span class="front-footer__link">{{ t('footer.link.intro') }}</span>
              <span class="front-footer__link">{{ t('footer.link.contact') }}</span>
            </div>
          </div>
        </div>
        <div class="front-footer__bottom">
          <p>{{ t('footer.copy') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.front-layout {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.front-layout__main {
  flex: 1;
  max-width: 1220px;
  width: 100%;
  margin: 0 auto;
  /* 大留白：与全局 --f-section-gap 一致 */
  padding: 40px 28px 88px;
}

.front-footer {
  background: #fff;
  border-top: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  margin-top: auto;
}

.front-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 28px 32px;
}

.front-footer__top {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  margin-bottom: 32px;
}

.front-footer__brand {
  flex-shrink: 0;
}

.front-footer__logo {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--f-text, #1a1a1a);
}

.front-footer__slogan {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--f-text-muted, #64748b);
}

.front-footer__links {
  display: flex;
  gap: 56px;
}

.front-footer__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.front-footer__col-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--f-text, #1a1a2e);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.front-footer__link {
  font-size: 0.85rem;
  color: var(--f-text-muted, #64748b);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.front-footer__link:hover {
  color: var(--f-text, #1a1a1a);
}

.front-footer__bottom {
  padding-top: 24px;
  border-top: 1px solid var(--f-border, #e8e5e0);
  text-align: center;
  font-size: 0.8rem;
  color: var(--f-text-subtle, #94a3b8);
}

@media (max-width: 720px) {
  .front-footer__top {
    flex-direction: column;
    gap: 24px;
  }
  .front-footer__links {
    flex-wrap: wrap;
    gap: 32px;
  }
}
</style>
