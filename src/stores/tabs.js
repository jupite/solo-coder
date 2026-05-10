import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref([
    { path: '/dashboard', title: '首页', icon: 'HomeFilled', closable: false }
  ])
  const activeTab = ref('/dashboard')

  const addTab = (tab) => {
    const exists = tabs.value.find(t => t.path === tab.path)
    if (!exists) {
      tabs.value.push({
        ...tab,
        closable: tab.path !== '/dashboard'
      })
    }
    activeTab.value = tab.path
  }

  const removeTab = (path) => {
    const index = tabs.value.findIndex(t => t.path === path)
    if (index > -1) {
      tabs.value.splice(index, 1)
      if (activeTab.value === path && tabs.value.length > 0) {
        const newIndex = index === 0 ? 0 : index - 1
        activeTab.value = tabs.value[newIndex].path
      }
    }
  }

  const setActiveTab = (path) => {
    activeTab.value = path
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    setActiveTab
  }
})
