import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

export function useNetworkStatus() {
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return { isOnline };
}
