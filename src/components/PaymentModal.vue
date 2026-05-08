<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CreditCard, Wallet, Timer, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';

interface PaymentModalProps {
  visible: boolean;
  amount: number;
  orderId?: string;
}

const props = defineProps<PaymentModalProps>();
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { t, locale } = useAppI18n();

// 支付状态: 'idle' | 'processing' | 'success' | 'failed'
const paymentStatus = ref<'idle' | 'processing' | 'success' | 'failed'>('idle');
const selectedMethod = ref<'balance' | 'wechat' | 'alipay'>('balance');
const countdown = ref(5);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 支付方式列表
const paymentMethods = computed(() => [
  {
    id: 'balance' as const,
    name: t('payment.method.balance'),
    icon: Wallet,
    desc: t('payment.method.balanceDesc'),
  },
  {
    id: 'wechat' as const,
    name: t('payment.method.wechat'),
    icon: CreditCard,
    desc: t('payment.method.wechatDesc'),
  },
  {
    id: 'alipay' as const,
    name: t('payment.method.alipay'),
    icon: CreditCard,
    desc: t('payment.method.alipayDesc'),
  },
]);

// 监听弹窗显示状态，重置状态
watch(() => props.visible, (visible) => {
  if (visible) {
    paymentStatus.value = 'idle';
    countdown.value = 5;
  } else {
    // 清理定时器
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }
});

// 开始支付
const handlePay = async (): Promise<void> => {
  if (paymentStatus.value === 'processing') return;
  
  paymentStatus.value = 'processing';
  countdown.value = 5;
  
  // 模拟支付处理倒计时
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      // 模拟 90% 成功率
      const success = Math.random() > 0.1;
      paymentStatus.value = success ? 'success' : 'failed';
      
      if (success) {
        setTimeout(() => {
          emit('success');
          emit('update:visible', false);
        }, 1200);
      }
    }
  }, 1000);
};

// 关闭弹窗
const handleClose = (): void => {
  if (paymentStatus.value === 'processing') {
    // 支付中不允许关闭
    return;
  }
  emit('cancel');
  emit('update:visible', false);
};

// 重试支付
const handleRetry = (): void => {
  paymentStatus.value = 'idle';
  countdown.value = 5;
};

// 格式化金额显示
const amountDisplay = computed(() => formatCurrency(props.amount, locale.value));
</script>

<template>
  <teleport to="body">
    <transition name="payment-fade">
      <div v-if="visible" class="payment-modal-overlay" @click.self="handleClose">
        <div class="payment-modal" :class="{ 'payment-modal--processing': paymentStatus === 'processing' }">
          <!-- 头部 -->
          <div class="payment-header">
            <h3 class="payment-title">{{ t('payment.title') }}</h3>
            <button
              v-if="paymentStatus !== 'processing'"
              type="button"
              class="payment-close"
              @click="handleClose"
            >
              ×
            </button>
          </div>

          <!-- 金额显示 -->
          <div class="payment-amount">
            <span class="payment-amount__label">{{ t('payment.amount') }}</span>
            <span class="payment-amount__value">{{ amountDisplay }}</span>
            <span v-if="orderId" class="payment-amount__order">{{ t('payment.orderId') }}: {{ orderId }}</span>
          </div>

          <!-- 支付方式选择 -->
          <div v-if="paymentStatus === 'idle'" class="payment-methods">
            <label
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method"
              :class="{ 'payment-method--active': selectedMethod === method.id }"
            >
              <input
                v-model="selectedMethod"
                type="radio"
                :value="method.id"
                class="payment-method__radio"
              >
              <div class="payment-method__icon">
                <el-icon :size="24">
                  <component :is="method.icon" />
                </el-icon>
              </div>
              <div class="payment-method__info">
                <span class="payment-method__name">{{ method.name }}</span>
                <span class="payment-method__desc">{{ method.desc }}</span>
              </div>
            </label>
          </div>

          <!-- 支付中状态 -->
          <div v-if="paymentStatus === 'processing'" class="payment-status payment-status--processing">
            <div class="payment-spinner">
              <el-icon :size="48"><Timer /></el-icon>
            </div>
            <p class="payment-status__text">{{ t('payment.processing') }}</p>
            <p class="payment-status__countdown">{{ countdown }}s</p>
            <div class="payment-progress">
              <div class="payment-progress__bar" :style="{ width: `${(5 - countdown) * 20}%` }" />
            </div>
          </div>

          <!-- 支付成功 -->
          <div v-if="paymentStatus === 'success'" class="payment-status payment-status--success">
            <div class="payment-icon payment-icon--success">
              <el-icon :size="48"><CircleCheck /></el-icon>
            </div>
            <p class="payment-status__text">{{ t('payment.success') }}</p>
            <p class="payment-status__sub">{{ t('payment.successSub') }}</p>
          </div>

          <!-- 支付失败 -->
          <div v-if="paymentStatus === 'failed'" class="payment-status payment-status--failed">
            <div class="payment-icon payment-icon--failed">
              <el-icon :size="48"><CircleClose /></el-icon>
            </div>
            <p class="payment-status__text">{{ t('payment.failed') }}</p>
            <p class="payment-status__sub">{{ t('payment.failedSub') }}</p>
          </div>

          <!-- 底部按钮 -->
          <div class="payment-actions">
            <template v-if="paymentStatus === 'idle'">
              <button type="button" class="payment-btn payment-btn--secondary" @click="handleClose">
                {{ t('payment.cancel') }}
              </button>
              <button type="button" class="payment-btn payment-btn--primary" @click="handlePay">
                {{ t('payment.confirm') }}
              </button>
            </template>
            
            <template v-if="paymentStatus === 'processing'">
              <button type="button" class="payment-btn payment-btn--disabled" disabled>
                {{ t('payment.processing') }}...
              </button>
            </template>
            
            <template v-if="paymentStatus === 'failed'">
              <button type="button" class="payment-btn payment-btn--secondary" @click="handleClose">
                {{ t('payment.cancel') }}
              </button>
              <button type="button" class="payment-btn payment-btn--primary" @click="handleRetry">
                {{ t('payment.retry') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.payment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  padding: 20px;
}

.payment-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: payment-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes payment-modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.payment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.payment-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.payment-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #9a9a9a;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
}

.payment-close:hover {
  background: #f5f5f5;
  color: #1a1a1a;
}

.payment-amount {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-amount__label {
  font-size: 0.875rem;
  color: #6b6b6b;
  margin-bottom: 8px;
}

.payment-amount__value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #b91c1c;
  line-height: 1;
}

.payment-amount__order {
  font-size: 0.75rem;
  color: #9a9a9a;
  margin-top: 8px;
}

.payment-methods {
  padding: 16px 24px;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.payment-method:last-child {
  margin-bottom: 0;
}

.payment-method:hover {
  border-color: #bdbdbd;
}

.payment-method--active {
  border-color: #e8532d;
  background: #fdf0ec;
}

.payment-method__radio {
  width: 18px;
  height: 18px;
  accent-color: #e8532d;
  cursor: pointer;
}

.payment-method__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #6b6b6b;
}

.payment-method--active .payment-method__icon {
  background: #e8532d;
  color: #fff;
}

.payment-method__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.payment-method__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.payment-method__desc {
  font-size: 0.75rem;
  color: #9a9a9a;
}

.payment-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
}

.payment-status--processing {
  min-height: 200px;
}

.payment-spinner {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e8532d;
  animation: spinner-rotate 1s linear infinite;
}

@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.payment-status__text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 16px 0 4px;
}

.payment-status__countdown {
  font-size: 0.875rem;
  color: #9a9a9a;
  margin-bottom: 16px;
}

.payment-progress {
  width: 200px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.payment-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, #e8532d, #ed7a5d);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.payment-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 8px;
}

.payment-icon--success {
  background: #d1fae5;
  color: #059669;
}

.payment-icon--failed {
  background: #fee2e2;
  color: #dc2626;
}

.payment-status__sub {
  font-size: 0.875rem;
  color: #6b6b6b;
  margin: 0;
}

.payment-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
}

.payment-btn {
  flex: 1;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.payment-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.payment-btn--primary {
  background: #e8532d;
  color: #fff;
}

.payment-btn--primary:hover:not(:disabled) {
  background: #c94522;
}

.payment-btn--secondary {
  background: #f5f5f5;
  color: #6b6b6b;
}

.payment-btn--secondary:hover:not(:disabled) {
  background: #e5e5e5;
}

.payment-btn--disabled {
  background: #e5e5e5;
  color: #9a9a9a;
  cursor: not-allowed;
}

/* 弹窗过渡动画 */
.payment-fade-enter-active,
.payment-fade-leave-active {
  transition: opacity 0.3s ease;
}

.payment-fade-enter-from,
.payment-fade-leave-to {
  opacity: 0;
}
</style>
