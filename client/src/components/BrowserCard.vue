<template>
    <a :href="href" target="_blank" class="browser-card">
      <div class="icon-wrapper" :class="`icon-${icon}`">
      </div>
      <h3>{{ name }}</h3>
      <p class="version">v{{ minVersion }}</p>
    </a>
  </template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  name: String,
  minVersion: String,
  href: String
});

</script>

  <style scoped>
  .browser-card {
    display: block;
    padding: 1.5rem 1rem;
    border-radius: 10px;
    border: 1px solid #eee;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
  }

  .browser-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    border-color: #ddd;
  }

  h3 {
    margin: 0.5rem 0;
    font-size: 1.2rem;
  }

  .version {
    color: #5f6368;
    font-size: 0.95rem;
    margin: 0;
  }
  </style>
