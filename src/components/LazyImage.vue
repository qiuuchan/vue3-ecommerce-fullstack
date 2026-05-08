<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { PictureFilled, Picture } from '@element-plus/icons-vue';

interface LazyImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  /** 是否尝试使用 WebP（src 需支持自动格式转换，如 Cloudinary/Imgix） */
  webp?: boolean;
}

const props = withDefaults(defineProps<LazyImageProps>(), {
  aspectRatio: '1',
  webp: false
});

const supportsWebP = ref(false);

// 检测浏览器是否支持 WebP
const checkWebPSupport = (): void => {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    supportsWebP.value = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
};

const optimizedSrc = computed((): string => {
  if (!props.webp || !supportsWebP.value) return props.src;
  // 如果 src 是 Unsplash 图片，追加格式参数
  if (props.src.includes('images.unsplash.com')) {
    const sep = props.src.includes('?') ? '&' : '?';
    return `${props.src}${sep}fm=webp&q=80`;
  }
  return props.src;
});

const emit = defineEmits<{
  (e: 'load'): void;
  (e: 'error'): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(false);
const loaded = ref(false);
const errored = ref(false);
let observer: IntersectionObserver | null = null;

const onLoad = (): void => {
  loaded.value = true;
  emit('load');
};

const onError = (): void => {
  errored.value = true;
  emit('error');
};

onMounted(() => {
  checkWebPSupport();
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { rootMargin: '200px' }
  );
  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <div ref="containerRef" class="lazy-image" :style="{ aspectRatio: props.aspectRatio }">
    <img
      v-if="isVisible && !errored"
      :src="optimizedSrc"
      :alt="props.alt"
      class="lazy-image__img"
      :class="{ 'lazy-image__img--loaded': loaded }"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />
    <div v-if="errored" class="lazy-image__error">
      <el-icon :size="32" aria-hidden="true"><Picture /></el-icon>
    </div>
    <div v-if="!loaded && !errored" class="lazy-image__placeholder">
      <el-icon :size="32" aria-hidden="true"><PictureFilled /></el-icon>
    </div>
  </div>
</template>

<style scoped>
.lazy-image {
  position: relative;
  background: #f5f5f5;
  overflow: hidden;
  border-radius: var(--f-radius-sm, 4px);
}

.lazy-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image__img--loaded {
  opacity: 1;
}

.lazy-image__placeholder,
.lazy-image__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--f-text-subtle, #9a9a9a);
}

.lazy-image__error {
  background: #fafafa;
  color: var(--f-text-subtle, #9a9a9a);
}
</style>
