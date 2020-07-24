<template>
  <header
    class="bg-gray-300 text-gray-600 p-2 flex justify-between items-center"
  >
    <ul class="header-lists flex items-center">
      <li class="username">{{ userName }}</li>
      <li class="userphoto">
        <img :src="photoUrl" />
      </li>
    </ul>
    <slot />
  </header>
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
header {
  align-items: center;
}
.username {
  margin-right: 10px;
}
.userphoto {
  border-radius: 30px;
  overflow: hidden;
  width: 30px;
  height: 30px;
}
</style>
