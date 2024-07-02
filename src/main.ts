import { ApiInjectionKey, StoreInjectionKey, store } from '@pubstudio/builder'
import { createApp, h } from 'vue'
import { rootApi } from './api'
import App from './App.vue'
import i18n from './i18n'
import router from './router'

const app = createApp(App)

app.provide(ApiInjectionKey, rootApi)
app.provide(StoreInjectionKey, store)
app.use(router).use(i18n)

app.mount('#app')
