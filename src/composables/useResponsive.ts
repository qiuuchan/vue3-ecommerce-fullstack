import { ref, onMounted, onUnmounted } from 'vue';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024
} as const;

export function useResponsive() {
  const breakpoint = ref<Breakpoint>('desktop');
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const update = (): void => {
    width.value = window.innerWidth;
    if (width.value >= BREAKPOINTS.desktop) {
      breakpoint.value = 'desktop';
    } else if (width.value >= BREAKPOINTS.tablet) {
      breakpoint.value = 'tablet';
    } else {
      breakpoint.value = 'mobile';
    }
  };

  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(true);

  const sync = (): void => {
    isMobile.value = breakpoint.value === 'mobile';
    isTablet.value = breakpoint.value === 'tablet';
    isDesktop.value = breakpoint.value === 'desktop';
  };

  onMounted(() => {
    update();
    sync();
    window.addEventListener('resize', update, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return { breakpoint, width, isMobile, isTablet, isDesktop };
}
