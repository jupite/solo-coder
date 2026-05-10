<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getCardList, getCardListByPage } from '@/api/card'

const loading = ref(false)
const cardList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getCardListByPage({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    cardList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

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
      return '激活'
    case 'pending':
      return '待处理'
    case 'inactive':
      return '未激活'
    default:
      return status
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="card-list">
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入标题搜索" prefix-icon="Search" clearable />
        </el-col>
        <el-col :span="8">
          <el-select placeholder="请选择状态" clearable style="width: 100%">
            <el-option label="激活" value="active" />
            <el-option label="待处理" value="pending" />
            <el-option label="未激活" value="inactive" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="fetchData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="() => { currentPage = 1; fetchData() }">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card class="table-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>卡片列表</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="cardList"
        style="width: 100%"
        border
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="300" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small">查看</el-button>
            <el-button type="primary" link size="small">编辑</el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.card-list {
  padding: 0;
}

.search-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
