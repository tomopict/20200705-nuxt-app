<template>
  <div class="container">
    <CommonHeader :userName="userName" :photoUrl="photoUrl">
      <div>
        <BaseButton
          v-if="!isLogin"
          @click.native="handleSignIn"
          :class="'bg-white text-gray-600 text-xs'"
          >ログイン</BaseButton
        >
        <BaseButton
          v-else
          @click.native="handleSignOut"
          :class="'bg-white text-gray-600 text-xs'"
          >ログアウト</BaseButton
        >
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
          placeholder="買うもの"
        />
        <BaseButton
          @click.native="handleAddShoppingList"
          :style="{
            color: 'white',
            height: '30px',
          }"
          class="bg-green-700"
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
  lists: any
  userName: String
  photoUrl: String
  isLogin: Boolean
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
    }
  },
  computed: {},
  mounted() {
    this.$firebase.auth().onAuthStateChanged(() => {
      console.log('onAuthStateChanged')
    })
    this.$firestore
      .collection('shoppinglist')
      .where('display', '==', true)
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const source = change.doc.metadata.hasPendingWrites
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
            // @ts-ignore
            this.lists.push(formatedList)
            console.log('Add Lists: ', change.doc.data())
          }
          if (change.type === 'modified') {
            // @ts-ignore
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
          id: '',
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
    font-weight: bold;
  }
}
.input-text {
  width: calc(100% - 100px - #{$fixed-button-mr});
  height: 30px;
  margin-right: $fixed-button-mr;
}
</style>
