<template>
  <router-view v-if="route?.path.startsWith('/preview')" class="preview-router-view" />
  <Suspense v-else>
    <router-view />
  </Suspense>
  <AppToast />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { AppToast, useRoute } from '@pubstudio/builder'
import '@pubstudio/builder/dist/builder.css'

const route = useRoute()

onMounted(async () => {
  // App mounted
})
</script>

<style lang="postcss">
@import './style/mixins.postcss';
@import './style/fonts.postcss';
@import '../node_modules/@pubstudio/builder/dist/assets/css/components/app.postcss';

#app {
  height: 100%;
}

.app {
  @mixin flex-col;
  height: 100%;
  overflow-y: auto;
  & > .app-content {
    @mixin flex-col;
    padding-top: $header-height;
    flex-shrink: 0;
    flex-grow: 1;
    background-color: white;
    & > .app-router-view {
      flex-grow: 1;
    }
  }
}

.component-content-container {
  .pm-p {
    &::after {
      content: '\200b';
    }
    &.pm-p-placeholder {
      cursor: text;
    }
  }
}

@media (max-width: 640px) {
  .app {
    & > .app-content {
      padding-top: $header-height-mobile;
    }
  }
}
</style>
