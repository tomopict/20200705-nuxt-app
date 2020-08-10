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
    <template v-if="supported">
      <AuthenticationItems :user-name="userName"></AuthenticationItems>
    </template>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import AuthenticationItems from '@/components/molecules/AuthenticationItems.vue'

export default Vue.extend({
  components: { AuthenticationItems },
  props: {
    userName: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    supported: {
      type: Boolean,
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
