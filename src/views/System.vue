<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

const basicForm = ref({
  siteName: 'Solo Coder',
  siteDescription: '一个现代化的后台管理系统',
  keywords: 'Vue3, Element Plus, 后台管理',
  copyright: '© 2024 Solo Coder'
})

const securityForm = ref({
  sessionTimeout: 30,
  loginAttempts: 5,
  passwordMinLength: 8,
  twoFactorAuth: true
})

const handleSave = () => {
  ElMessage.success('保存成功')
}
</script>

<template>
  <div class="system">
    <el-card>
      <template #header>
        <span style="font-weight: bold;">系统设置</span>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px" style="max-width: 600px;">
            <el-form-item label="网站名称">
              <el-input v-model="basicForm.siteName" />
            </el-form-item>
            <el-form-item label="网站描述">
              <el-input v-model="basicForm.siteDescription" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="关键词">
              <el-input v-model="basicForm.keywords" />
            </el-form-item>
            <el-form-item label="版权信息">
              <el-input v-model="basicForm.copyright" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存设置</el-button>
              <el-button>重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityForm" label-width="150px" style="max-width: 600px;">
            <el-form-item label="会话超时时间(分钟)">
              <el-input-number v-model="securityForm.sessionTimeout" :min="5" :max="120" />
            </el-form-item>
            <el-form-item label="登录失败尝试次数">
              <el-input-number v-model="securityForm.loginAttempts" :min="3" :max="10" />
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityForm.passwordMinLength" :min="6" :max="20" />
            </el-form-item>
            <el-form-item label="双因素认证">
              <el-switch v-model="securityForm.twoFactorAuth" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存设置</el-button>
              <el-button>重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.system {
  padding: 0;
}
</style>
