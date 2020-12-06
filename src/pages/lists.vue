<template>
  <div>pricess</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data(): any {
    return {
      prices: [],
      items: [],
    }
  },
  async mounted() {
    const museums = await this.$firestore.collectionGroup('prices').get()

    console.log(...museums.docs)

    const snapShot = await this.$firestore.collection('items').get()

    snapShot.forEach((doc: any) => {
      this.items.push(doc.id)
    })
    museums.forEach((doc: any) => {
      this.prices.push(doc.data())
    })
  },
})
</script>
