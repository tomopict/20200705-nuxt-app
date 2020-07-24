<template>
  <button class="button text-sm">
    <slot />
  </button>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({})
</script>

<style scoped>
button {
  padding: 5px 7px;
  border-radius: 30px;
  min-width: 100px;
  line-height: 1;
  height: 30px;
}
</style>
