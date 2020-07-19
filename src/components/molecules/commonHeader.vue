<template>
  <ul class="header-lists bg-blue-400 p-3 flex">
    <li class="p-1">{{ userName }}</li>
    <li class="p-1">{{ photoUrl }}</li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    userName: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
  },
})
</script>
<style lang="scss" scoped>
.header-lists {
  color: white;
  justify-content: flex-end;
}
</style>
