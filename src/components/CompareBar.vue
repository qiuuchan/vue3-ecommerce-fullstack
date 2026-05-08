<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';
import { useCompareStore } from '@/stores/compareStore';
import { useRouter } from 'vue-router';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const router = useRouter();
const compareStore = useCompareStore();

const goCompare = (): void => {
  router.push('/compare');
};
</script>

<template>
  <transition name="compare-bar-fade">
    <div v-if="compareStore.count > 0" class="compare-bar">
      <div class="compare-bar__inner">
        <span class="compare-bar__info">
          {{ t('compare.selected', { n: compareStore.count }) }}
        </span>
        <div class="compare-bar__items">
          <div
            v-for="item in compareStore.items"
            :key="item.id"
            class="compare-bar__item"
          >
            <img :src="item.cover" :alt="item.name" class="compare-bar__thumb">
            <button
              type="button"
              class="compare-bar__remove"
              @click="compareStore.removeItem(item.id)"
              :aria-label="t('common.remove')"
            >
              <el-icon :size="12"><Close /></el-icon>
            </button>
          </div>
        </div>
        <div class="compare-bar__actions">
          <button
            type="button"
            class="compare-bar__btn compare-bar__btn--primary"
            :disabled="compareStore.count < 2"
            @click="goCompare"
          >
            {{ t('compare.compareBtn') }}
            <template v-if="compareStore.count < 2">({{ t('compare.minHint') }})</template>
          </button>
          <button type="button" class="compare-bar__btn" @click="compareStore.clearAll()">
            {{ t('compare.clearAll') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.compare-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 900;
  background: #fff;
  border-top: 2px solid var(--f-brand, #e8532d);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 12px 20px;
}

.compare-bar__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.compare-bar__info {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}

.compare-bar__items {
  display: flex;
  gap: 8px;
  flex: 1;
}

.compare-bar__item {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid var(--f-brand, #e8532d);
}

.compare-bar__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compare-bar__remove {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: #333;
  color: #fff;
  cursor: pointer;
  padding: 0;
}

.compare-bar__actions {
  display: flex;
  gap: 8px;
}

.compare-bar__btn {
  padding: 8px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #fff;
  color: #1a1a1a;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.compare-bar__btn--primary {
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  color: #fff;
}

.compare-bar__btn--primary:disabled {
  background: #bdbdbd;
  border-color: #bdbdbd;
  cursor: not-allowed;
}

.compare-bar__btn--primary:not(:disabled):hover {
  background: #d14422;
}

.compare-bar__btn:not(.compare-bar__btn--primary):hover {
  border-color: #bdbdbd;
}

/* 过渡 */
.compare-bar-fade-enter-active,
.compare-bar-fade-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.compare-bar-fade-enter-from,
.compare-bar-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
