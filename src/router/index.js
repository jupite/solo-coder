import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'card-list',
        name: 'CardList',
        component: () => import('@/views/CardList.vue'),
        meta: { title: '卡片列表', icon: 'List' }
      },
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/UserManage.vue'),
        meta: { title: '用户管理', icon: 'User' },
        children: [
          {
            path: 'user-list',
            name: 'UserList',
            component: () => import('@/views/UserList.vue'),
            meta: { title: '用户列表', icon: 'UserFilled' }
          },
          {
            path: 'role-manage',
            name: 'RoleManage',
            component: () => import('@/views/RoleManage.vue'),
            meta: { title: '角色管理', icon: 'Setting' }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/System.vue'),
        meta: { title: '系统设置', icon: 'Tools' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
