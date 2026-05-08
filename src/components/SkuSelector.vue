<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { formatCurrency } from '@/utils/formatLocale';

export interface SkuSpec {
  name: string;       // 规格名称，如 "颜色"
  values: SkuValue[];  // 可选值
}

export interface SkuValue {
  label: string;       // 展示名，如 "红色"
  value: string;        // 唯一标识
  disabled?: boolean;   // 是否不可选
}

export interface SkuVariant {
  id: number | string;
  specValues: Record<string, string>; // { "颜色": "red", "尺寸": "L" }
  price: number;
  stock: number;
  sku?: string;
}

interface SkuSelectorProps {
  specs: SkuSpec[];
  variants: SkuVariant[];
  basePrice: number;
}

const props = defineProps<SkuSelectorProps>();
const emit = defineEmits<{
  (e: 'change', variant: SkuVariant | null): void;
}>();

// 当前选中的规格值
const selected = ref<Record<string, string>>({});

// 根据当前选择匹配 variant
const currentVariant = computed<SkuVariant | null>(() => {
  const keys = props.specs.map(s => s.name);
  const match = props.variants.find(v =>
    keys.every(k => v.specValues[k] === selected.value[k])
  );
  return match || null;
});

const currentPrice = computed(() => currentVariant.value?.price ?? props.basePrice);
const currentStock = computed(() => currentVariant.value?.stock ?? 0);
const isFullySelected = computed(() => {
  return props.specs.every(s => selected.value[s.name]);
});

// 规格值可选状态：检查是否与已选其他规格值存在有效组合
const isValueAvailable = (specName: string, value: string): boolean => {
  const otherKeys = props.specs
    .filter(s => s.name !== specName)
    .map(s => s.name);

  return props.variants.some(v => {
    // 该变体必须包含当前规格值
    if (v.specValues[specName] !== value) return false;
    // 已选的其他规格必须匹配（没选的跳过）
    return otherKeys.every(k => {
      const sel = selected.value[k];
      if (!sel) return true;
      return v.specValues[k] === sel;
    });
  });
};

// 点击规格值
const handleSelect = (specName: string, value: string): void => {
  const current = selected.value[specName];
  if (current === value) {
    // 取消选中
    const next = { ...selected.value };
    delete next[specName];
    selected.value = next;
  } else {
    selected.value = { ...selected.value, [specName]: value };
  }
  emit('change', currentVariant.value);
};

// 规格值样式
const valueClass = (specName: string, value: string) => ({
  'sku-value': true,
  'sku-value--active': selected.value[specName] === value,
  'sku-value--disabled': !isValueAvailable(specName, value),
});

// 监听选中变化
watch(selected, () => {
  emit('change', currentVariant.value);
}, { deep: true });

const formatPrice = (p: number) => formatCurrency(p, 'zh-CN');
</script>

<template>
  <div class="sku-selector">
    <div
      v-for="spec in specs"
      :key="spec.name"
      class="sku-spec"
    >
      <span class="sku-spec__label">{{ spec.name }}</span>
      <div class="sku-spec__values">
        <button
          v-for="val in spec.values"
          :key="val.value"
          type="button"
          :class="valueClass(spec.name, val.value)"
          :disabled="val.disabled || !isValueAvailable(spec.name, val.value)"
          @click="handleSelect(spec.name, val.value)"
        >
          {{ val.label }}
        </button>
      </div>
    </div>

    <div v-if="isFullySelected" class="sku-info">
      <span class="sku-info__price">{{ formatPrice(currentPrice) }}</span>
      <span class="sku-info__stock" :class="{ 'sku-info__stock--low': currentStock < 10 }">
        库存 {{ currentStock }} 件
      </span>
    </div>
  </div>
</template>

<style scoped>
.sku-selector {
  margin: 16px 0;
}

.sku-spec {
  margin-bottom: 14px;
}

.sku-spec__label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b6b6b;
  margin-bottom: 8px;
}

.sku-spec__values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sku-value {
  padding: 8px 18px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #fff;
  font-size: 0.875rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
}

.sku-value:hover:not(:disabled):not(.sku-value--active) {
  border-color: #bdbdbd;
}

.sku-value--active {
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  color: #fff;
}

.sku-value--disabled,
.sku-value:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}

.sku-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 16px;
  background: #fdf0ec;
  border-radius: 6px;
}

.sku-info__price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #b91c1c;
}

.sku-info__stock {
  font-size: 0.8125rem;
  color: #6b6b6b;
}

.sku-info__stock--low {
  color: #e8532d;
}
</style>
