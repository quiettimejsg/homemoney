<!-- ExpenseSearch.vue -->
<template>
    <div class="search-container">
      <div class="search-header">
        <h2>{{ $t('expense.search.title') }}</h2>
        <div class="search-actions">
          <button @click="handleReset" class="reset-button">
            <i class="icon-reset"></i>
            {{ $t('expense.search.reset') }}
          </button>
        </div>
      </div>

      <div class="search-grid">
        <!-- 月份选择 -->        <div class="search-control">
          <label class="control-label" for="month">
            <i class="icon-calendar"></i>
            {{ $t('expense.search.month') }}
          </label>
          <div class="control-input">
            <select v-model="month" id="month" name="month" class="styled-select">
              <option value="">{{ $t('expense.search.allMonth') }}</option>
              <option v-for="option in monthOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- 类型选择 -->
        <div class="search-control">
          <label class="control-label" for="type">
            <i class="icon-category"></i>
            {{ $t('expense.search.type') }}
          </label>
          <div class="control-input">
            <select v-model="type" id="type" name="type" class="styled-select">
              <option value="">{{ $t('expense.search.allType') }}</option>
              <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
        </div>

        <!-- 排序方式 -->
        <div class="search-control">
          <label class="control-label" for="sortOption">
            <i class="icon-sort"></i>
            {{ $t('expense.search.sort') }}
          </label>
          <div class="control-input">
            <select v-model="sortOption" id="sortOption" name="sortOption" class="styled-select">
              <option value="dateDesc">{{ $t('expense.sort.dateDesc') }}</option>
              <option value="dateAsc">{{ $t('expense.sort.dateAsc') }}</option>
              <option value="amountDesc">{{ $t('expense.sort.amountDesc') }}</option>
              <option value="amountAsc">{{ $t('expense.sort.amountAsc') }}</option>
            </select>
          </div>
        </div>

        <!-- 金额范围 -->
        <div class="search-control">
          <label class="control-label" for="minAmount">
            <i class="icon-amount"></i>
            {{ $t('expense.search.amountRange') }}
          </label>
          <div class="amount-range">
            <div class="range-input">
              <input type="number" v-model.number="minAmount" id="minAmount" name="minAmount" min="0" step="0.01"
                     :placeholder="$t('expense.search.minAmountPlaceholder')">
              <span class="range-divider">-</span>
              <input type="number" v-model.number="maxAmount" id="maxAmount" name="maxAmount" min="0" step="0.01"
                     :placeholder="$t('expense.search.maxAmountPlaceholder')">
            </div>
            <div class="range-slider">
              <input type="range" min="0" :max="maxSliderValue" step="10"
                     v-model.number="minAmount" class="slider min-slider">
              <input type="range" min="0" :max="maxSliderValue" step="10"
                     v-model.number="maxAmount" class="slider max-slider">
            </div>
          </div>
        </div>

        <!-- 关键词搜索 -->
        <div class="search-control">
          <label class="control-label" for="keyword">
            <i class="icon-keyword"></i>
            {{ $t('expense.search.keyword') }}
          </label>
          <div class="control-input">
            <input type="text" v-model.trim="keyword" id="keyword" name="keyword"
                   :placeholder="$t('expense.search.keywordPlaceholder')">
          </div>
        </div>
      </div>

      <div v-if="activeFiltersCount > 0" class="active-filters">
        <div class="filter-badge" v-if="month">
          {{ $t('expense.search.month') }}: {{ monthDisplay }}
          <span @click="clearFilter('month')" class="clear-filter">×</span>
        </div>
        <div class="filter-badge" v-if="type">
          {{ $t('expense.search.type') }}: {{ type }}
          <span @click="clearFilter('type')" class="clear-filter">×</span>
        </div>
        <div class="filter-badge" v-if="minAmount || maxAmount">
          {{ $t('expense.search.amountRange') }}:
          {{ minAmount ? minAmount : '0' }} - {{ maxAmount ? maxAmount : '∞' }}
          <span @click="clearAmountFilter" class="clear-filter">×</span>
        </div>
        <div class="filter-badge" v-if="keyword">
          {{ $t('expense.search.keyword') }}: "{{ keyword }}"
          <span @click="clearFilter('keyword')" class="clear-filter">×</span>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatMonthLabelByLocale } from '@/utils/dateFormatter';

const props = defineProps({
  uniqueTypes: Array,
  initialKeyword: String,
  initialType: String,
  initialMonth: String,
  initialMinAmount: [String, Number],
  initialMaxAmount: [String, Number],
  initialSortOption: String,
  locale: { type: String, default: 'en-US' },
  maxAmountRange: { type: Number, default: 5000 }, // 默认最大金额范围
  availableMonths: { type: Array, default: () => [] }
});

const emit = defineEmits(['search']);

// 响应式搜索条件
const keyword = ref(props.initialKeyword || '');
const type = ref(props.initialType || '');
const month = ref(props.initialMonth || '');
const minAmount = ref(props.initialMinAmount || '');
const maxAmount = ref(props.initialMaxAmount || '');
const sortOption = ref(props.initialSortOption || 'dateDesc');
const monthOptions = ref([]);

// 计算属性
const monthDisplay = computed(() => {
  if (!month.value) return '';
  return formatMonthLabelByLocale(month.value, props.locale);
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (month.value) count++;
  if (type.value) count++;
  if (minAmount.value || maxAmount.value) count++;
  if (keyword.value) count++;
  return count;
});

const maxSliderValue = computed(() => {
  return props.maxAmountRange || 5000;
});

// 根据表格数据生成月份选项，无数据时显示最近12个月
const generateMonthOptions = () => {
  let options = [];

  // 检查是否有可用的月份数据，并且数据数组不为空
  if (props.availableMonths?.length) {
    // 使用提供的月份数据，将每个月份转换为包含值和显示标签的对象
    const { locale } = useI18n();
    options = props.availableMonths.map(month => {
      // 标准化语言环境以支持更多格式
      const localeMap = {
        en: 'en-US'
      };
      const currentLocale = locale.value;
      const normalizedLocale = localeMap[currentLocale] || currentLocale || 'en-US';
      return {
        value: month,
        label: formatMonthLabelByLocale(month, normalizedLocale)
      };
    });
  }

  monthOptions.value = options;
};

// 搜索处理
const handleSearch = () => {
  // 验证并转换数值类型
  const min = minAmount.value !== '' ? Number(minAmount.value) : undefined;
  const max = maxAmount.value !== '' ? Number(maxAmount.value) : undefined;

  // 确保数值有效性
  const validMin = !isNaN(min) ? min : undefined;
  const validMax = !isNaN(max) ? max : undefined;

  // 验证金额范围逻辑
  if (validMin !== undefined && validMax !== undefined && validMin > validMax) {
    // 如果最小值大于最大值，交换它们
    minAmount.value = validMax;
    maxAmount.value = validMin;
    return;
  }

  emit('search', {
    keyword: keyword.value,
    type: type.value,
    month: month.value,
    minAmount: validMin,
    maxAmount: validMax,
    sortOption: sortOption.value
  });
};

// 重置搜索条件
const handleReset = () => {
  keyword.value = '';
  type.value = '';
  month.value = '';
  minAmount.value = '';
  maxAmount.value = '';
  sortOption.value = 'dateDesc';
  handleSearch();
};

// 清除单个过滤器
const clearFilter = (filterName) => {
  switch (filterName) {
  case 'month':
    month.value = '';
    break;
  case 'type':
    type.value = '';
    break;
  case 'keyword':
    keyword.value = '';
    break;
  }
  handleSearch();
};

// 清除金额过滤器
const clearAmountFilter = () => {
  minAmount.value = '';
  maxAmount.value = '';
  handleSearch();
};

// 初始化月份选项
onMounted(generateMonthOptions);

// 监听所有筛选条件变化
watch([keyword, type, month, minAmount, maxAmount, sortOption], () => {
  handleSearch();
}, { deep: true });
</script>

  <style scoped>
  .search-container {
    background: transparent;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    margin-bottom: 25px;
    overflow: hidden;
}

  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .search-header h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .search-actions {
    display: flex;
    gap: 12px;
  }

  .search-button, .reset-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: none;
  }

  .search-button {
    background: linear-gradient(135deg, #4361ee, #3a56d4);
    color: white;
  }

  .search-button:hover {
    background: linear-gradient(135deg, #3a56d4, #314bc0);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  }

  .reset-button {
    background: #f5f7fa;
    color: #606266;
    border: 1px solid #dcdfe6;
  }

  .reset-button:hover {
    background: #eef2f7;
    color: #4361ee;
    border-color: #cbd5e0;
  }

  .search-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .search-control {
    display: flex;
    flex-direction: column;
  }

  .control-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    margin-bottom: 8px;
    color: #495057;
    font-size: 14px;
  }

  .control-label i {
    font-size: 16px;
    color: #4361ee;
  }

  .control-input {
    position: relative;
  }

  .control-input input, .styled-select {
    width: auto;
    max-width: 50%;
    padding: 12px 15px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: #f8fafc;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

  .control-input input:focus, .styled-select:focus {
    border-color: #4361ee;
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
    background: #fff;
  }

  .amount-range {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .range-input {
    display: flex;
    align-items: center;
    max-width: 20.9%;
    gap: 10px;
  }

  .range-input input {
    flex: 1;
    padding: 10px 12px;
    max-width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    text-align: center;
  }

  .range-divider {
    color: #94a3b8;
    font-weight: 500;
    max-width: 100%;
  }

  .range-slider {
    display: flex;
    align-items: center;
    max-width: 30%;
    gap: 10px;
    padding: 5px 0;
  }

  .slider {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: #e2e8f0;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    max-width: 100%;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #4361ee;
    cursor: pointer;
    transition: all 0.2s;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  }

  .min-slider::-webkit-slider-thumb {
    background: #4cc9f0;
  }

  .max-slider::-webkit-slider-thumb {
    background: #f72585;
  }

  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  .filter-badge {
    display: flex;
    align-items: center;
    padding: 8px 15px;
    background: #f0f7ff;
    border: 1px solid #c2e0ff;
    border-radius: 20px;
    font-size: 13px;
    color: #4361ee;
  }

  .clear-filter {
    margin-left: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    color: #94a3b8;
    transition: all 0.2s;
  }

  .clear-filter:hover {
    color: #f72585;
    transform: scale(1.2);
  }

  @media (max-width: 768px) {
    .search-grid {
      grid-template-columns: 1fr;
    }

    .search-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .search-actions {
      width: 100%;
    }

    .search-button, .reset-button {
      flex: 1;
      justify-content: center;
    }
    .range-input {
    display: flex;
    align-items: center;
    max-width: 13%;
    gap: 10px;
  }
  .control-input {
    position: relative;
    max-width: 70%;
  }
  }
  </style>
