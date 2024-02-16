import { ApiInjectionKey, StoreInjectionKey, store } from '@pubstudio/builder'
import { createApp, h } from 'vue'
import { rootApi } from './api'
import App from './App.vue'
import i18n from './i18n'

const app = createApp(App)

app.provide(ApiInjectionKey, rootApi)
app.provide(StoreInjectionKey, store)
app.component('router-link', h(''))

app.use(i18n)
app.mount('#app')
