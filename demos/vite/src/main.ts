import { createApp } from "vue"
import App from "./App.vue"

import { activateConsoleDebug, Logger } from "zeed"

if (import.meta.env?.MODE === "development") {
  activateConsoleDebug()
}

const log = Logger("app")
log("Hello World")

let slog = log.extend("sub")
slog("Hello from sub logger")

createApp(App).mount("#app")
