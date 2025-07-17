import { defineStore } from 'pinia';
import i18n from '@/locales';

// 日期工具函数
const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry <= today;
};

const isSoonExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return expiry >= today && expiry <= oneWeekLater;
};

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventory: [],
    loading: false,
    error: null
  }),

  getters: {
    // 已过期商品
    expiredItems (state) {
      return state.inventory.filter(item => isExpired(item.expiryDate));
    },

    // 即将过期商品（7天内）
    soonExpiredItems (state) {
      return state.inventory.filter(item => isSoonExpired(item.expiryDate));
    },

    // 低库存商品
    lowStockItems (state) {
      return state.inventory.filter(item => item.quantity <= item.lowStockThreshold);
    },

    // 智能建议
    smartSuggestions (state) {
      const suggestions = [];

      // 过期商品处理建议
      if (this.expiredItems.length > 0) {
        suggestions.push(i18n.global.t('inventory.suggestions.expired', { count: this.expiredItems.length }));
      }

      // 即将过期商品建议
      if (this.soonExpiredItems.length > 0) {
        const separator = i18n.global.t('common.listSeparator');
        const soonExpiredNames = this.soonExpiredItems.map(item => item.name).join(separator);
        suggestions.push(i18n.global.t('inventory.suggestions.soonExpired', { names: soonExpiredNames }));
      }

      // 低库存商品建议
      if (this.lowStockItems.length > 0) {
        const separator = i18n.global.t('common.listSeparator');
        const lowStockNames = this.lowStockItems.map(item => item.name).join(separator);
        suggestions.push(i18n.global.t('inventory.suggestions.lowStock', { names: lowStockNames }));
      }

      // 最常出现的商品分类建议
      if (state.inventory.length > 0) {
        const categories = state.inventory.map(item => (item.category || '').toLowerCase());
        const categoryCounts = {};
        categories.forEach(category => {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        const mostFrequentCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
        if (mostFrequentCategory && mostFrequentCategory[1] > 0) {
          suggestions.push(i18n.global.t('inventory.suggestions.mostFrequentCategory', {
            category: i18n.global.t(`inventory.categories.${mostFrequentCategory[0]}`),
            count: mostFrequentCategory[1]
          }));
        }
      }

      // 库存优化建议
      if (state.inventory.length > 0 && this.expiredItems.length === 0 && this.soonExpiredItems.length === 0 && this.lowStockItems.length === 0) {
        suggestions.push(i18n.global.t('inventory.suggestions.optimized'));
      }
      return suggestions;
    }
  },

  actions: {
    // 获取库存数据
    async fetchInventory () {
      this.loading = true;
      try {
        const response = await fetch('/api/inventory');
        if (!response.ok) throw new Error('Failed to fetch inventory');
        this.inventory = await response.json();
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error fetching inventory:', err);
      } finally {
        this.loading = false;
      }
    },

    // 添加库存项
    async addItem (item) {
      try {
        const newItem = {
          ...item,
          id: Date.now().toString(), // 生成临时ID
          createdAt: new Date().toISOString()
        };

        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });

        if (!response.ok) throw new Error('Failed to add inventory item');
        const savedItem = await response.json();
        this.inventory.push(savedItem);
        return savedItem;
      } catch (err) {
        this.error = err.message;
        console.error('Error adding inventory item:', err);
        throw err;
      }
    },

    // 更新库存项
    async updateItem (updatedItem) {
      try {
        const response = await fetch(`/api/inventory/${updatedItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItem)
        });

        if (!response.ok) throw new Error('Failed to update inventory item');
        const savedItem = await response.json();
        const index = this.inventory.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          this.inventory[index] = savedItem;
        }
        return savedItem;
      } catch (err) {
        this.error = err.message;
        console.error('Error updating inventory item:', err);
        throw err;
      }
    },

    // 删除库存项
    async deleteItem (id) {
      try {
        const response = await fetch(`/api/inventory/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete inventory item');
        this.inventory = this.inventory.filter(item => item.id !== id);
      } catch (err) {
        this.error = err.message;
        console.error('Error deleting inventory item:', err);
        throw err;
      }
    }
  }
});
