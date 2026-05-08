<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAppI18n } from '@/composables/useAppI18n';

const router = useRouter();
const { t } = useAppI18n();

const goHome = () => {
  void router.push('/');
};
</script>

<template>
  <div class="not-found">
    <div class="not-found__content">
      <h1 class="not-found__title">404</h1>
      <p class="not-found__desc">{{ t('notFound.desc') }}</p>
      <button class="not-found__btn" @click="goHome">
        {{ t('notFound.backHome') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: #fafafa;
}

.not-found__content {
  text-align: center;
}

.not-found__title {
  font-size: 6rem;
  font-weight: 700;
  color: #e8532d;
  line-height: 1;
  margin-bottom: 16px;
  letter-spacing: -0.04em;
}

.not-found__desc {
  font-size: 1rem;
  color: #6b6b6b;
  margin-bottom: 32px;
}

.not-found__btn {
  display: inline-block;
  padding: 12px 32px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: #e8532d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.not-found__btn:hover {
  background: #2c435f;
}
</style>
