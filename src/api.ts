import { PSApi } from '@pubstudio/builder'
import { ref } from 'vue'

export const SITE_FORMAT_VERSION = import.meta.env?.VITE_SITE_FORMAT_VERSION || ''
export const SITE_API_URL = import.meta.env?.VITE_SITE_API_URL || ''
export const SITE_ID = import.meta.env?.VITE_SITE_ID || ''
export const AUTH_BYPASS_TOKEN = import.meta.env?.VITE_AUTH_BYPASS_TOKEN || ''

export const API_URL = `${SITE_API_URL}/api/`

export const rootApi = new PSApi({
  baseUrl: API_URL,
  userToken: ref(AUTH_BYPASS_TOKEN),
})
