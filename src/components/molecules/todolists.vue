<template>
  <ul>
    <li
      v-for="list in lists"
      :key="list.id"
      :class="list.id"
      class="listitem flex mb-1 pb-1"
    >
      <button
        type="p"
        role="checkbox"
        aria-checked="false"
        class="mr-2 text-sm underline"
        @click="handleDeletePurchaseData(list.id)"
      >
        購入
      </button>
      <div class="flex-1">
        <p class="w-100 text-lg font-semibold">{{ list.title }}</p>
        <p class="flex justify-between text-xs">
          <span class="text-red-300">{{ list.createdAt }}</span>
          <span class="text-gray-400">{{ list.name }}</span>
        </p>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    lists: {
      type: Array,
      required: false,
    },
  },
  data(): {
    isLogin: boolean
  } {
    return {
      isLogin: false,
    }
  },
  methods: {
    async handleDeletePurchaseData(id: string): Promise<void> {
      const db = await this.$firebase.firestore().collection('shoppinglist')
      db.doc(id)
        .delete()
        .then(() => {
          console.log('delete success', id)
          this.$emit('delete-item', id)
        })
        .catch((error) => {
          console.log('delete error', error)
        })
      console.log('handleDeletePurchaseData')
    },
  },
})
</script>

<style scoped lang="scss">
.listitem {
  &:not(:last-child) {
    border-bottom: 1px solid;
    @apply border-gray-300;
  }
}
li {
  background-color: #fff;
}
</style>
