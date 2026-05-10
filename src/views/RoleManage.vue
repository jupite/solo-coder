<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const roleList = ref([
  { id: 1, name: '超级管理员', code: 'super_admin', description: '拥有所有权限', userCount: 1 },
  { id: 2, name: '管理员', code: 'admin', description: '拥有大部分管理权限', userCount: 5 },
  { id: 3, name: '编辑', code: 'editor', description: '可以编辑内容', userCount: 10 },
  { id: 4, name: '普通用户', code: 'user', description: '普通用户权限', userCount: 100 }
])

const handleEdit = (row) => {
  ElMessage.info(`编辑角色: ${row.name}`)
}

const handlePermission = (row) => {
  ElMessage.info(`权限配置: ${row.name}`)
}

const handleDelete = (row) => {
  ElMessage.warning(`删除角色: ${row.name}`)
}
</script>

<template>
  <div class="role-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="roleList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="userCount" label="用户数" width="100" align="center" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="primary" link size="small" @click="handlePermission(row)">权限</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.role-manage {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
