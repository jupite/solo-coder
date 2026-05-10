<script setup>
import { ref, onMounted } from 'vue'
import { getCardList } from '@/api/card'

const stats = ref([
  { title: '总用户数', value: '12,345', icon: 'User', color: '#409eff', trend: '+12%' },
  { title: '今日访问', value: '1,234', icon: 'View', color: '#67c23a', trend: '+5%' },
  { title: '订单数量', value: '567', icon: 'ShoppingCart', color: '#e6a23c', trend: '-3%' },
  { title: '销售额', value: '¥89,012', icon: 'Money', color: '#f56c6c', trend: '+18%' }
])

const cardList = ref([])

onMounted(async () => {
  try {
    const res = await getCardList()
    cardList.value = res.data.slice(0, 4)
  } catch (error) {
    console.error('获取数据失败', error)
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6" v-for="stat in stats" :key="stat.title">
          <el-card class="stat-card" :body-style="{ padding: '20px' }">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
                <div class="stat-trend" :class="stat.trend.startsWith('+') ? 'up' : 'down'">
                  {{ stat.trend }}
                </div>
              </div>
              <div class="stat-icon" :style="{ backgroundColor: stat.color + '20' }">
                <el-icon :size="32" :style="{ color: stat.color }">
                  <component :is="stat.icon" />
                </el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="chart-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>最近活动</span>
              </div>
            </template>
            <el-table :data="cardList" style="width: 100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="title" label="标题" />
              <el-table-column prop="status" label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'info'">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>系统公告</span>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in activities"
                :key="index"
                :timestamp="activity.timestamp"
                :placement="'top'"
              >
                {{ activity.content }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
const activities = [
  {
    content: '系统升级完成，新增多项功能优化',
    timestamp: '2024-03-20 10:30:00'
  },
  {
    content: '新增用户管理模块上线',
    timestamp: '2024-03-19 14:20:00'
  },
  {
    content: '服务器维护完成',
    timestamp: '2024-03-18 09:00:00'
  },
  {
    content: '新版本发布 v2.0.0',
    timestamp: '2024-03-15 16:45:00'
  }
]
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.stat-trend {
  font-size: 12px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-card {
  border-radius: 8px;
}

.card-header {
  font-weight: bold;
}
</style>
