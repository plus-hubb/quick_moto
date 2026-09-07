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
import AdminDashboard from '../page/admin/dashboard.vue'
import AdminVehiclesView from '../page/admin/vehicles-admin.vue'
import DeliveryReturnView from '../page/admin/delivery-return.vue'
import PendingApprovalView from '../page/admin/pending-approval.vue'

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

  // ----- หน้าแอดมิน -----
  {
  path: '/admin/dashboard',
  name: 'admin-dashboard',
  component: AdminDashboard,
},
  {
  path: '/admin/pending-approval',
  name: 'admin-pending-approval',
  component: PendingApprovalView,
},
  {
  path: '/admin/vehicles',
  name: 'admin-vehicles',
  component: AdminVehiclesView,
},
  {
  path: '/admin/delivery',
  name: 'admin-delivery',
  component: DeliveryReturnView,
},
  {
  path: '/admin/return',
  name: 'admin-return',
  component: DeliveryReturnView,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ==============================
// Route Guard — กัน customer เข้าหน้า admin
// ==============================

router.beforeEach((to) => {
  const isAdminRoute = to.path.startsWith('/admin')

  if (isAdminRoute) {
    const admin = localStorage.getItem('admin')

    if (!admin) {
      return { name: 'signin' }
    }
  }
})

export default router