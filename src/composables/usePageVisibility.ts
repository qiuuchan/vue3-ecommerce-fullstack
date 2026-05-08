import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(typeof document !== 'undefined' ? !document.hidden : true);

function handleVisibilityChange() {
  isVisible.value = !document.hidden;
}

/**
 * 监听页面可见性变化
 * @param onShow 页面从隐藏变为可见时的回调
 */
export function usePageVisibility(onShow?: () => void) {
  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (onShow && !document.hidden) {
      onShow();
    }
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  return { isVisible };
}
