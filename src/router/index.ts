import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Import หน้าต่าง ๆ ตามโครงสร้างโฟลเดอร์ในรูป
import SignupView from '../page/signup.vue'
import SigninView from '../page/signin.vue'
import ProfileView from '../page/customer/profile.vue'
import Home from '../page/customer/home.vue'
import DetailView from '../page/customer/detail.vue'
import BookingView from '../page/customer/booking.vue'
import PaymentView from '../page/customer/payment.vue'
import BookingsView from '../page/customer/bookings.vue'
import BookingDetailView from '../page/customer/booking-detail.vue'
import SearchView from '../page/customer/search.vue'

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
  {
    path: '/vehicle/:id',
    name: 'vehicle-detail',
    component: DetailView,
  },
  {
    path: '/booking/:id',
    name: 'booking',
    component: BookingView,
  },
  {
    path: '/payment',
    name: 'payment',
    component: PaymentView,
  },

  // ----- เพิ่มใหม่: ประวัติการจอง + รายละเอียดการจอง -----
  {
    path: '/bookings',
    name: 'bookings',
    component: BookingsView,
  },
  {
    path: '/bookings/:id',
    name: 'booking-detail',
    component: BookingDetailView,
  },
  {
  path: '/search',
  name: 'search',
  component: SearchView,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router