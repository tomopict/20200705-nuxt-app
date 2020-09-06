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
    <dir class="flex">
      <SingInUser
        :is-login="isLogin"
        :class="'mr-2'"
        @emitHeaderSignIn="emitHeaderSignIn"
        @emitHeaderSignOut="emitHeaderSignOut"
      ></SingInUser>
      <template v-if="supported">
        <AuthenticationItems :user-name="userName" />
      </template>
    </dir>
  </header>
</template>

<script lang="ts">
import Vue from 'vue'
import AuthenticationItems from '@/components/molecules/AuthenticationItems.vue'
import SingInUser from '@/components/molecules/SingInUser.vue'

export default Vue.extend({
  components: { AuthenticationItems, SingInUser },
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
    isLogin: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    emitHeaderSignIn() {
      this.$emit('handleSignIn')
    },
    emitHeaderSignOut() {
      this.$emit('handleSignOut')
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
