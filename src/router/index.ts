import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { supabase, supabaseAdmin } from '../lib/supabase'

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
import ContactView from '../page/customer/contact.vue'
import AdminDashboard from '../page/admin/dashboard.vue'
import AdminVehiclesView from '../page/admin/vehicles-admin.vue'
import DeliveryReturnView from '../page/admin/delivery-return.vue'
import PendingApprovalView from '../page/admin/pending-approval.vue'
import CancellationsView from '../page/admin/cancellations.vue'
import RentalHistoryView from '../page/admin/rental-history.vue'
import RevenueView from '../page/admin/revenue.vue'
import WalkInView from '../page/admin/walk-in-booking.vue'

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
    path: '/contact',
    name: 'contact',
    component: ContactView,
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
  {
  path: '/admin/cancellations',
  name: 'admin-cancellations',
  component: CancellationsView,
},
{
  path: '/admin/rental-history',
  name: 'admin-rental-history',
  component: RentalHistoryView,
},
{
  path: '/admin/revenue',
  name: 'admin-revenue',
  component: RevenueView,
},
{
  path: '/admin/walk-in-booking',
  name: 'admin-walk-in-booking',
  component: WalkInView,
},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ==============================
// Route Guard — ป้องกันทุกหน้าที่ต้อง login
// ==============================

// หน้าที่ไม่ต้อง login (public)
const publicRoutes = ['signup', 'signin']

// หน้าที่ต้อง login เป็นแอดมิน
const adminRoutes = [
  'admin-dashboard',
  'admin-pending-approval',
  'admin-vehicles',
  'admin-delivery',
  'admin-return',
  'admin-cancellations',
  'admin-rental-history',
  'admin-revenue',
  'admin-walk-in-booking',
]

router.beforeEach(async (to) => {
  // หน้า public — ผ่านได้เลย
  if (publicRoutes.includes(to.name as string)) {
    return
  }

  // ถ้าเป็นหน้าแอดมิน — ต้อง login ด้วย admin session
  if (adminRoutes.includes(to.name as string)) {
    const { data: { session } } = await supabaseAdmin.auth.getSession()

    if (!session) {
      return { name: 'signin' }
    }

    // เช็คว่ามี admin record ใน DB จริง
    const { data: adminData } = await supabaseAdmin
      .from('admin')
      .select('admin_id')
      .eq('email', session.user.email)
      .maybeSingle()

    if (!adminData) {
      await supabaseAdmin.auth.signOut()
      localStorage.removeItem('admin')
      return { name: 'signin' }
    }

    return
  }

  // หน้าลูกค้า — ต้อง login ด้วย customer session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { name: 'signin' }
  }
})

export default router