<template>
  <div class="container">
    <CommonHeader :userName="userName" :photoUrl="photoUrl">
      <div>
        <BaseButton
          v-if="!isLogin"
          @click.native="handleSignIn"
          :class="'text-xs border-gray-600 border'"
          >ログイン</BaseButton
        >
        <BaseButton
          v-else
          @click.native="handleSignOut"
          :class="'text-xs border-gray-600 border'"
          >ログアウト</BaseButton
        >
        <template v-if="isMessagingApiSupported">
          <BaseButton
            v-if="!textInstanceIdToken"
            @click.native="handleIntializedMessaging"
            :class="'text-xs border-gray-600 border'"
            >認証</BaseButton
          >
          <BaseButton
            v-else
            @click.native="handleDeleteToken"
            :class="'text-xs border-gray-600 border'"
            >認証解消</BaseButton
          >
        </template>
      </div>
    </CommonHeader>
    <main class="p-2">
      <DailyLists :dailyLists="dailynecessariesLists"></DailyLists>
      <ToDolists
        id="todo-list"
        :lists="shoppingLists"
        @delete-item="handleDeleteItem"
      ></ToDolists>

      <div
        class="fixed bottom-0 left-0 w-full p-2 bg-gray-300 flex items-center"
      >
        <input
          v-model="purchasePlanText"
          class="input-text p-1 border-gray-700 border-radius"
          type="text"
          placeholder="買いたいものを入れてよ"
        />
        <BaseButton
          @click.native="handleAddShoppingList"
          :style="{
            color: 'white',
            height: '40px',
          }"
          class="bg-green-500"
          >追加</BaseButton
        >
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CommonHeader from '@/components/organisms/commonHeader.vue'
import BaseButton from '@/components/atoms/baseButton.vue'
import ToDolists from '@/components/molecules/todolists.vue'
import DailyLists from '@/components/molecules/dailyLists.vue'

interface FormatedList {
  title: String
  name: String
  createdAt: String | firebase.firestore.FieldValue
  display: Boolean
  id?: String
}

interface DataType {
  purchasePlanText: String
  lists: FormatedList[]
  shoppingLists: FormatedList[]
  dailyLists: any
  userName: String
  photoUrl: String
  isLogin: Boolean
  isMessagingApiSupported: Boolean
  textInstanceIdToken: String
}

type Result = {
  shoppingLists: FormatedList[]
  dailynecessariesLists: firebase.firestore.DocumentData
}

const PLACE_HOLDER_IMAGE_URL = '/placeholder.png'

export default Vue.extend({
  components: { ToDolists, CommonHeader, BaseButton, DailyLists },
  data(): DataType {
    return {
      purchasePlanText: '',
      lists: [],
      shoppingLists: [],
      dailyLists: [],
      userName: '名無し',
      photoUrl: PLACE_HOLDER_IMAGE_URL,
      isLogin: false,
      isMessagingApiSupported: false,
      textInstanceIdToken: '',
    }
  },
  async asyncData({ app }): Promise<Result> {
    const shoppingRef = app.$firestore.collection('shoppinglist')
    const dailynecessariesRef = app.$firestore.collection('dailynecessaries')
    const [shoppingSnapshot, dailynecessariesSnapshot] = await Promise.all([
      shoppingRef.where('display', '==', true).get(),
      dailynecessariesRef.get(),
    ])

    /** TODO
     * orderbyするためにindexをはる
     * https://ginpen.com/2019/06/01/firestore-indexes-json/
     */

    const shoppingLists = shoppingSnapshot.docs.map((doc) => {
      const formatedList: FormatedList = {
        title: doc.data().title,
        name: doc.data().name,
        createdAt: app
          .$dayjs(doc.data().createdAt.seconds * 1000)
          .format('YYYY/MM/DD/ hh:mm'),
        display: doc.data().display,
        id: doc.id,
      }
      return formatedList
    })

    const dailynecessariesLists = dailynecessariesSnapshot.docs.map((doc) => {
      return doc.data()
    })

    return {
      shoppingLists,
      dailynecessariesLists,
    }
  },
  mounted() {
    // this.$firebase.auth().onAuthStateChanged(() => {
    //   console.log('onAuthStateChanged')
    // })

    if (this.$firebase.messaging.isSupported()) {
      const messaging = this.$firebase.messaging()
      messaging.onMessage((payload) => {
        console.log('Message received. ', payload)
      })
      this.isMessagingApiSupported = true
      // messaging.onTokenRefresh(() => {
      //   messaging.getToken().then((refreshedToken) => {
      //     console.log('refreshedToken', refreshedToken)
      //   })
      // })
    }
  },
  methods: {
    handleAddItem(data: FormatedList) {
      data.createdAt = this.$dayjs().format('YYYY/MM/DD hh:mm')
      this.shoppingLists.push(data)
    },
    handleDeleteItem(docid: string) {
      const newList = this.shoppingLists.filter((list: FormatedList) => {
        return list.id !== docid
      })
      this.shoppingLists = newList
      console.log('handleDeleteItem', event)
    },
    handleAddShoppingList() {
      if (!this.purchasePlanText) return
      this.handleAddToFirebase(this.purchasePlanText)
      this.purchasePlanText = ''
    },
    handleSignOut() {
      this.isLogin = false
      this.$firebase.auth().signOut()
      this.userName = '名無し'
      this.photoUrl = PLACE_HOLDER_IMAGE_URL
      this.isLogin = false
      console.log('signout')
    },
    async handleSignIn(): Promise<void> {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      try {
        await this.$firebase.auth().signInWithPopup(provider)
        this.userName = this.$auth.currentUser.displayName || ''
        this.photoUrl =
          this.$auth.currentUser.photoURL || PLACE_HOLDER_IMAGE_URL
        this.isLogin = true
      } catch (error) {
        const errorCode = error.code
        const errorMessage = error.message
        const email = error.email
        const credential = error.credential
        console.error(errorCode, errorMessage, email, credential)
      } finally {
      }
    },
    async handleAddToFirebase(purchasePlanText: String): Promise<void> {
      try {
        const data: FormatedList = {
          name: this.userName,
          title: purchasePlanText,
          createdAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
          display: true,
        }
        const result = await this.$firebase
          .firestore()
          .collection('shoppinglist')
          .add(data)
        console.log('Document added with ID: ', result)
        data.id = result.id
        this.handleAddItem(data)
      } catch (e) {
        console.error('Error adding document: ', e)
      }
    },
    handleIntializedMessaging() {
      const messaging = this.$firebase.messaging()
      // @ts-ignore
      if (!messaging.vapidKey) {
        messaging.usePublicVapidKey(process.env.FIREBASE_PUBLIC_VAPID_KEY || '')
      }
      this.requestPermission(messaging)
    },
    requestPermission(messaging: firebase.messaging.Messaging) {
      messaging
        .requestPermission()
        .then(() => {
          messaging
            .getToken()
            .then((token: String) => {
              this.textInstanceIdToken = token

              const db = this.$firebase.firestore()
              db.collection('users')
                .doc(this.userName.toString())
                .set({
                  fcmToken: token,
                  name: this.userName,
                })
                .then(() => {
                  console.log('Document successfully written!')
                })
                .catch((error) => {
                  console.error('Error adding document: ', error)
                })
            })
            .catch((err: any) => {
              this.textInstanceIdToken =
                'トークンの取得に失敗しました（' + err + '）。'
            })
        })
        .catch((err: any) => {
          this.textInstanceIdToken =
            '通知の許可が得られませんでした（' + err + '）。'
        })
    },
    handleDeleteToken() {
      const messaging = this.$firebase.messaging()
      messaging
        .getToken()
        .then((currentToken) => {
          messaging
            .deleteToken(currentToken)
            .then(() => {
              console.log('tokenを削除')
              this.textInstanceIdToken = ''
            })
            .catch((err) => {
              this.textInstanceIdToken =
                'トークンの取得に失敗しました（' + err + '）。'
            })
        })
        .catch((err) => {
          this.textInstanceIdToken =
            'トークンの取得に失敗しました（' + err + '）。'
        })
    },
  },
})
</script>

<style lang="scss">
$fixed-button-mr: 10px;

/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  max-width: none;
  margin: 0 auto;
}

.main {
  &-title {
    font-size: 1.2rem;
  }
}
.input-text {
  width: calc(100% - 100px - #{$fixed-button-mr});
  height: 40px;
  margin-right: $fixed-button-mr;
}
</style>
