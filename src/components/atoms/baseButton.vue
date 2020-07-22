<template>
  <button class="button">
    <slot />
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>

<style scoped>
button {
  padding: 10px;
  border: 1px solid #000;
  border-radius: 5px;
}
</style>
