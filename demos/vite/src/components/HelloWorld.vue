<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Logger } from '../../../../src/index.browser'
// import { Logger } from 'zeed'

const log = Logger('hello')

log('hello world')

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: {
      type: String,
      required: true,
    },
  },
  setup: () => {
    const count = ref(0)
    const useScriptSetup = ref(false)
    const useTsPlugin = ref(false)
    return { count, useScriptSetup, useTsPlugin }
  },
})
</script>

<template>
  <p>In the console please type</p>
  <p><code>localStorage.zeed = '*'</code></p>
  <p>and reload, to see the logging.</p>
</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
