<template>
  <div class="site-usage-wrap">
    <div class="usage-row">
      <div class="usage left">
        <div class="usage-label">
          {{ t('sites.size') }}
        </div>
        <UsageProgress
          :loading="usageLoading"
          :current="pagesLength"
          :max="usage?.max_pages_length"
          class="site-usage"
        />
      </div>
      <div class="usage right">
        <div class="usage-label">
          {{ t('sites.bandwidth') }}
        </div>
        <UsageProgress
          :loading="usageLoading"
          :current="usage?.total_bandwidth"
          :max="usage?.bandwidth_allowance"
          class="site-usage"
        />
      </div>
    </div>
    <div class="usage-row">
      <div class="usage">
        <div class="usage-label">
          {{ t('custom_data.title') }}
        </div>
        <UsageProgress
          :loading="usageLoading"
          :current="usage?.custom_data_usage"
          :max="usage?.custom_data_allowance"
          class="site-usage"
        />
      </div>
    </div>
  </div>
  <div class="site-settings-actions">
    <PSButton class="cancel-button" :text="t('cancel')" @click="emit('cancel')" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  PSButton,
  UsageProgress,
  IMergedSiteData,
  useSiteResources,
  store,
} from '@pubstudio/builder'

const { usageLoading, usage, getSiteUsage } = useSiteResources()
const { t } = useI18n()

const props = defineProps<{
  site: IMergedSiteData | undefined
}>()
const { site } = toRefs(props)
const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const initializeSite = async () => {
  if (site.value) {
    const site_server = site.value.site_server
    if (!usage.value && site_server) {
      await getSiteUsage({ id: site.value.id, site_server })
    }
  }
}

const pagesLength = computed(() => {
  return store.site.pages.value?.length ?? 0
})

onMounted(async () => {
  await initializeSite()
})
</script>

<style lang="postcss" scoped>
@import '../style/mixins.postcss';

.usage-label {
  @mixin title 15px;
  color: black;
  text-align: center;
  margin: 24px 0 6px;
}
.usage-row {
  display: flex;
  justify-content: center;
}
.usage {
  @mixin flex-col;
  width: 50%;
}
.left {
  margin-right: 8px;
}
.right {
  margin-left: 8px;
}
.site-usage-wrap {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}
</style>
