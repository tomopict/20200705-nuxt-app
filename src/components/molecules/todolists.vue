<template>
  <ul>
    <li v-for="list in lists" :key="list.id" :class="list.id" class="mb-3">
      記入者：{{ list.name }} 内容；{{ list.title }} 日時：{{ list.writeTime }}
      <BaseButton @click.native="handleDeletePurchaseData(list.id)"
        >削除する</BaseButton
      >
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
  methods: {
    handleDeletePurchaseData(id: string): void {
      const db = this.$firebase.firestore()
      db.collection('shoppinglist')
        .doc(id)
        .delete()
        .then(() => {
          console.log('delete success', id)
        })
        .catch((error) => {
          console.log('delete error', error)
        })
      console.log('handleDeletePurchaseData')
    },
  },
})
</script>

<style scoped>
li {
  background-color: #fff;
}
</style>
