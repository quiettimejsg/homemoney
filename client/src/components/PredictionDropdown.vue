<template>
  <div class="prediction-container">
    <div v-if="predictions.length > 0" class="prediction-list">
      <h4>{{ TextConfig.prediction.title }}</h4>
      <div
        v-for="(prediction, index) in predictions"
        :key="index"
        class="prediction-item"
        @click="selectPrediction(prediction)"
      >
        <span class="type-tag">{{ prediction.type }}</span>
        {{ prediction.remark }} (最近使用{{ prediction.count }}次)
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    predictions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectPrediction (prediction) {
      this.$emit('select', prediction);
    }
  }
};
</script>

<style scoped>
.prediction-container {
  margin: 1rem 0;
}
.prediction-list {
  border: 1px solid #eee;
  padding: 0.5rem;
  border-radius: 4px;
}
.prediction-item {
  padding: 0.5rem;
  cursor: pointer;
  transition: background 0.3s;
}
.prediction-item:hover {
  background: #f5f5f5;
}
.type-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #e1f5fe;
  border-radius: 4px;
  margin-right: 8px;
}
</style>
