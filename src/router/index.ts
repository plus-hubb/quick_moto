import { createRouter, createWebHistory,type RouteRecordRaw } from 'vue-router'

// Import หน้าต่าง ๆ ตามโครงสร้างโฟลเดอร์ในรูป
import SignupView from '../page/signup.vue'
import SigninView from '../page/signin.vue'
import ProfileView from '../page/customer/profile.vue'
import Home from '../page/customer/home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'signup',
    component: SignupView, // หน้าแรกแสดง signup
  },
  {
    path: '/signin',
    name: 'signin',
    component: SigninView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
  },
   {
    path: '/home',
    name: 'home',
    component: Home,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router