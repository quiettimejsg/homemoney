<template>
  <div class="inventory-view">
    <Header :title="$t('inventory.title')" />
    <InventoryManager />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
import InventoryManager from '@/components/InventoryManager.vue';
const Header = defineAsyncComponent(() => import('@/components/Header.vue'));
</script>

<style scoped>
.inventory-view {
  padding: 20px;
}
</style>
