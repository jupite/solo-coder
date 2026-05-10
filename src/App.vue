<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from './stores/tabs'

const route = useRoute()
const tabsStore = useTabsStore()

onMounted(() => {
  const matched = route.matched[route.matched.length - 1]
  if (matched && matched.meta) {
    tabsStore.addTab({
      path: route.path,
      title: matched.meta.title || '页面',
      icon: matched.meta.icon || 'Document'
    })
  }
})
</script>

<template>
  <router-view />
</template>
