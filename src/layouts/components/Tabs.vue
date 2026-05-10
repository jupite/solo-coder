<script setup>
import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()

watch(
  () => tabsStore.activeTab,
  (newPath) => {
    if (newPath && newPath !== route.path) {
      router.push(newPath)
    }
  }
)

const handleTabRemove = (path) => {
  tabsStore.removeTab(path)
}
</script>

<template>
  <div class="tabs-container">
    <el-tabs
      v-model="tabsStore.activeTab"
      type="card"
      class="custom-tabs"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="tab in tabsStore.tabs"
        :key="tab.path"
        :label="tab.title"
        :name="tab.path"
        :closable="tab.closable"
      >
        <template #label>
          <span class="tab-label">
            <el-icon v-if="tab.icon" class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            {{ tab.title }}
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.tabs-container {
  background-color: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.custom-tabs) {
  margin-bottom: 0;
}

:deep(.custom-tabs .el-tabs__header) {
  margin-bottom: 0;
}

:deep(.custom-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.custom-tabs .el-tabs__item) {
  border-radius: 4px 4px 0 0;
  margin-right: 4px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-icon {
  font-size: 14px;
}
</style>
