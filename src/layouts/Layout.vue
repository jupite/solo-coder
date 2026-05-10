<script setup>
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Tabs from './components/Tabs.vue'

const appStore = useAppStore()
</script>

<template>
  <el-container class="app-container">
    <el-aside 
      :width="appStore.isCollapse ? '64px' : '200px'" 
      class="aside"
    >
      <Sidebar />
    </el-aside>
    <el-container class="main-container">
      <el-header class="header-wrapper">
        <Header />
      </el-header>
      <el-main class="main-content">
        <Tabs />
        <div class="content-wrapper">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-wrapper {
  height: 60px;
  padding: 0;
}

.main-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
