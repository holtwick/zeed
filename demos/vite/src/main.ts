import './logging'

// <-- logging must be first import!

import { createApp } from 'vue'
import { Logger } from 'zeed'
import App from './App.vue'

const log = Logger('app')
log('Hello World')

const slog = log.extend('sub')
slog('Hello from sub logger')

createApp(App).mount('#app')
