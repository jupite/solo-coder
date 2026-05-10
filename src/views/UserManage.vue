<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  if (route.path === '/user-manage') {
    router.push('/user-manage/user-list')
  }
})
</script>

<template>
  <div class="user-manage">
    <router-view />
  </div>
</template>

<style scoped>
.user-manage {
  padding: 0;
}
</style>
