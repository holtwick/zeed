import { createApp } from 'vue'
// import { Logger } from 'zeed'
import { Logger } from '../../../src/index.browser'
import App from './App.vue'

const log = Logger('app')
log('Hello World')

const slog = log.extend('sub')
slog('Hello from sub logger')

log.info('info')

const log2 = Logger('app2', 'info')
log2('log 2 debug')
log2.debug('log 2 debug')
log2.info('log 2 info')
log2.warn('log 2 warn')
log2.error('log 2 error')

createApp(App).mount('#app')
