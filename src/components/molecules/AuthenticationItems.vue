<template>
  <div class="ml-2">
    <BaseButton
      v-if="!textInstanceIdToken"
      :class="'text-xs border-gray-600 border'"
      @click.native="handleIntializedMessaging"
    >
      認証
    </BaseButton>
    <BaseButton
      v-else
      :class="'text-xs border-gray-600 border'"
      @click.native="handleDeleteToken"
    >
      認証解消
    </BaseButton>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    userName: String,
  },
  data(): {
    textInstanceIdToken: String
  } {
    return {
      textInstanceIdToken: '',
    }
  },
  methods: {
    handleIntializedMessaging() {
      const messaging = this.$firebase.messaging()
      // @ts-ignore
      if (!messaging.vapidKey) {
        messaging.usePublicVapidKey(process.env.FIREBASE_PUBLIC_VAPID_KEY || '')
      }
      this.requestPermission(messaging)
    },
    async requestPermission(messaging: firebase.messaging.Messaging) {
      try {
        await messaging.requestPermission()
        messaging
          .getToken()
          .then(async (token: String) => {
            this.textInstanceIdToken = token

            const db = await this.$firebase.firestore().collection('users')
            try {
              db.doc(this.userName.toString()).set({
                fcmToken: token,
                name: this.userName,
              })
              console.log('Document successfully written!')
            } catch (err) {
              console.error('Error adding document: ', err)
            }
          })
          .catch((err: any) => {
            this.textInstanceIdToken =
              'トークンの取得に失敗しました（' + err + '）。'
          })
      } catch (err) {
        this.textInstanceIdToken =
          '通知の許可が得られませんでした（' + err + '）。'
      }
    },
    handleDeleteToken() {
      const messaging = this.$firebase.messaging()
      messaging
        .getToken()
        .then((currentToken: string) => {
          messaging
            .deleteToken(currentToken)
            .then(() => {
              console.log('tokenを削除')
              this.textInstanceIdToken = ''
            })
            .catch((err: any) => {
              this.textInstanceIdToken =
                'トークンの取得に失敗しました（' + err + '）。'
            })
        })
        .catch((err: any) => {
          this.textInstanceIdToken =
            'トークンの取得に失敗しました（' + err + '）。'
        })
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
