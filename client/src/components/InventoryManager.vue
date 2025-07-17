<template>
  <div class="inventory-manager">
    <el-card :header="$t('inventory.title')">
      <!-- 操作按钮区 -->
      <div class="action-buttons">
        <el-button type="primary" @click="showAddItemDialog = true">
          <el-icon><Plus /></el-icon> {{ $t('inventory.addItem') }}
        </el-button>
      </div>

      <!-- 库存列表 -->
      <div class="table-container">
  <el-table :data="filteredInventory" stripe style="margin-top: 16px;">
        <el-table-column prop="name" :label="$t('inventory.columns.name')" sortable></el-table-column>
        <el-table-column prop="category" :label="$t('inventory.columns.category')" sortable class-name="category-column"></el-table-column>
        <el-table-column prop="quantity" :label="$t('inventory.columns.quantity')" sortable>
          <template #default="{ row }">
            <span :class="row.quantity <= row.lowStockThreshold ? 'low-stock' : ''">
              {{ row.quantity }} {{ row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="expiryDate" :label="$t('inventory.columns.expiryDate')" sortable>
          <template #default="{ row }">
            <span :class="isExpired(row.expiryDate) ? 'expired' : isSoonExpired(row.expiryDate) ? 'soon-expired' : ''">
              {{ formatDate(row.expiryDate) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.action')">
          <template #default="{ row }">
            <el-button size="small" @click="editItem(row)">{{ $t('common.edit') }}</el-button>
            <el-button size="small" type="danger" @click="deleteItem(row.id)">{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
</div>

      <!-- 添加/编辑库存项对话框 -->
      <el-dialog v-model="showAddItemDialog" :title="currentItem.id ? $t('inventory.editItem') : $t('inventory.addItem')">
        <el-form :model="currentItem" ref="itemForm" :rules="formRules">
          <el-form-item :label="$t('inventory.form.name')" prop="name">
            <el-input v-model="currentItem.name" /></el-form-item>
          <el-form-item :label="$t('inventory.form.category')" prop="category">
            <el-select v-model="currentItem.category" :placeholder="$t('inventory.form.selectCategory')">
              <el-option v-for="category in categories" :key="category" :label="category" :value="category" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('inventory.form.quantity')" prop="quantity">
            <el-input v-model.number="currentItem.quantity" type="number" min="0" />
          </el-form-item>
          <el-form-item :label="$t('inventory.form.unit')" prop="unit">
            <el-input v-model="currentItem.unit" />
          </el-form-item>
          <el-form-item :label="$t('inventory.form.lowStockThreshold')" prop="lowStockThreshold">
            <el-input v-model.number="currentItem.lowStockThreshold" type="number" min="0" />
          </el-form-item>
          <el-form-item :label="$t('inventory.form.expiryDate')" prop="expiryDate">
            <el-date-picker v-model="currentItem.expiryDate" type="date" :placeholder="$t('inventory.form.selectDate')" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddItemDialog = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveItem">{{ $t('common.save') }}</el-button>
        </template>
      </el-dialog>

      <!-- 提醒区域 -->
      <div class="alerts" style="margin-top: 20px;">
        <el-alert v-if="expiredItems.length > 0" type="error" :closable="false">
          <p>{{ $t('inventory.alerts.expired', { count: expiredItems.length }) }}</p>
        </el-alert>
        <el-alert v-if="soonExpiredItems.length > 0" type="warning" :closable="false">
          <p>{{ $t('inventory.alerts.soonExpired', { count: soonExpiredItems.length }) }}</p>
        </el-alert>
        <el-alert v-if="lowStockItems.length > 0" type="info" :closable="false">
          <p>{{ $t('inventory.alerts.lowStock', { count: lowStockItems.length }) }}</p>
        </el-alert>
      </div>

      <!-- 智能建议 -->
      <el-card v-if="smartSuggestions.length > 0" :header="$t('inventory.smartSuggestions.title')" style="margin-top: 20px;">
        <ul class="suggestions-list">
          <li v-for="(suggestion, index) in smartSuggestions" :key="index">{{ suggestion }}</li>
        </ul>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus } from '@element-plus/icons-vue';
import { useInventoryStore } from '@/stores/inventory';
import { formatDate, isExpired, isSoonExpired } from '@/utils/date-utils';

// 国际化
const { t } = useI18n();

// 状态管理
const inventoryStore = useInventoryStore();
const showAddItemDialog = ref(false);
const currentItem = ref({});
const itemForm = ref(null);

// 分类列表
const categories = [
  t('inventory.categories.food'),
  t('inventory.categories.drinks'),
  t('inventory.categories.daily'),
  t('inventory.categories.cleaning'),
  t('inventory.categories.personalCare'),
  t('inventory.categories.kitchen'),
  t('inventory.categories.medicine'),
  t('inventory.categories.other')
];

// 表单规则
const formRules = {
  name: [{ required: true, message: t('inventory.validation.name.required'), trigger: 'blur' }],
  quantity: [{ required: true, message: t('inventory.validation.quantity.required'), trigger: 'blur' }],
  unit: [{ required: true, message: t('inventory.validation.unit.required'), trigger: 'blur' }]
};

// 生命周期
onMounted(() => {
  inventoryStore.fetchInventory();
});

// 计算属性
const filteredInventory = computed(() => inventoryStore.inventory);
const expiredItems = computed(() => inventoryStore.expiredItems);
const soonExpiredItems = computed(() => inventoryStore.soonExpiredItems);
const lowStockItems = computed(() => inventoryStore.lowStockItems);
const smartSuggestions = computed(() => inventoryStore.smartSuggestions);

// 方法
const editItem = (item) => {
  currentItem.value = { ...item };
  showAddItemDialog.value = true;
};

const saveItem = async () => {
  await itemForm.value.validate();
  if (currentItem.value.id) {
    await inventoryStore.updateItem(currentItem.value);
  } else {
    await inventoryStore.addItem(currentItem.value);
  }
  showAddItemDialog.value = false;
  currentItem.value = {};
};

const deleteItem = async (id) => {
  await inventoryStore.deleteItem(id);
};
</script>

<style scoped>
/* 基础样式 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.low-stock {
  color: #E6A23C;
  font-weight: bold;
}

.expired {
  color: #F56C6C;
  font-weight: bold;
}

.soon-expired {
  color: #E6A23C;
  font-weight: bold;
}

.alerts {
  margin-top: 16px;
}

.suggestions-list {
  padding-left: 20px;
}

.suggestions-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .inventory-manager {
    padding: 10px;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .el-table {
    font-size: 12px;
  }

  .el-table__header-wrapper th {
    padding: 8px 4px;
  }

  .el-table__body-wrapper td {
    padding: 10px 4px;
  }

  .el-table .cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  @media (max-width: 480px) {
    :deep(.category-column) {
      display: none;
    }

    .el-table .cell {
      max-width: 100px;
    }
  }

  .el-dialog {
    width: 90% !important;
    margin: 20px auto;
  }

  .el-form-item {
    margin-bottom: 15px;
  }

  .el-form-item__label {
    padding: 0 0 8px 0;
    line-height: 1.2;
  }

  .alerts {
    margin-top: 10px;
  }

  .el-alert {
    padding: 10px;
    font-size: 12px;
  }

  .el-alert__content {
    display: flex;
    align-items: center;
  }

  .el-alert__icon {
    margin-right: 8px;
  }

  .el-button--small {
    padding: 10px 16px;
    font-size: 14px;
    min-width: 80px;
  }

  .el-dialog__footer {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding: 15px;
  }

  @media (max-width: 480px) {
    .el-dialog__footer {
      flex-direction: column;
    }

    .el-dialog__body {
      padding: 15px 15px 5px;
    }

    .el-form-item {
      margin-bottom: 12px;
    }
  }

  .suggestions-list {
    padding-left: 15px;
  }

  .suggestions-list li {
    font-size: 12px;
    margin-bottom: 6px;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .el-input, .el-select {
    width: 100% !important;
  }
}

/* 超小屏幕适配 */
@media (max-width: 480px) {
  .el-table .el-table__column--selection,
  .el-table .el-table__column--index {
    display: none;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
