<template>
  <ul>
    <li v-for="(list, index) in lists" :key="index">{{ list }}</li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    lists: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => [],
    },
  },
})
</script>

<style scoped>
li {
  background-color: #fff;
}
</style>
