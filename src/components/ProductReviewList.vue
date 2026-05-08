<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { UserFilled, Star } from '@element-plus/icons-vue';
import type { ProductReview } from '@/types/product';
import { fetchProductReviewsApi } from '@/api/product';
import { useAppI18n } from '@/composables/useAppI18n';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

interface ReviewListProps {
  productId: number;
  avgRating?: number;
  totalCount?: number;
}

const props = defineProps<ReviewListProps>();
const { t, locale } = useAppI18n();

const reviews = ref<ProductReview[]>([]);
const loading = ref(false);
const error = ref('');

// 筛选条件
const filterRating = ref<number | null>(null);

// 加载评价列表
const loadReviews = async (): Promise<void> => {
  if (!props.productId) return;
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchProductReviewsApi(props.productId);
    reviews.value = data || [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('common.loadFailed');
    reviews.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听商品ID变化，重新加载
watch(() => props.productId, () => {
  void loadReviews();
}, { immediate: true });

// 筛选后的评价列表
const filteredReviews = computed(() => {
  if (!filterRating.value) return reviews.value;
  return reviews.value.filter(r => r.rating === filterRating.value);
});

// 各星级评价数量统计
const ratingStats = computed(() => {
  const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.value.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      stats[r.rating as keyof typeof stats]++;
    }
  });
  return stats;
});

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 设置筛选
const setFilter = (rating: number | null): void => {
  filterRating.value = rating;
};

onMounted(() => {
  void loadReviews();
});
</script>

<template>
  <section class="review-section">
    <h3 class="review-section__title">{{ t('review.title') }}</h3>

    <!-- 评价统计 -->
    <div class="review-stats">
      <div class="review-stats__overall">
        <span class="review-stats__score">{{ avgRating?.toFixed(1) ?? '0.0' }}</span>
        <div class="review-stats__stars">
          <el-icon
            v-for="n in 5"
            :key="n"
            :size="16"
            :class="{ 'review-star--active': n <= Math.round(avgRating || 0) }"
          >
            <Star />
          </el-icon>
        </div>
        <span class="review-stats__count">{{ totalCount ?? reviews.length }} {{ t('review.count') }}</span>
      </div>

      <!-- 星级筛选 -->
      <div class="review-stats__filters">
        <button
          type="button"
          class="review-filter"
          :class="{ 'review-filter--active': filterRating === null }"
          @click="setFilter(null)"
        >
          {{ t('review.all') }} ({{ reviews.length }})
        </button>
        <button
          v-for="rating in [5, 4, 3, 2, 1]"
          :key="rating"
          type="button"
          class="review-filter"
          :class="{ 'review-filter--active': filterRating === rating }"
          @click="setFilter(rating)"
        >
          {{ rating }}★ ({{ ratingStats[rating as keyof typeof ratingStats] }})
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="review-loading">
      <SkeletonLoader type="list" :count="3" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="review-error">
      <p>{{ error }}</p>
      <button type="button" class="review-retry" @click="loadReviews">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredReviews.length === 0" class="review-empty">
      <el-icon :size="48" class="review-empty__icon"><UserFilled /></el-icon>
      <p>{{ filterRating ? t('review.noFiltered') : t('review.empty') }}</p>
    </div>

    <!-- 评价列表 -->
    <ul v-else class="review-list">
      <li
        v-for="review in filteredReviews"
        :key="review.id"
        class="review-item"
      >
        <div class="review-item__header">
          <div class="review-item__user">
            <div class="review-item__avatar">
              <img v-if="review.userAvatar" :src="review.userAvatar" :alt="review.userName">
              <el-icon v-else :size="20"><UserFilled /></el-icon>
            </div>
            <span class="review-item__name">{{ review.userName }}</span>
          </div>
          <div class="review-item__meta">
            <div class="review-item__stars">
              <el-icon
                v-for="n in 5"
                :key="n"
                :size="12"
                :class="{ 'review-star--active': n <= review.rating }"
              >
                <Star />
              </el-icon>
            </div>
            <span class="review-item__date">{{ formatDate(review.createdAt) }}</span>
          </div>
        </div>
        <p v-if="review.content" class="review-item__content">
          {{ review.content }}
        </p>
        <p v-else class="review-item__content review-item__content--empty">
          {{ t('review.noContent') }}
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.review-section {
  margin-top: 32px;
  padding: 24px;
  background: #fff;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 8px;
}

.review-section__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 20px;
}

/* 评价统计 */
.review-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.review-stats__overall {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.review-stats__score {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--f-brand, #e8532d);
  line-height: 1;
}

.review-stats__stars {
  display: flex;
  gap: 2px;
  color: #e5e5e5;
}

.review-star--active {
  color: #f59e0b;
}

.review-stats__count {
  font-size: 0.75rem;
  color: var(--f-text-muted, #6b6b6b);
}

/* 筛选按钮 */
.review-stats__filters {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.review-filter {
  padding: 6px 14px;
  font-size: 0.8125rem;
  color: var(--f-text-muted, #6b6b6b);
  background: #fff;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.review-filter:hover {
  border-color: var(--f-brand, #e8532d);
  color: var(--f-brand, #e8532d);
}

.review-filter--active {
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  color: #fff;
}

/* 加载和错误状态 */
.review-loading,
.review-error,
.review-empty {
  padding: 40px 20px;
  text-align: center;
}

.review-error {
  color: #e11d48;
}

.review-retry {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 0.875rem;
  color: var(--f-brand, #e8532d);
  background: transparent;
  border: 1px solid var(--f-brand, #e8532d);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.review-retry:hover {
  background: var(--f-brand, #e8532d);
  color: #fff;
}

.review-empty {
  color: var(--f-text-muted, #6b6b6b);
}

.review-empty__icon {
  margin-bottom: 12px;
  color: var(--f-text-subtle, #9a9a9a);
}

/* 评价列表 */
.review-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--f-border, #f0f0f0);
}

.review-item:last-child {
  border-bottom: none;
}

.review-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.review-item__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-item__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--f-text-muted, #6b6b6b);
  overflow: hidden;
}

.review-item__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-item__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--f-text, #1a1a1a);
}

.review-item__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.review-item__stars {
  display: flex;
  gap: 1px;
  color: #e5e5e5;
}

.review-item__date {
  font-size: 0.75rem;
  color: var(--f-text-subtle, #9a9a9a);
}

.review-item__content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--f-text, #1a1a1a);
  margin: 0;
  padding-left: 46px;
}

.review-item__content--empty {
  color: var(--f-text-subtle, #9a9a9a);
  font-style: italic;
}

@media (max-width: 640px) {
  .review-section {
    padding: 16px;
  }

  .review-stats {
    flex-direction: column;
    gap: 16px;
  }

  .review-stats__overall {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .review-item__header {
    flex-direction: column;
    gap: 8px;
  }

  .review-item__meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
  }

  .review-item__content {
    padding-left: 0;
  }
}
</style>
