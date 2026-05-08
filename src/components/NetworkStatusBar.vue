<script setup lang="ts">
import { useNetworkStatus } from '@/composables/useNetworkStatus';
import { useAppI18n } from '@/composables/useAppI18n';

const { isOnline } = useNetworkStatus();
const { t } = useAppI18n();
</script>

<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="network-status-bar" role="alert" aria-live="assertive">
      <span class="network-status-bar__icon">⚠️</span>
      <span class="network-status-bar__text">{{ t('network.offline') }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.network-status-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fef3c7;
  color: #92400e;
  font-size: 0.85rem;
  font-weight: 500;
  border-bottom: 1px solid #fde68a;
}

.network-status-bar__icon {
  font-size: 1rem;
  line-height: 1;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
