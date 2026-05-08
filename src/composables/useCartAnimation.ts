import { ref } from 'vue';

export interface AnimationOptions {
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 小球尺寸 */
  ballSize?: number;
  /** 小球颜色 */
  ballColor?: string;
}

/**
 * 购物车飞入动画
 * 点击加购时商品飞入购物车图标的小球动画
 */
export function useCartAnimation() {
  const isAnimating = ref(false);

  /**
   * 触发飞入动画
   * @param startEl 起始元素（通常是商品图片）
   * @param targetSelector 目标元素选择器（购物车图标）
   * @param options 动画选项
   */
  const animateToCart = async (
    startEl: HTMLElement,
    targetSelector: string = '.mall-icon-btn--cart',
    options: AnimationOptions = {}
  ): Promise<void> => {
    const { duration = 600, ballSize = 20, ballColor = '#e8532d' } = options;

    // 获取目标元素
    const targetEl = document.querySelector(targetSelector) as HTMLElement;
    if (!targetEl) {
      console.warn('Cart animation target not found:', targetSelector);
      return;
    }

    // 防止重复动画
    if (isAnimating.value) return;
    isAnimating.value = true;

    // 获取起始和目标位置
    const startRect = startEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // 计算起始点（元素中心）
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    // 计算目标点（购物车图标中心）
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // 创建小球元素
    const ball = document.createElement('div');
    ball.className = 'cart-fly-ball';
    ball.style.cssText = `
      position: fixed;
      z-index: 9999;
      width: ${ballSize}px;
      height: ${ballSize}px;
      border-radius: 50%;
      background: ${ballColor};
      box-shadow: 0 2px 8px rgba(232, 83, 45, 0.4);
      pointer-events: none;
      left: ${startX - ballSize / 2}px;
      top: ${startY - ballSize / 2}px;
    `;
    document.body.appendChild(ball);

    // 计算控制点（贝塞尔曲线）
    // 控制点在起始点和目标点之间偏上的位置，形成抛物线效果
    const controlX = (startX + endX) / 2;
    const controlY = Math.min(startY, endY) - 150;

    // 使用 Web Animations API
    const keyframes: Keyframe[] = [];
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // 二次贝塞尔曲线公式
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY;
      
      // 缩放效果：开始时正常，中间缩小，到目标时放大再缩小（模拟落入效果）
      let scale = 1;
      if (t < 0.3) {
        scale = 1 - t * 0.3;
      } else if (t > 0.8) {
        scale = 0.7 + (1 - t) * 1.5;
      } else {
        scale = 0.7;
      }

      keyframes.push({
        transform: `translate(${x - startX}px, ${y - startY}px) scale(${scale})`,
        opacity: t > 0.95 ? 1 - (t - 0.95) * 20 : 1,
      });
    }

    const animation = ball.animate(keyframes, {
      duration,
      easing: 'ease-in-out',
      fill: 'forwards',
    });

    // 动画结束后的清理
    await animation.finished;
    
    // 触发购物车图标抖动动画
    triggerCartBounce(targetEl);

    // 清理小球
    ball.remove();
    isAnimating.value = false;
  };

  /**
   * 触发购物车图标抖动动画
   */
  const triggerCartBounce = (targetEl: HTMLElement): void => {
    targetEl.classList.add('cart-bounce');
    setTimeout(() => {
      targetEl.classList.remove('cart-bounce');
    }, 400);
  };

  return {
    isAnimating,
    animateToCart,
  };
}
