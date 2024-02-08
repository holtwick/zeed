import { createApp } from 'vue'

// import { Logger } from 'zeed'
import { Logger, LoggerConsoleHandler, getGlobalLogger } from '../../../src/index.browser'
import App from './App.vue'

if (!localStorage.zeed) {
  getGlobalLogger().setHandlers([
    LoggerConsoleHandler({
      filter: '*',
    }),
  ])
  console.info('\n\nThis is the fallback logging. Type `on()` to activate original browser logging.\n\n')
}
else {
  console.info('\n\nThis is the browser logging. Type `off()` to activate original fallback logging.\n\n')
}

// @ts-expect-error xxx
globalThis.on = function () {
  localStorage.zeed = '*'
  location.reload()
}

// @ts-expect-error xxx
globalThis.off = function () {
  localStorage.zeed = ''
  location.reload()
}

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
