import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // 이 경로는 처음 방문할 때만 컴포넌트를 로드합니다 (Lazy-loading).
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/user/:id?',
      name: 'user',
      component: () => import('@/views/UserView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

export default router
