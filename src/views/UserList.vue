<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const userList = ref([
  { id: 1, username: 'admin', email: 'admin@example.com', role: '超级管理员', status: 'active', createTime: '2024-01-01 10:00:00' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: '普通用户', status: 'active', createTime: '2024-01-02 11:00:00' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: '普通用户', status: 'inactive', createTime: '2024-01-03 12:00:00' },
  { id: 4, username: 'user3', email: 'user3@example.com', role: '编辑', status: 'pending', createTime: '2024-01-04 13:00:00' },
  { id: 5, username: 'user4', email: 'user4@example.com', role: '普通用户', status: 'active', createTime: '2024-01-05 14:00:00' }
])

const getStatusType = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'inactive':
      return 'info'
    default:
      return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return '启用'
    case 'pending':
      return '待审核'
    case 'inactive':
      return '禁用'
    default:
      return status
  }
}

const handleEdit = (row) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = (row) => {
  ElMessage.warning(`删除用户: ${row.username}`)
}
</script>

<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.user-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
