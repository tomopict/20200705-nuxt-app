<template>
  <div>
    <BaseButton
      v-if="!isLogin"
      :class="'text-xs border-gray-600 border'"
      @click.native="clickSignIn"
    >
      ログイン
    </BaseButton>
    <BaseButton
      v-else
      :class="'text-xs border-gray-600 border'"
      @click.native="clickSignOut"
    >
      ログアウト
    </BaseButton>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    isLogin: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    clickSignIn() {
      this.$emit('emitHeaderSignIn')
    },
    clickSignOut() {
      this.$emit('emitHeaderSignOut')
    },
  },
})
</script>
<style lang="scss" scoped>
.daily {
  &-lists {
    display: grid;
    grid-template-columns: 33% 33% 1fr;
  }
}
</style>
