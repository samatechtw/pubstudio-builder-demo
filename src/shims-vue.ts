declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line
  const component: DefineComponent<{}, {}, any>
  export default component
}

// eslint-disable-next-line
interface ImportMeta {
  env: Record<string, string | undefined>
}
