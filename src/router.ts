import { createRouter, scrollTop } from '@pubstudio/builder'
import i18n from './i18n'
import NotFoundPage from './components/NotFoundPage.vue'

const { t } = i18n.global

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (to?.hash) {
      if (from?.resolvedPath === to?.resolvedPath) {
        return { el: to.hash, behavior: 'smooth' }
      }
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          // Returning `el` or `to.hash` doesn't work when the page is reloaded
          const el = document.getElementById(to.hash.slice(1))
          el?.scrollIntoView()
          resolve({})
        }, 300)
      })
    }
    if (to?.meta?.scrollAnchor) {
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
    if (to?.meta?.noScroll && from?.meta?.noScroll) {
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
  if (!to?.path.startsWith('/preview')) {
    const parent = to?.matchedParentRoutes.find((record) => record.meta?.title)
    const parentTitle = parent?.meta?.title
    document.title = to?.meta?.title || parentTitle || 'Pub Studio'
  }
})

export default router
