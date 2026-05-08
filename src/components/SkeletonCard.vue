<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 });
</script>

<template>
  <div class="skeleton-card">
    <div class="skeleton-card__image" />
    <div class="skeleton-card__content">
      <div class="skeleton-card__line skeleton-card__line--title" />
      <div
        v-for="i in rows - 2"
        :key="i"
        class="skeleton-card__line skeleton-card__line--desc"
        :style="{ width: i === rows - 2 ? '45%' : '80%' }"
      />
      <div class="skeleton-card__line skeleton-card__line--price" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  border-radius: var(--f-radius, 6px);
  border: 1px solid var(--f-border, #e5e5e5);
  background: var(--f-surface, #fff);
  overflow: hidden;
}

.skeleton-card__image {
  aspect-ratio: 1;
  width: 100%;
  background: linear-gradient(90deg, #edeae6 25%, #f5f2ee 50%, #edeae6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-card__content {
  padding: var(--sp-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3, 12px);
}

.skeleton-card__line {
  height: 14px;
  border-radius: var(--f-radius-sm, 4px);
  background: linear-gradient(90deg, #edeae6 25%, #f5f2ee 50%, #edeae6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-card__line--title {
  width: 65%;
  height: 16px;
}

.skeleton-card__line--desc {
  width: 80%;
}

.skeleton-card__line--price {
  width: 35%;
  height: 18px;
  margin-top: var(--sp-2, 8px);
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card__image,
  .skeleton-card__line {
    animation: none;
  }
}
</style>
