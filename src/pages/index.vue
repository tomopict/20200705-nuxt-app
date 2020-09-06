<template>
  <div class="container">
    <Header
      :user-name="userName"
      :photo-url="photoUrl"
      :supported="isMessagingApiSupported"
      :is-login="isLogin"
      @handleSignIn="handleSignIn"
      @handleSignOut="handleSignOut"
    ></Header>
    <main class="p-2">
      <DailyList :dailynecessaries-list="dailynecessariesList" />
      <ToDolist
        id="todo-list"
        :lists="shoppingLists"
        @delete-item="handleDeleteItem"
      ></ToDolist>

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
          :style="{
            color: 'white',
            height: '40px',
          }"
          class="bg-green-500"
          @click.native="handleAddShoppingList"
        >
          追加
        </BaseButton>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Header from '@/components/organisms/Header.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ToDolist from '@/components/molecules/TodoList.vue'
import DailyList from '@/components/molecules/DailyList.vue'

import { DailynecessariesList, FormatedList } from '@/types/struct'
import { dateToStringJa } from '@/utils/filters'

interface DataType {
  purchasePlanText: string
  lists: FormatedList[]
  shoppingLists: FormatedList[]
  userName: string
  photoUrl: string
  isLogin: boolean
  isMessagingApiSupported: boolean
}

type Result = {
  shoppingLists: FormatedList[]
  dailynecessariesList: firebase.firestore.DocumentData
}

const PLACE_HOLDER_IMAGE_URL = '/placeholder.png'

export default Vue.extend({
  components: {
    ToDolist,
    Header,
    BaseButton,
    DailyList,
  },
  async asyncData({ app }): Promise<Result> {
    const shoppingRef = app.$firestore.collection('shoppinglist')
    const dailynecessariesRef = app.$firestore.collection('dailynecessaries')
    const [shoppingSnapshot, dailynecessariesSnapshot] = await Promise.all([
      shoppingRef.orderBy('createdAt').where('display', '==', true).get(),
      dailynecessariesRef.get(),
    ])

    const shoppingLists = shoppingSnapshot.docs.map((doc) => {
      const formatedList: FormatedList = {
        title: doc.data().title,
        name: doc.data().name,
        createdAt: app
          .$dayjs(dateToStringJa(doc.data().createdAt.toDate()))
          .format('YYYY/MM/DD HH:mm'),
        display: doc.data().display,
        id: doc.id,
      }
      return formatedList
    })

    const dailynecessariesList: DailynecessariesList[] = dailynecessariesSnapshot.docs.map(
      (doc) => {
        const LastPurchased: string = app
          .$dayjs(
            dateToStringJa(doc.data().purchaseHistory.slice(-1)[0].toDate())
          )
          .format('YY/MM/DD')

        const formatedList: DailynecessariesList = {
          label: doc.data().label,
          lastPurchased: LastPurchased,
          purchaseHistory: doc.data().purchaseHistory,
          status: doc.data().status,
          value: doc.data().value,
        }
        return formatedList
      }
    )

    return {
      shoppingLists,
      dailynecessariesList,
    }
  },
  data(): DataType {
    return {
      purchasePlanText: '',
      lists: [],
      shoppingLists: [],
      userName: '名無し',
      photoUrl: PLACE_HOLDER_IMAGE_URL,
      isLogin: false,
      isMessagingApiSupported: false,
    }
  },
  mounted() {
    // this.$firebase.auth().onAuthStateChanged(() => {
    //   console.log('onAuthStateChanged')
    // })

    if (this.$firebase.messaging.isSupported()) {
      const messaging = this.$firebase.messaging()
      messaging.onMessage((payload: any) => {
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
      data.createdAt = this.$dayjs().format('YYYY/MM/DD HH:mm')
      this.shoppingLists.push(data)
    },
    handleDeleteItem(docid: string) {
      const newList = this.shoppingLists.filter((list: FormatedList) => {
        return list.id !== docid
      })
      this.shoppingLists = newList
      console.log('handleDeleteItem', event)
    },
    handleAddShoppingList(): void {
      if (!this.purchasePlanText) return
      this.handleAddToFirebase(this.purchasePlanText)
      this.purchasePlanText = ''
    },
    handleSignOut(): void {
      this.isLogin = false
      this.$firebase.auth().signOut()
      this.userName = '名無し'
      this.photoUrl = PLACE_HOLDER_IMAGE_URL
      this.isLogin = false
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
        console.error(error)
      }
    },
    async handleAddToFirebase(purchasePlanText: string): Promise<void> {
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
