<script setup lang="ts">
import BackToTop from '@/components/BackToTop.vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import NetworkStatusBar from '@/components/NetworkStatusBar.vue';
</script>

<template>
  <NetworkStatusBar />
  <ErrorBoundary>
    <router-view v-slot="{ Component, route }">
      <Transition name="page-slide" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </router-view>
  </ErrorBoundary>
  <BackToTop />
</template>

<style>
.page-slide-enter-active,
.page-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
