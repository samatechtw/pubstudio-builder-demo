import { store, PSApi } from '@pubstudio/builder'

export const SITE_API_URL = import.meta.env?.VITE_SITE_API_URL || ''
export const SITE_ID = import.meta.env?.VITE_SITE_ID || ''

export const API_URL = `${SITE_API_URL}/api/`

export const rootApi = new PSApi({
  baseUrl: API_URL,
  userToken: store.auth.token,
})
