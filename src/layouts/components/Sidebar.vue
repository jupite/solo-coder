<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const tabsStore = useTabsStore()

const menuItems = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'HomeFilled'
  },
  {
    path: '/card-list',
    title: '卡片列表',
    icon: 'List'
  },
  {
    path: '/user-manage',
    title: '用户管理',
    icon: 'User',
    children: [
      {
        path: '/user-manage/user-list',
        title: '用户列表',
        icon: 'UserFilled'
      },
      {
        path: '/user-manage/role-manage',
        title: '角色管理',
        icon: 'Setting'
      }
    ]
  },
  {
    path: '/system',
    title: '系统设置',
    icon: 'Tools'
  }
]

const defaultOpeneds = computed(() => {
  const path = route.path
  const result = []
  menuItems.forEach(item => {
    if (item.children) {
      if (path.startsWith(item.path)) {
        result.push(item.path)
      }
    }
  })
  return result
})

const handleMenuSelect = (path) => {
  router.push(path)
  const matched = route.matched[route.matched.length - 1]
  if (matched && matched.meta) {
    tabsStore.addTab({
      path,
      title: matched.meta.title || '页面',
      icon: matched.meta.icon || 'Document'
    })
  }
}
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <el-icon v-if="!appStore.isCollapse"><Monitor /></el-icon>
      <span v-if="!appStore.isCollapse">Solo Coder</span>
    </div>
    <el-menu
      :default-active="route.path"
      :default-openeds="defaultOpeneds"
      :collapse="appStore.isCollapse"
      :collapse-transition="false"
      background-color="#001529"
      text-color="#ffffffa6"
      active-text-color="#409eff"
      router
      @select="handleMenuSelect"
    >
      <template v-for="item in menuItems" :key="item.path">
        <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
          <template #title>
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            <el-icon>
              <component :is="child.icon" />
            </el-icon>
            <template #title>{{ child.title }}</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.sidebar {
  height: 100%;
  background-color: #001529;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 16px;
  gap: 8px;
}

.logo .el-icon {
  font-size: 24px;
}

:deep(.el-menu) {
  border-right: none;
}
</style>
