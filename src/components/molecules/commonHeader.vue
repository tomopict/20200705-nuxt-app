<template>
  <ul class="header-lists bg-blue-400 p-3 flex">
    <li class="username">{{ userName }}</li>
    <li class="userphoto">
      <img :src="photoUrl" />
    </li>
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
