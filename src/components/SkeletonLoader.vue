<script setup lang="ts">
interface SkeletonProps {
  type?: 'text' | 'card' | 'circle' | 'list' | 'article';
  lines?: number;
  rows?: number;
  animate?: boolean;
}

withDefaults(defineProps<SkeletonProps>(), {
  type: 'text',
  lines: 3,
  rows: 1,
  animate: true
});
</script>

<template>
  <!-- 文本骨架：多行短条 -->
  <div v-if="type === 'text'" class="skeleton skeleton--text" :class="{ 'skeleton--animate': animate }">
    <div
      v-for="n in lines"
      :key="n"
      class="skeleton__line"
      :style="{ width: n === lines ? '60%' : '100%' }"
    />
  </div>

  <!-- 卡片骨架：图片 + 标题 + 描述 -->
  <div v-else-if="type === 'card'" class="skeleton skeleton--card" :class="{ 'skeleton--animate': animate }">
    <div class="skeleton__img" />
    <div class="skeleton__body">
      <div class="skeleton__line" style="width: 80%" />
      <div class="skeleton__line" style="width: 50%" />
      <div class="skeleton__line" style="width: 40%" />
    </div>
  </div>

  <!-- 圆形骨架：头像/图标 -->
  <div v-else-if="type === 'circle'" class="skeleton skeleton--circle" :class="{ 'skeleton--animate': animate }">
    <div class="skeleton__circle" />
    <div class="skeleton__text">
      <div class="skeleton__line" style="width: 70%" />
      <div class="skeleton__line" style="width: 45%" />
    </div>
  </div>

  <!-- 列表骨架：多行卡片 -->
  <div v-else-if="type === 'list'" class="skeleton skeleton--list" :class="{ 'skeleton--animate': animate }">
    <div v-for="r in rows" :key="r" class="skeleton--card">
      <div class="skeleton__img skeleton__img--sm" />
      <div class="skeleton__body">
        <div class="skeleton__line" style="width: 75%" />
        <div class="skeleton__line" style="width: 50%" />
      </div>
    </div>
  </div>

  <!-- 文章骨架：大图 + 多行文本 -->
  <div v-else-if="type === 'article'" class="skeleton skeleton--article" :class="{ 'skeleton--animate': animate }">
    <div class="skeleton__img skeleton__img--lg" />
    <div class="skeleton__body">
      <div class="skeleton__line" style="width: 90%" />
      <div class="skeleton__line" style="width: 100%" />
      <div class="skeleton__line" style="width: 85%" />
      <div class="skeleton__line" style="width: 60%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  --skeleton-bg: #f0f0f0;
  --skeleton-shine: #e8e8e8;
}

.skeleton--animate .skeleton__line,
.skeleton--animate .skeleton__img,
.skeleton--animate .skeleton__circle {
  background: linear-gradient(90deg, var(--skeleton-bg) 25%, var(--skeleton-shine) 50%, var(--skeleton-bg) 75%);
  background-size: 200% 100%;
  animation: skeleton-shine 1.5s infinite ease-in-out;
}

@keyframes skeleton-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton__line {
  height: 14px;
  background: var(--skeleton-bg);
  border-radius: 6px;
  margin-bottom: 10px;
}

.skeleton__line:last-child {
  margin-bottom: 0;
}

/* Card */
.skeleton--card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton__img {
  width: 100%;
  aspect-ratio: 1;
  background: var(--skeleton-bg);
  border-radius: 12px;
}

.skeleton__img--sm {
  width: 64px;
  height: 64px;
  aspect-ratio: auto;
  flex-shrink: 0;
}

.skeleton__img--lg {
  aspect-ratio: 16/9;
}

.skeleton__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Circle */
.skeleton--circle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton__circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--skeleton-bg);
  flex-shrink: 0;
}

.skeleton__text {
  flex: 1;
}

/* List */
.skeleton--list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton--list .skeleton--card {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

/* Article */
.skeleton--article {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Text */
.skeleton--text {
  display: flex;
  flex-direction: column;
}
</style>
