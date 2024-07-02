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
    <div class="modal-text">
      {{ t('sites.settings_text2') }}
    </div>

    <div class="site-update-wrap">
      <div class="site-fields">
        <div class="site-name-wrap">
          <div class="site-label">
            {{ t('name') }}
          </div>
          <PSInput
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
          <PSInput
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
      </div>
    </div>
    <CustomDomains
      v-if="!isScratch"
      :initialDomains="site.custom_domains"
      @updateDomains="newDomains = $event"
    />
    <div class="site-settings-actions">
      <PSButton
        class="update-button"
        :text="t('update')"
        :animate="updating"
        :disabled="isEditingDomain"
        @click="updateSite"
      />
      <PSButton class="cancel-button" :text="t('cancel')" @click="emit('cancel')" />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  arrayChanged,
  Modal,
  PSButton,
  PSInput,
  PSToggle,
  ISiteMetadata,
  IUpdateSiteApiRequest,
  useSiteVersion,
  CustomDomains,
  replaceNamespace,
  useBuild,
  useEditDomains,
  useSiteApi,
  useSiteSource,
  useSites,
} from '@pubstudio/builder'

const { t } = useI18n()
const { hasDraft, sitePublished, listVersions } = useSiteVersion()
const { siteStore, apiSite } = useSiteSource()
const { site: activeSite, replaceSite } = useBuild()
const { isEditingDomain } = useEditDomains()
const { updateSiteMetadata } = useSiteApi(apiSite)
const {
  updateSite: updateSiteApi,
  publishSite: publishSiteApi,
  error,
  validateSiteName,
  validateNamespace,
} = useSites()
const newDomains = ref<string[] | undefined>()
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
    // Update domains if changed
    if (arrayChanged(site.value.custom_domains, newDomains.value)) {
      await updateSiteMetadata(id, { domains: newDomains.value })
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
  newDomains.value = [...(site.value?.custom_domains ?? [])]
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
