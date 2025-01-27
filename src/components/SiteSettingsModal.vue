<template>
  <Modal
    :show="!!site"
    cls="site-settings-modal"
    :cancelByClickingOutside="false"
    @cancel="emit('cancel')"
  >
    <div class="modal-title">
      {{ t('sites.settings') }}
    </div>
    <div class="ps-tabs site-settings-tabs">
      <div
        v-for="tab in SiteSettingsTab"
        :key="tab"
        :class="['ps-tab', `ps-tab-${tab}`, activeTab === tab && 'ps-tab-active']"
        @click="activeTab = tab"
      >
        {{ t(tab) }}
      </div>
    </div>
    <div v-if="activeTab === SiteSettingsTab.Info" class="site-update-wrap">
      <div class="site-fields">
        <div class="site-name-wrap">
          <div class="site-label">
            {{ t('name') }}
          </div>
          <STInput
            :modelValue="newName"
            name="site-name"
            class="site-name"
            :placeholder="t('sites.name')"
            :errorBubble="siteNameError"
            @update:modelValue="newName = $event"
          />
        </div>
        <div v-if="!isScratch" class="site-id-wrap">
          <div class="site-label">
            {{ t('id') }}
          </div>
          <STInput
            :modelValue="newNamespace"
            name="site-id"
            class="site-id"
            :placeholder="t('id')"
            :errorBubble="namespaceError"
            @update:modelValue="setNamespace($event)"
          />
        </div>
      </div>
      <div class="site-published">
        <div class="site-label published-label">
          {{ t('published') }}
        </div>
        <PSToggle
          :on="published"
          :onText="t('yes')"
          :offText="t('no')"
          class="published-toggle"
          @toggle="setPublished($event)"
        />
        <PSButton
          v-if="hasDraft"
          class="delete-draft-button"
          size="small"
          :text="t('sites.delete_draft')"
          @click="emit('deleteDraft')"
        />
        <PSButton
          class="save-button"
          size="small"
          :animate="updating"
          :text="t('save')"
          @click="updateSite"
        />
      </div>
    </div>
    <SiteSettingsDomains
      v-else-if="activeTab === SiteSettingsTab.Domains"
      :site="site"
      @updateDomains="updateDomains"
      @cancel="emit('cancel')"
    />
    <SiteSettingsUsage
      v-else-if="activeTab === SiteSettingsTab.Usage"
      :site="site"
      @cancel="emit('cancel')"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  Modal,
  PSButton,
  PSToggle,
  ISiteMetadata,
  IUpdateSiteApiRequest,
  useSiteVersion,
  replaceNamespace,
  useBuild,
  ICustomDomainRelationViewModel,
  useSiteSource,
  useSites,
} from '@pubstudio/builder'
import { STInput } from '@samatech/vue-components'
import SiteSettingsDomains from './SiteSettingsDomains.vue'
import SiteSettingsUsage from './SiteSettingsUsage.vue'

enum SiteSettingsTab {
  Info = 'info',
  Domains = 'domains',
  Usage = 'usage',
}

const { t } = useI18n()
const { hasDraft, sitePublished, listVersions } = useSiteVersion()
const { siteStore, apiSite } = useSiteSource()
const { site: activeSite, replaceSite } = useBuild()
const activeTab = ref(SiteSettingsTab.Info)
const {
  updateSite: updateSiteApi,
  publishSite: publishSiteApi,
  error,
  validateSiteName,
  validateNamespace,
} = useSites()
const newName = ref()
const newNamespace = ref()
const published = ref(false)
const updating = ref(false)

const siteNameError = computed(() => validateSiteName(newName.value ?? ''))

const namespaceError = ref()

const setNamespace = (namespace: string) => {
  newNamespace.value = namespace
  namespaceError.value = validateNamespace(namespace)
}

const props = defineProps<{
  site: ISiteMetadata | undefined
  isScratch?: boolean
}>()
const { site, isScratch } = toRefs(props)

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'deleteDraft'): void
}>()

const setPublished = async (publish: boolean) => {
  if (site.value && !updating.value) {
    updating.value = true
    const { id } = site.value
    // Update SiteAPI site
    if (!isScratch.value) {
      await publishSiteApi(id, { publish })
      // Hack to refresh published status in versions list
      // We can get this directly from the site data, but it's not passed through at the moment
      await listVersions()
      if (siteStore.value) {
        siteStore.value.setUpdateKey(undefined)
      }
    }
    published.value = publish
    updating.value = false
  }
}

const updateDomains = (domains: ICustomDomainRelationViewModel[]) => {
  if (activeSite.value) {
    activeSite.value.custom_domains = domains
  }
}

const updateSite = async () => {
  if (site.value && !siteNameError.value && !namespaceError.value) {
    const { id } = site.value
    updating.value = true
    // Update name if changed
    if (!isScratch.value && site.value.name !== newName.value) {
      const payload: IUpdateSiteApiRequest = { name: newName.value }
      await updateSiteApi(id, payload)
      activeSite.value.name = newName.value
    }
    // Update namespace if changed
    if (!isScratch.value && newNamespace.value !== activeSite.value.context.namespace) {
      replaceSite(replaceNamespace(activeSite.value, newNamespace.value))
    }
    if (!error.value) {
      emit('cancel')
    }
    error.value = undefined
    updating.value = false
  }
}

const initializeSite = () => {
  published.value = sitePublished.value
  newNamespace.value = activeSite.value?.context.namespace ?? ''
  newName.value = activeSite.value?.name
}

watch(site, initializeSite)

onMounted(async () => {
  initializeSite()
})
</script>

<style lang="postcss">
@import '../style/mixins.postcss';

.site-settings-modal {
  .modal-inner {
    @mixin flex-col;
    width: 600px;
    max-width: 95%;
    max-height: 95%;
    overflow-y: auto;
    padding-bottom: 16px;
    padding-top: 24px;
  }
  .modal-title {
    justify-content: center;
  }

  .site-settings-actions {
    @mixin flex-row;
    padding-top: 24px;
    margin-top: auto;
    justify-content: center;
  }
  .cancel-button {
    margin-left: 16px;
  }

  .site-update-wrap {
    @mixin flex-row;
    margin-top: 24px;
  }
  .site-published {
    @mixin flex-col;
    align-items: center;
    width: 50%;
  }
  .delete-draft-button {
    margin-top: 16px;
    background-color: $color-red;
    &:hover,
    &:focus {
      background-color: rgba($color-red, 0.8);
    }
  }
  .save-button {
    margin-top: 16px;
  }
  .site-fields {
    @mixin flex-col;
  }
  .site-name-wrap {
    display: flex;
    align-items: center;
  }
  .site-label {
    @mixin title-semibold 14px;
    width: 100px;
    margin-right: 16px;
    &.published-label {
      margin: 0;
      text-align: center;
    }
  }
  .published-toggle {
    margin-top: 8px;
  }
  .site-id-wrap {
    display: flex;
    align-items: center;
    margin-top: 12px;
  }

  @media (max-width: 640px) {
    .site-update-wrap {
      flex-direction: column-reverse;
    }
    .site-published {
      margin: 8px auto 24px;
    }
    .published-toggle {
      margin-top: 12px;
    }
  }
}
</style>
