<template>
  <ul>
    <li v-for="(list, index) in lists" :key="index">
      記入者：{{ list.name }} 内容；{{ list.title }} 日時：{{ list.writeTime }}
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    lists: {
      type: Object,
      required: false,
    },
  },
})
</script>

<style scoped>
li {
  background-color: #fff;
}
</style>
