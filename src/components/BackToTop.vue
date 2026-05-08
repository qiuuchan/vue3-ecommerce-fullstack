<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Top } from '@element-plus/icons-vue';

const visible = ref(false);

const onScroll = (): void => {
  visible.value = window.scrollY > 300;
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <Transition name="back-to-top-fade">
    <button
      v-show="visible"
      class="back-to-top"
      @click="scrollToTop"
    >
      <el-icon :size="18" aria-hidden="true"><Top /></el-icon>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--f-border, #e5e5e5);
  background: var(--f-surface, #ffffff);
  color: var(--f-text-muted, #6b6b6b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.back-to-top:hover {
  background: var(--f-brand, #e8532d);
  color: #ffffff;
  border-color: var(--f-brand, #e8532d);
  box-shadow: 0 4px 16px rgba(61, 90, 128, 0.3);
}

.back-to-top:active {
  transform: scale(0.92);
}

.back-to-top-fade-enter-active,
.back-to-top-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.back-to-top-fade-enter-from,
.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
