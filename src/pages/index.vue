<template>
  <div class="container">
    <CommonHeader :userName="userName" :photoUrl="photoUrl"></CommonHeader>
    <div>
      <h1 class="mb-10 mt-10">お買い物リスト</h1>

      <div>
        <BaseButton @click.native="handleSignIn">singin</BaseButton>
        <BaseButton @click.native="handleSignOut">singout</BaseButton>
      </div>

      <ToDolists id="todo-list" :lists="lists"></ToDolists>
      <div>
        <p>買うものを以下のボックスに記入してください</p>
        <input
          v-model="purchasePlanText"
          class="border-gray-100 p-3"
          type="text"
          placeholder="買うもの"
        />
        <BaseButton
          @click.native="handleAddShoppingList"
          :style="{
            background: '##7BE07D',
          }"
          >追加</BaseButton
        >
      </div>
    </div>
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
  id: Number
}
const PLACE_HOLDER_IMAGE_URL = '/assets/img/placeholder.png'

export default Vue.extend({
  components: { ToDolists, CommonHeader, BaseButton },
  data() {
    return {
      purchasePlanText: '',
      lists: [],
      userName: '名無し',
      photoUrl: PLACE_HOLDER_IMAGE_URL,
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

          const formatedList = {} as FormatedList
          formatedList.title = change.doc.data().title
          formatedList.name = change.doc.data().name
          formatedList.writeTime = this.$dayjs(
            change.doc.data().timestamp.seconds * 1000
          ).format('YYYY/MM/DD')
          formatedList.display = change.doc.data().display
          formatedList.id = change.doc.data().id

          if (change.type === 'added') {
            // @ts-ignore
            this.lists.push(formatedList)
            console.log('Add: ', change.doc.data())
          } else if (change.type === 'modified') {
            // @ts-ignore
            this.lists.push(formatedList)
            console.log('Modified city: ', change.doc.data())
          } else if (change.type === 'removed') {
            // @ts-ignore
            console.log('Removed city: ', change.doc.data())
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
      this.$firebase.auth().signOut()
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
        })
        .catch((error) => {
          console.log('catch')
          const errorCode = error.code
          const errorMessage = error.message
          const email = error.email
          const credential = error.credential
          console.error(errorCode, errorMessage, email, credential)
        })
    },
    handleAddToFirebase(purchasePlanText: string) {
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
          db.collection('shoppinglist')
            .doc(docRef.id)
            .update({
              id: docRef.id,
            })
            .then(() => {
              console.log('Document updated with ID: ', docRef.id)
            })
            .catch((error) => {
              console.error('Error update document: ', error)
            })
        })
        .catch((error) => {
          console.error('Error adding document: ', error)
        })
    },
  },
})
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
}
</style>
