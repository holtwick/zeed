import { createApp } from "vue"
import App from "./App.vue"

import { activateConsoleDebug } from "zeed"

if (import.meta.env?.MODE === "development") {
  activateConsoleDebug()
}

import "./jest"

createApp(App).mount("#app")
