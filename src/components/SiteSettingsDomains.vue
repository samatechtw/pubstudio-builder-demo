<template>
  <CustomDomains
    :domains="site?.custom_domains"
    :updating="updating"
    :verifying="verifying"
    :newDomain="newDomain"
    :server="site?.site_server"
    @setNewDomain="newDomain = $event"
    @addDomain="addDomain"
    @deleteDomain="deleteDomain"
    @verifyDomain="verifyDomain"
  />
  <ErrorMessage :error="error" class="domain-error" />
  <div class="site-settings-actions">
    <PSButton
      class="cancel-button"
      :text="t('ok')"
      :disabled="newDomain !== undefined"
      @click="emit('cancel')"
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs, computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  ErrorMessage,
  PSButton,
  IMergedSiteData,
  useSiteDomains,
  CustomDomains,
  ICustomDomainRelationViewModel,
} from '@pubstudio/builder'

const { t } = useI18n()
const { addSiteDomain, deleteSiteDomain, verifySiteDomain, updating, verifying, error } =
  useSiteDomains()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'updateDomains', domains: ICustomDomainRelationViewModel[]): void
}>()

const props = defineProps<{
  site: IMergedSiteData | undefined
}>()
const { site } = toRefs(props)

const newDomain = ref()

const domains = computed(() => {
  return site.value?.custom_domains ?? []
})

const addDomain = async (domain: string) => {
  if (site.value) {
    const { id } = site.value
    await addSiteDomain(id, domain)
    if (!error.value) {
      newDomain.value = undefined
      const newDomains = [{ domain, verified: false }].concat(domains.value)
      emit('updateDomains', newDomains)
    }
  }
}

const verifyDomain = async (domain: string) => {
  if (site.value) {
    const { id } = site.value
    await verifySiteDomain(id, domain)
    if (!error.value) {
      const newDomains = [...domains.value]
      for (const d of newDomains) {
        if (d.domain === domain) {
          d.verified = true
          break
        }
      }
      emit('updateDomains', newDomains)
    }
  }
}

const deleteDomain = async (domain: string) => {
  if (site.value) {
    const { id } = site.value
    await deleteSiteDomain(id, domain)
    if (!error.value) {
      const newDomains = domains.value.filter((d) => d.domain !== domain)
      emit('updateDomains', newDomains)
    }
  }
}
</script>

<style lang="postcss" scoped>
.domain-error :deep(.error) {
  justify-content: center;
}
</style>
