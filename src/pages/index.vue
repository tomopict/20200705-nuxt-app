<template>
  <div class="container">
    <div>
      <Logo />
      <div>
        <input
          v-model="inputText"
          class="border-gray-100 p-3"
          type="text"
          placeholder="本日やることはなんですか"
          @keydown.enter="handleAddToDoList"
        />
      </div>
      <ToDolists id="todo-list" :lists="lists"></ToDolists>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ToDolists from '@/components/molecules/todolists.vue'

export default Vue.extend({
  components: { ToDolists },
  data() {
    return {
      text: 'tes',
      inputText: 'aaa',
      lists: [],
    }
  },
  mounted() {},
  methods: {
    handleAddToDoList() {
      if (!this.inputText) return
      console.log(this.inputText)
      this.lists.push(this.inputText)
      this.inputText = ''
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
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
