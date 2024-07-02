import { scrollTop } from '@pubstudio/builder'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from './i18n'
import NotFoundPage from './components/NotFoundPage.vue'

const { t } = i18n.global

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    noScroll?: boolean
    scrollAnchor?: string
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      if (from.fullPath === to.fullPath) {
        return { el: to.hash, behavior: 'smooth' }
      }
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          // Returning `el` or `to.hash` to vue-router doesn't work when the
          // page is reloaded
          const el = document.getElementById(to.hash.slice(1))
          el?.scrollIntoView()
          resolve({})
        }, 300)
      })
    }
    if (to.meta.scrollAnchor) {
      const el = document.getElementById(to.meta.scrollAnchor)
      el?.scrollIntoView()
      return { top: 0 }
    }
    if (savedPosition) {
      if (savedPosition.top === 0) {
        scrollTop()
      }
      return savedPosition
    }
    if (to.meta.noScroll && from.meta.noScroll) {
      return {}
    }
    scrollTop()
    return { top: 0 }
  },
  routes: [
    {
      path: '/preview/:pathMatch(.*)?',
      name: 'ExamplePreview',
      component: () => import('./components/ExamplePreview.vue'),
      meta: { title: t('build.preview') },
    },
    {
      path: '/scratch',
      name: 'BuildScratch',
      component: () => import('./components/ExampleBuilder.vue'),
      meta: { title: t('build.title') },
    },
    {
      path: '/:siteId?',
      name: 'Build',
      component: () => import('./components/ExampleBuilder.vue'),
      meta: { title: t('build.title') },
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
  ],
})

router.afterEach((to, _from) => {
  // Document title will be updated using `@unhead/vue` according to the active page in Preview Page.
  if (!to.path.startsWith('/preview')) {
    const parent = to.matched.find((record) => record.meta.title)
    const parentTitle = parent ? parent.meta.title : null
    document.title = to.meta.title || parentTitle || 'Pub Studio'
  }
})

export default router
