<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMessageBox, ElMessage } from 'element-plus'

const route = useRoute()
const appStore = useAppStore()

const isFullscreen = ref(false)
const searchText = ref('')

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    title: item.meta.title,
    path: item.path
  }))
})

const toggleCollapse = () => {
  appStore.toggleCollapse()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const handleUserClick = (command) => {
  if (command === 'profile') {
    ElMessage.info('个人中心')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('已退出登录')
    }).catch(() => {})
  }
}
</script>

<template>
  <div class="header">
    <div class="header-left">
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon :size="20">
          <Fold v-if="!appStore.isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(item, index) in breadcrumbs.slice(1)" 
          :key="item.path"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <div class="header-right">
      <el-input
        v-model="searchText"
        placeholder="搜索"
        prefix-icon="Search"
        class="search-input hidden-mobile"
        clearable
      />
      
      <el-tooltip content="全屏" placement="bottom">
        <div class="header-item" @click="toggleFullscreen">
          <el-icon :size="20">
            <FullScreen v-if="!isFullscreen" />
            <Close v-else />
          </el-icon>
        </div>
      </el-tooltip>
      
      <el-tooltip content="消息" placement="bottom">
        <el-badge :value="99" :max="99" class="item">
          <div class="header-item">
            <el-icon :size="20"><Bell /></el-icon>
          </div>
        </el-badge>
      </el-tooltip>
      
      <el-dropdown @command="handleUserClick" trigger="click">
        <div class="header-item user-info">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="username">Admin</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              <span style="margin-left: 8px">个人中心</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              <span style="margin-left: 8px">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <el-tooltip content="设置" placement="bottom">
        <div class="header-item">
          <el-icon :size="20"><Setting /></el-icon>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.collapse-btn:hover {
  background-color: #f2f6fc;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 200px;
}

.header-item {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  color: #606266;
}

.header-item:hover {
  background-color: #f2f6fc;
  color: #409eff;
}

.user-info {
  gap: 8px;
  padding: 4px 8px;
}

.username {
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .hidden-mobile {
    display: none !important;
  }
  
  .username {
    display: none;
  }
  
  .header {
    padding: 0 10px;
  }
  
  .header-right {
    gap: 8px;
  }
}
</style>
