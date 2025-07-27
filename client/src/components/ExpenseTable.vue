<!-- ExpenseTable.vue -->
<template>
  <div class="table-container">
    <table class="expense-table">
      <thead>
        <tr>
          <th @click="$emit('sort', 'time')" class="sortable">
            {{ $t('expense.date') }}
            <span v-if="sortField === 'time'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="$emit('sort', 'type')" class="sortable">
            {{ $t('expense.type') }}
            <span v-if="sortField === 'type'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th @click="$emit('sort', 'amount')" class="sortable">
            {{ $t('expense.amount') }}
            <span v-if="sortField === 'amount'" class="sort-indicator">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
          <th>{{ $t('expense.remark') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.id">
          <td>{{ formatDate(expense.time) }}</td>
          <td>
            <span class="type-tag" :style="{ backgroundColor: getTypeColor(expense.type) }">
              {{ expense.type }}
            </span>
          </td>
          <td class="amount-cell">¥{{ expense.amount.toFixed(2) }}</td>
          <td>{{ expense.remark || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div v-if="expenses.length === 0" class="no-data">
      <div class="no-data-icon">

      </div>
      <h3>{{ $t('expense.noDataTitle') }}</h3>
      <p>{{ $t('expense.noDataMessage') }}</p>
    </div>
  </div>
</template>

<script>
import { getTypeColor } from '../utils/expenseUtils';

export default {
  props: {
    expenses: Array,
    sortField: String,
    sortOrder: String
  },

  setup () {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      getTypeColor,
      formatDate
    };
  }
};
</script>

<style scoped>
.table-container {
  background: transparent;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.expense-table th {
  background-color: #4361ee;
  color: white;
  text-align: left;
  padding: 12px 15px;
  font-weight: 600;
}

.expense-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #e9ecef;
}

.expense-table tr:hover {
  background-color: rgba(67, 97, 238, 0.03);
}

.sortable {
  cursor: pointer;
  position: relative;
  user-select: none;
}

.sort-indicator {
  position: absolute;
  right: 5px;
}

.type-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.amount-cell {
  font-weight: 600;
  color: #2b2d42;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
}

.no-data-icon {
  font-size: 48px;
  color: #e9ecef;
  margin-bottom: 15px;
}

.no-data h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #6c757d;
}

.no-data p {
  color: #6c757d;
  max-width: 500px;
  margin: 0 auto;
}
</style>
