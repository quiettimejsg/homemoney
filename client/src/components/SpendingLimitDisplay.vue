<template>
  <div class="spending-limit-display" v-if="spendingStore.isLimitEnabled">
    <div class="display-header">
      <div class="header-left">
        <h4 class="display-title">{{ $t('spending.monthlyProgress') }}</h4>
        <span class="current-month">{{ currentMonthName }}</span>
      </div>
      <div class="header-right">
        <el-button
          @click="showSettings = !showSettings"
          :icon="Setting"
          size="small"
          type="text"
          class="settings-btn"
        >
          {{ $t('spending.settings.title') }}
        </el-button>
      </div>
    </div>

    <!-- 进度条显示 -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="current-spending">
          ¥{{ formatAmount(spendingStore.currentMonthSpending) }}
        </span>
        <span class="progress-separator">/</span>
        <span class="limit-amount">
          ¥{{ formatAmount(spendingStore.monthlyLimit) }}
        </span>
        <span class="percentage" :class="percentageClass">
          ({{ Math.round(spendingStore.spendingPercentage) }}%)
        </span>
      </div>

      <el-progress
        :percentage="Math.min(spendingStore.spendingPercentage, 100)"
        :color="progressColor"
        :stroke-width="12"
        :show-text="false"
        class="spending-progress"
      />
    </div>

    <!-- 状态提示 -->
    <div class="status-section">
      <el-alert
        :title="statusAlert.title"
        :description="statusAlert.description"
        :type="statusAlert.type"
        :show-icon="true"
        :closable="false"
        class="status-alert"
      />
    </div>

    <!-- 详细信息 -->
    <div class="details-section">
      <div class="detail-item">
        <span class="detail-label">{{ $t('spending.remaining') }}:</span>
        <span class="detail-value" :class="remainingClass">
          ¥{{ formatAmount(spendingStore.remainingAmount) }}
        </span>
      </div>
      <div class="detail-item" v-if="spendingStore.isOverLimit">
        <span class="detail-label">{{ $t('spending.exceeded') }}:</span>
        <span class="detail-value exceeded-amount">
          ¥{{ formatAmount(spendingStore.currentMonthSpending - spendingStore.monthlyLimit) }}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('spending.dailyAverage') }}:</span>
        <span class="detail-value">
          ¥{{ formatAmount(dailyAverage) }}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">{{ $t('spending.recommendedDaily') }}:</span>
        <span class="detail-value" :class="recommendedDailyClass">
          ¥{{ formatAmount(recommendedDaily) }}
        </span>
      </div>
    </div>

    <!-- 设置面板 -->
    <el-collapse-transition>
      <div v-show="showSettings" class="settings-panel">
        <SpendingLimitSetting />
      </div>
    </el-collapse-transition>
  </div>

  <!-- 启用提示 -->
  <div class="enable-prompt" v-else>
    <div class="prompt-content">
      <el-icon class="prompt-icon"><TrendCharts /></el-icon>
      <div class="prompt-text">
        <h4>{{ $t('spending.enablePrompt.title') }}</h4>
        <p>{{ $t('spending.enablePrompt.description') }}</p>
      </div>
      <el-button
        @click="enableSpendingLimit"
        type="primary"
        :icon="Plus"
        class="enable-btn"
      >
        {{ $t('spending.enablePrompt.button') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSpendingStore } from '../stores/spending.js';
import { useI18n } from 'vue-i18n';
import { Setting, TrendCharts, Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import SpendingLimitSetting from './SpendingLimitSetting.vue';
import dayjs from 'dayjs';

const { t } = useI18n();
const spendingStore = useSpendingStore();

// 本地状态
const showSettings = ref(false);

// 计算属性
const currentMonthName = computed(() => {
  return dayjs().format('YYYY-MM');
});

const percentageClass = computed(() => {
  const percentage = spendingStore.spendingPercentage;
  if (percentage >= 100) return 'over-limit';
  if (percentage >= spendingStore.warningThreshold * 100) return 'near-limit';
  return 'normal';
});

const progressColor = computed(() => {
  const percentage = spendingStore.spendingPercentage;
  if (percentage >= 100) return '#f56c6c';
  if (percentage >= spendingStore.warningThreshold * 100) return '#e6a23c';
  return '#67c23a';
});

const remainingClass = computed(() => {
  const remaining = spendingStore.remainingAmount;
  if (remaining <= 0) return 'negative-amount';
  if (remaining < spendingStore.monthlyLimit * 0.2) return 'warning-amount';
  return 'positive-amount';
});

const statusAlert = computed(() => {
  const status = spendingStore.getSpendingStatus();

  switch (status.type) {
  case 'danger':
    return {
      type: 'error',
      title: t('spending.alert.overLimit.title'),
      description: t('spending.alert.overLimit.description', {
        amount: formatAmount(status.data.overAmount)
      })
    };
  case 'warning':
    return {
      type: 'warning',
      title: t('spending.alert.nearLimit.title'),
      description: t('spending.alert.nearLimit.description', {
        remaining: formatAmount(status.data.remaining),
        percentage: status.data.percentage
      })
    };
  default:
    return {
      type: 'success',
      title: t('spending.alert.normal.title'),
      description: t('spending.alert.normal.description', {
        remaining: formatAmount(status.data.remaining),
        percentage: status.data.percentage
      })
    };
  }
});

// 计算日均消费
const dailyAverage = computed(() => {
  const currentDay = dayjs().date();
  return currentDay > 0 ? spendingStore.currentMonthSpending / currentDay : 0;
});

// 计算建议日均消费
const recommendedDaily = computed(() => {
  const daysInMonth = dayjs().daysInMonth();
  const currentDay = dayjs().date();
  const remainingDays = daysInMonth - currentDay;

  if (remainingDays <= 0) return 0;
  return spendingStore.remainingAmount / remainingDays;
});

const recommendedDailyClass = computed(() => {
  const recommended = recommendedDaily.value;
  const average = dailyAverage.value;

  if (recommended <= 0) return 'negative-amount';
  if (recommended < average * 0.8) return 'warning-amount';
  return 'positive-amount';
});

// 方法
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

const enableSpendingLimit = () => {
  spendingStore.toggleLimitEnabled(true);
  showSettings.value = true;
  ElMessage.success(t('spending.enablePrompt.enabled'));
};

// 监听消费数据变化
const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  }
});

watch(() => props.expenses, (newExpenses) => {
  spendingStore.updateExpenses(newExpenses);
}, { immediate: true, deep: true });

// 组件挂载时初始化
onMounted(() => {
  spendingStore.loadSettings();
  if (props.expenses && props.expenses.length > 0) {
    spendingStore.updateExpenses(props.expenses);
  }
});
</script>

<style scoped>
.spending-limit-display {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  flex: 1;
}

.display-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.current-month {
  font-size: 12px;
  color: #909399;
}

.settings-btn {
  padding: 4px 8px;
  font-size: 12px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
  font-size: 14px;
}

.current-spending {
  font-weight: 600;
  color: #e6a23c;
}

.progress-separator {
  margin: 0 8px;
  color: #c0c4cc;
}

.limit-amount {
  font-weight: 500;
  color: #409eff;
}

.percentage {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
}

.percentage.normal {
  color: #67c23a;
}

.percentage.near-limit {
  color: #e6a23c;
}

.percentage.over-limit {
  color: #f56c6c;
}

.spending-progress {
  margin-bottom: 0;
}

.status-section {
  margin-bottom: 16px;
}

.status-alert {
  border-radius: 8px;
}

.details-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  font-size: 13px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.detail-label {
  color: #606266;
}

.detail-value {
  font-weight: 500;
  color: #303133;
}

.positive-amount {
  color: #67c23a;
}

.warning-amount {
  color: #e6a23c;
}

.negative-amount {
  color: #f56c6c;
}

.exceeded-amount {
  color: #f56c6c;
  font-weight: 600;
}

.settings-panel {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.enable-prompt {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.prompt-icon {
  font-size: 48px;
  color: #409eff;
}

.prompt-text h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.prompt-text p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.enable-btn {
  padding: 12px 24px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spending-limit-display {
    padding: 16px;
  }

  .display-header {
    flex-direction: column;
    gap: 12px;
  }

  .details-section {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .progress-info {
    flex-wrap: wrap;
    gap: 4px;
  }

  .enable-prompt {
    padding: 20px 16px;
  }

  .prompt-icon {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .details-section {
    font-size: 12px;
  }

  .progress-info {
    font-size: 13px;
  }
}
</style>
