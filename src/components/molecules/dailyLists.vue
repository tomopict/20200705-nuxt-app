<template>
  <div class="border p-2 mb-5">
    <p>いつもの</p>
    <ul class="daily-lists">
      <li v-for="list in dailyLists" :key="list.value">
        <label class="switch">
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
        </label>
        <span>
          {{ list.lastPurchased }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface PurchasedAt {
  nanoseconds: number
  seconds: number
}
interface DailyLists {
  label: string
  lastPurchased: string
  purchaseHistory: Array<PurchasedAt>
  status: boolean
  value: string
}

export default Vue.extend({
  props: {
    dailyLists: {
      type: Array as () => DailyLists[],
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
