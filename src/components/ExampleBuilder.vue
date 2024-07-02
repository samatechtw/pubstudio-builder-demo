<template>
  <div v-if="site" class="build-wrap">
    <div class="style-toolbar-wrap">
      <SiteToolbar @showSiteSettings="showSiteSettings" />
    </div>
    <div class="build">
      <BuildMenu
        @toggleStyleMenu="toggleEditorMenu(editor, EditorMode.Styles, $event)"
        @toggleThemeMenu="toggleEditorMenu(editor, EditorMode.Theme, $event)"
        @showCreateModal="showCreateModal = true"
      />
      <ComponentTree />
      <BuildContent />
      <div class="build-right-menu">
        <Transition name="fade">
          <ComponentMenu
            v-if="showComponentMenu"
            :component="editor?.selectedComponent!"
            :siteId="siteId ?? ''"
            class="build-right-menu-content"
          />
          <ThemeMenu
            v-else-if="editor?.mode === EditorMode.Theme"
            class="build-right-menu-content"
          />
          <StyleMenu
            v-else-if="editor?.mode === EditorMode.Styles"
            class="build-right-menu-content"
          />
          <PageMenu
            v-else-if="editor?.mode === EditorMode.Page"
            class="build-right-menu-content"
          />
          <div v-else class="build-right-menu-empty">
            {{ t('build.menu_empty') }}
          </div>
        </Transition>
      </div>
      <!-- TODO -- decouple from platform API
      <CreateAssetModal
        :show="showCreateModal"
        :sites="sites"
        :initialSiteId="apiSiteId"
        :initialFile="droppedFile?.file"
        :loadSites="true"
        @complete="showCreateComplete"
        @cancel="showCreateCancel"
      />
      -->
      <AlertModal
        :show="siteError === 'errors.Unauthorized'"
        :title="t('errors.unauthorized_title')"
        :text="t('errors.Unauthorized')"
        @done="siteError = undefined"
      />
      <AlertModal
        v-if="apiSiteId === 'scratch'"
        :show="!store.misc.scratchPopupViewed.value"
        :title="t('build.scratch_title')"
        :text="t('build.scratch_text')"
        @done="store.misc.setScratchPopupViewed(true)"
      />
      <SiteErrorModal
        :show="!!siteError && siteError !== 'errors.Unauthorized' && showSiteErrorModal"
        :siteId="apiSiteId ?? ''"
        :siteError="siteError ?? ''"
        :showSupport="false"
        @cancel="showSiteErrorModal = false"
      />
      <SiteSettingsModal
        :site="siteMetadata"
        :isScratch="siteId === 'scratch'"
        @cancel="siteMetadata = undefined"
      />
    </div>
    <SiteSaveErrorModal />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  setConfig,
  store,
  rootSiteApi,
  ISiteMetadata,
  useSiteApi,
  useSiteSource,
  useSiteVersion,
  initializeSiteStore,
  AlertModal,
  SiteErrorModal,
  SiteSaveErrorModal,
  BuildContent,
  BuildMenu,
  StyleMenu,
  ComponentMenu,
  ComponentTree,
  ThemeMenu,
  toggleEditorMenu,
  PageMenu,
  useBuild,
  useDragDropData,
  SiteToolbar,
  useBuildEvent,
  EditorMode,
} from '@pubstudio/builder'
import { SITE_API_URL, SITE_ID, AUTH_BYPASS_TOKEN, SITE_FORMAT_VERSION } from '../api'
import SiteSettingsModal from './SiteSettingsModal.vue'

setConfig({ siteFormatVersion: SITE_FORMAT_VERSION })

const { t } = useI18n()

const { site, editor, siteError } = useBuild()
const showSiteErrorModal = ref(true)
const siteMetadata = ref<ISiteMetadata>()
const { droppedFile } = useDragDropData()

const siteId = SITE_ID || 'scratch'
const token = ref(AUTH_BYPASS_TOKEN)
const serverAddress = await initializeSiteStore({
  siteId,
  siteApiUrl: SITE_API_URL,
  authBypassToken: token,
  userToken: token,
})
rootSiteApi.baseUrl = serverAddress ? `${serverAddress}/` : ''
rootSiteApi.siteId.value = siteId

const { siteStore, apiSite, apiSiteId, isSaving } = useSiteSource()
useBuildEvent()

const showCreateModal = ref(false)

const showSiteSettings = async () => {
  const { getSiteMetadata } = useSiteApi(apiSite)
  if (apiSiteId.value) {
    siteMetadata.value = await getSiteMetadata(apiSiteId.value)
  }
}

watch(droppedFile, (newVal) => {
  if (newVal) {
    showCreateModal.value = true
  }
})

/*
const showCreateComplete = (asset: ICreatePlatformSiteAssetResponse) => {
  if (droppedFile.value && activePage.value) {
    const addImageData = makeAddImageData(site.value, activePage.value.root, urlFromAsset(asset))
    if (addImageData) {
      addComponentData({
        ...addImageData,
        parentId: droppedFile.value.componentId,
        parentIndex: droppedFile.value.index,
      })
    }
  }
  droppedFile.value = undefined
  showCreateModal.value = false
}

const showCreateCancel = () => {
  showCreateModal.value = false
  droppedFile.value = undefined
}

const saveSiteBeforeLeave = () => {
  if (isSaving.value) {
    siteStore.value.save(site.value, { immediate: true })
  }
}
*/

// For debugging editor mode state
const showComponentMenu = computed(() => {
  return (
    editor.value?.mode === EditorMode.SelectedComponent &&
    !!editor.value?.selectedComponent
  )
})

const beforeWindowUnload = (e: BeforeUnloadEvent) => {
  if (isSaving.value) {
    e.preventDefault()
    // Chrome requires returnValue to be set
    e.returnValue = t('build.unsaved')
    // Note: Most modern browsers no longer allow custom messages
    return e.returnValue
  } else {
    siteStore.value.save(site.value, { immediate: true })
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', beforeWindowUnload)
  await useSiteVersion({ siteId }).listVersions()
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeWindowUnload)
})
</script>

<style lang="postcss">
@import '../style/mixins.postcss';

.build-wrap {
  height: 100%;
}
.build {
  @mixin flex-row;
}
.build-right-menu {
  @mixin menu;
  height: auto;
  max-height: $view-height;
  position: relative;
  overflow: scroll;
  border-left: 1px solid $border1;
}
.build-right-menu-content {
  width: 100%;
}
.build-right-menu-empty {
  @mixin title-medium 20px;
  color: $grey-500;
  padding: 16px;
}
.style-toolbar-wrap {
  display: flex;
}
.home {
  @mixin flex-center;
  background-color: $purple-button;
  padding: 0 2px;
  width: 48px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  position: absolute;
  padding: 0 24px;
  opacity: 0;
}
</style>
