<template>
  <div class="border p-2 mb-5">
    <p>いつもの</p>
    <ul class="daily-lists">
      <li v-for="list in dailyLists" :key="list.value">
        <label class="switch">
          <input
            type="checkbox"
            v-model="list.status"
            @change="handleChangeDailyItemStatus(list.value, list.status)"
          />
          {{ list.label }}
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    dailyLists: {
      type: Array,
      required: false,
    },
  },
  methods: {
    async handleChangeDailyItemStatus(
      value: string,
      status: boolean
    ): Promise<void> {
      const db = await this.$firebase.firestore().collection('dailynecessaries')
      const data = {
        status,
      }
      try {
        db.doc(value).update(data)
        console.log('Update success dailynecessaries')
      } catch (err) {
        console.log('Update error dailynecessaries', err)
      } finally {
        console.log('Done dailynecessaries')
      }
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
