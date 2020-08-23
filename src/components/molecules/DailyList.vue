<template>
  <div class="border p-2 mb-5">
    <ul class="daily-lists">
      <li v-for="list in dailynecessariesList" :key="list.value">
        <label class="switch block w-full text-sm">
          <input
            v-model="list.status"
            type="checkbox"
            @change="
              handleChangeDailyItemStatus(
                list.value,
                list.status,
                list.purchaseHistory
              )
            "
          />
          {{ list.label }}
          <span class="text-xs block text-gray-400">
            {{ list.lastPurchased }}
          </span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { DailynecessariesList } from '@/types/struct'

export default Vue.extend({
  props: {
    dailynecessariesList: {
      type: Array as () => DailynecessariesList[],
      required: false,
    },
  },
  methods: {
    async handleChangeDailyItemStatus(
      value: string,
      status: boolean,
      purchaseHistory: Array<firebase.firestore.Timestamp>
    ): Promise<void> {
      const db = await this.$firebase.firestore().collection('dailynecessaries')

      const purchasedAtConvertToTimestamp = purchaseHistory.map(
        (p: firebase.firestore.Timestamp) => {
          return this.$firebase.firestore.Timestamp.fromDate(
            new Date(p.seconds * 1000)
          )
        }
      )

      /*
       ** statusがtrueの場合は購入希望になるので購入履歴には入れない
       */
      if (!status) {
        purchasedAtConvertToTimestamp.push(
          this.$firebase.firestore.Timestamp.now()
        )
      }

      const data = {
        status,
        purchaseHistory: purchasedAtConvertToTimestamp,
      }
      console.log(value, data)
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
    grid-template-columns: 20% 20% 20% 20% 20%;
    row-gap: 5px;
  }
}
</style>
