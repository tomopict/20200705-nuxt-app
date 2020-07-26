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
      <h1 class="main-title mb-2 mt-2">お買い物リスト</h1>

      <ToDolists id="todo-list" :lists="lists"></ToDolists>

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
import CommonHeader from '@/components/molecules/commonHeader.vue'
import BaseButton from '@/components/atoms/baseButton.vue'
import ToDolists from '@/components/molecules/todolists.vue'

interface FormatedList {
  title: String
  name: String
  writeTime: String
  display: Boolean
  id: String
}

interface DataType {
  purchasePlanText: String
  lists: FormatedList[]
  userName: String
  photoUrl: String
  isLogin: Boolean
  isMessagingApiSupported: Boolean
  textInstanceIdToken: String
}

const PLACE_HOLDER_IMAGE_URL = '/placeholder.png'

export default Vue.extend({
  components: { ToDolists, CommonHeader, BaseButton },
  data(): DataType {
    return {
      purchasePlanText: '',
      lists: [],
      userName: '名無し',
      photoUrl: PLACE_HOLDER_IMAGE_URL,
      isLogin: false,
      isMessagingApiSupported: false,
      textInstanceIdToken: '',
    }
  },
  mounted() {
    this.$firebase.auth().onAuthStateChanged(() => {
      console.log('onAuthStateChanged')
    })
    this.$firestore
      .collection('shoppinglist')
      .where('display', '==', true)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const source: 'Local' | 'Server' = change.doc.metadata
            .hasPendingWrites
            ? 'Local'
            : 'Server'

          // firestoreは書き込みを実行すると、データがバックエンドに送信される前に、新しいデータがリスナーに通知されるため、Localの処理はUI上に反映しない
          // https://firebase.google.com/docs/firestore/query-data/listen?hl=ja#events-local-changes
          if (source === 'Local') return

          const formatedList: FormatedList = {
            title: change.doc.data().title,
            name: change.doc.data().name,
            writeTime: this.$dayjs(
              change.doc.data().timestamp.seconds * 1000
            ).format('YYYY/MM/DD'),
            display: change.doc.data().display,
            id: change.doc.id,
          }

          if (change.type === 'added') {
            this.lists.push(formatedList)
            console.log('Add Lists: ', change.doc.data())
          }
          if (change.type === 'modified') {
            this.lists.push(formatedList)
            console.log('Modified Lists: ', change.doc.data())
          }
          if (change.type === 'removed') {
            const newList = this.lists.filter((list: FormatedList) => {
              return list.id !== change.doc.id
            })
            this.lists = newList
            console.log('Removed Lists: ', change.doc.data())
          }
        })
      })

    if (this.$firebase.messaging.isSupported()) {
      const messaging = this.$firebase.messaging()
      messaging.onMessage((payload) => {
        console.log('Message received. ', payload)
      })
      this.isMessagingApiSupported = true
      // messaging.onTokenRefresh(function () {
      //   messaging.getToken().then(function (refreshedToken) {
      //     console.log('refreshedToken', refreshedToken)
      //   })
      // })
    }
  },
  methods: {
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
    handleSignIn() {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      this.$firebase
        .auth()
        .signInWithPopup(provider)
        .then(() => {
          this.userName = this.$auth.currentUser.displayName || ''
          this.photoUrl =
            this.$auth.currentUser.photoURL || PLACE_HOLDER_IMAGE_URL
          this.isLogin = true
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
          const email = error.email
          const credential = error.credential
          console.error(errorCode, errorMessage, email, credential)
        })
    },
    handleAddToFirebase(purchasePlanText: String) {
      const db = this.$firebase.firestore()
      db.collection('shoppinglist')
        .add({
          name: this.userName,
          title: purchasePlanText,
          timestamp: this.$firebase.firestore.FieldValue.serverTimestamp(),
          display: true,
        })
        .then((docRef) => {
          console.log('Document added with ID: ', docRef.id)
        })
        .catch((error) => {
          console.error('Error adding document: ', error)
        })
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
