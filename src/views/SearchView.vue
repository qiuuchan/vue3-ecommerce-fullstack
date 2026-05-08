<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Delete, TrendCharts, Clock } from '@element-plus/icons-vue';
import { fetchProductList } from '@/api/product';
import GoodsCard from '@/components/GoodsCard.vue';
import type { Product } from '@/types/product';
import { useAppI18n } from '@/composables/useAppI18n';

const { t, locale } = useAppI18n();
const route = useRoute();

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

// 热门搜索词
const hotSearches = computed(() =>
  locale.value === 'zh-CN'
    ? ['沃柑', '车厘子', '牛排', '猕猴桃', '蓝莓', '橄榄油', '鸡蛋']
    : ['Tangerine', 'Cherry', 'Steak', 'Kiwi', 'Blueberry', 'Olive Oil', 'Eggs']
);

// 状态
const keyword = ref('');
const allProducts = ref<Product[]>([]);
const loading = ref(false);
const searchHistory = ref<string[]>([]);

// 从 URL query 初始化搜索词
const initKeyword = (): void => {
  const q = route.query.q;
  if (typeof q === 'string' && q.trim()) {
    keyword.value = q.trim();
  }
};

// 搜索历史持久化
const loadHistory = (): void => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    searchHistory.value = raw ? JSON.parse(raw) : [];
  } catch {
    searchHistory.value = [];
  }
};

const saveHistory = (term: string): void => {
  if (!term.trim()) return;
  const list = searchHistory.value.filter(h => h !== term);
  list.unshift(term);
  searchHistory.value = list.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value));
  } catch { /* ignore */ }
};

const removeHistory = (term: string): void => {
  searchHistory.value = searchHistory.value.filter(h => h !== term);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value));
  } catch { /* ignore */ }
};

const clearHistory = (): void => {
  searchHistory.value = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch { /* ignore */ }
};

// 搜索结果
const results = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  if (!k) return [];
  return allProducts.value.filter(
    p => p.name.toLowerCase().includes(k) || (p.shopName || '').toLowerCase().includes(k)
  );
});

const hasSearched = computed(() => keyword.value.trim().length > 0);
const noResults = computed(() => hasSearched.value && !loading.value && results.value.length === 0);

// 执行搜索
const doSearch = async (term?: string): Promise<void> => {
  const q = (term ?? keyword.value).trim();
  if (!q) return;
  keyword.value = q;
  saveHistory(q);

  if (allProducts.value.length === 0) {
    loading.value = true;
    try {
      allProducts.value = await fetchProductList();
    } catch {
      allProducts.value = [];
    } finally {
      loading.value = false;
    }
  }
};

// 防抖输入
const debouncedKeyword = ref('');
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(keyword, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = val;
  }, 300);
});

// 输入变化时自动搜索（需要先有数据）
watch(debouncedKeyword, async (val) => {
  const q = val.trim();
  if (!q) return;
  if (allProducts.value.length === 0) {
    loading.value = true;
    try {
      allProducts.value = await fetchProductList();
    } catch {
      allProducts.value = [];
    } finally {
      loading.value = false;
    }
  }
});

// 点击搜索历史或热门搜索
const handleTagClick = (term: string): void => {
  keyword.value = term;
  void doSearch(term);
};

// 按键搜索
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter') {
    void doSearch();
  }
};

// 清除输入
const handleClear = (): void => {
  keyword.value = '';
};

// 显示搜索提示（无输入时）
const showSuggestions = computed(() => !hasSearched.value);

onMounted(() => {
  loadHistory();
  initKeyword();
  if (keyword.value) {
    void doSearch(keyword.value);
  }
});
</script>

<template>
  <div class="search-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrap">
        <el-icon class="search-input__icon" :size="20"><Search /></el-icon>
        <input
          v-model="keyword"
          type="text"
          class="search-input__field"
          :placeholder="t('search.pagePlaceholder')"
          autofocus
          @keydown="handleKeydown"
        >
        <button
          v-if="keyword"
          type="button"
          class="search-input__clear"
          @click="handleClear"
          aria-label="Clear"
        >
          ×
        </button>
      </div>
      <button type="button" class="search-btn" @click="doSearch()">
        {{ t('search.button') }}
      </button>
    </div>

    <!-- 搜索提示 / 热门 / 历史 -->
    <div v-if="showSuggestions" class="search-suggestions">
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="search-section">
        <div class="search-section__header">
          <h3 class="search-section__title">
            <el-icon :size="16"><Clock /></el-icon>
            {{ t('search.history') }}
          </h3>
          <button type="button" class="search-section__action" @click="clearHistory">
            <el-icon :size="14"><Delete /></el-icon>
            {{ t('search.clearHistory') }}
          </button>
        </div>
        <div class="search-tags">
          <button
            v-for="term in searchHistory"
            :key="term"
            type="button"
            class="search-tag search-tag--history"
            @click="handleTagClick(term)"
          >
            {{ term }}
            <span
              class="search-tag__remove"
              @click.stop="removeHistory(term)"
              aria-label="Remove"
            >×</span>
          </button>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div class="search-section">
        <div class="search-section__header">
          <h3 class="search-section__title">
            <el-icon :size="16"><TrendCharts /></el-icon>
            {{ t('search.hot') }}
          </h3>
        </div>
        <div class="search-tags">
          <button
            v-for="term in hotSearches"
            :key="term"
            type="button"
            class="search-tag search-tag--hot"
            @click="handleTagClick(term)"
          >
            {{ term }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="search-loading">
      <div class="search-loading__spinner" />
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- 搜索结果 -->
    <div v-if="hasSearched && !loading" class="search-results">
      <p class="search-results__info">
        <template v-if="results.length > 0">
          {{ t('search.resultCount', { n: results.length }) }}
        </template>
        <template v-else>
          {{ t('search.noResult') }}
        </template>
      </p>

      <div v-if="results.length > 0" class="search-results__grid">
        <GoodsCard
          v-for="product in results"
          :key="product.id"
          v-bind="product"
        />
      </div>

      <!-- 无结果 -->
      <div v-if="noResults" class="search-empty">
        <el-icon :size="48"><Search /></el-icon>
        <p>{{ t('search.noResultHint') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input__icon {
  position: absolute;
  left: 16px;
  color: #9a9a9a;
  pointer-events: none;
}

.search-input__field {
  width: 100%;
  height: 48px;
  padding: 0 48px 0 48px;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a1a1a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.search-input__field:focus {
  border-color: var(--f-brand, #e8532d);
}

.search-input__field::placeholder {
  color: #bdbdbd;
}

.search-input__clear {
  position: absolute;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f0f0f0;
  color: #6b6b6b;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
}

.search-btn {
  height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 8px;
  background: var(--f-brand, #e8532d);
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #d14422;
}

/* 搜索提示区域 */
.search-suggestions {
  max-width: 700px;
}

.search-section {
  margin-bottom: 28px;
}

.search-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.search-section__title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.search-section__action {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #9a9a9a;
  font-size: 0.8125rem;
  cursor: pointer;
}

.search-section__action:hover {
  color: #e8532d;
}

.search-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  background: #fff;
  font-size: 0.875rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
}

.search-tag:hover {
  border-color: var(--f-brand, #e8532d);
  color: var(--f-brand, #e8532d);
}

.search-tag--hot {
  background: #fdf0ec;
  border-color: #fad9cf;
  color: #d14422;
}

.search-tag--hot:hover {
  background: #fad9cf;
}

.search-tag--history {
  background: #f5f5f5;
}

.search-tag__remove {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75rem;
  color: #9a9a9a;
}

.search-tag__remove:hover {
  background: #e5e5e5;
  color: #1a1a1a;
}

/* 搜索结果 */
.search-results__info {
  font-size: 0.875rem;
  color: #6b6b6b;
  margin-bottom: 20px;
}

.search-results__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

/* 加载 */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: #9a9a9a;
}

.search-loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f0f0f0;
  border-top-color: var(--f-brand, #e8532d);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: #bdbdbd;
}
</style>
