<template>
  <div class="container">
    <CommonHeader :userName="userName" :photoUrl="'aaa'"></CommonHeader>
    <div>
      <div>
        <input
          v-model="inputText"
          class="border-gray-100 p-3"
          type="text"
          placeholder="買うもの"
          @keydown.enter="handleAddToDoList"
        />
      </div>
      <p @click="handleSignIn">singin</p>
      <p @click="handleSignOut">singout</p>
      <ToDolists id="todo-list" :lists="lists"></ToDolists>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import CommonHeader from '@/components/molecules/commonHeader.vue'
import ToDolists from '@/components/molecules/todolists.vue'

export default Vue.extend({
  components: { ToDolists, CommonHeader },
  data() {
    return {
      text: 'tes',
      inputText: 'aaa',
      lists: [],
      userName: '',
    }
  },
  mounted() {
    console.log(process.env.FIREBASE_PROJECT_ID)
    console.log(process.env.FIREBASE_APP_ID)
  },
  methods: {
    handleAddToDoList() {
      if (!this.inputText) return
      console.log(this.inputText)

      this.lists.push(this.inputText)
      this.handleAddToFirebase(this.inputText)
      this.inputText = ''
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
          this.userName = this.$auth.currentUser.displayName || '名無し'
        })
        .catch(function (error) {
          console.log('catch')
          const errorCode = error.code
          const errorMessage = error.message
          const email = error.email
          const credential = error.credential
          console.error(errorCode, errorMessage, email, credential)
        })

      this.$firebase.auth().onAuthStateChanged(() => {
        console.log('onAuthStateChanged')
      })
    },
    handleAddToFirebase(addtodotext: string) {
      const db = this.$firebase.firestore()
      db.collection('todo')
        .add({
          title: addtodotext,
        })
        .then(function (docRef) {
          console.log('Document written with ID: ', docRef.id)
        })
        .catch(function (error) {
          console.error('Error adding document: ', error)
        })
    },
  },
  computed: {},
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
