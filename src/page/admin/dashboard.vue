<template>
  <div class="min-h-screen bg-slate-50 font-kanit lg:flex">

    <AdminSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" @logout="handleLogout" />

    <!-- Main content -->
    <div class="flex-1 lg:ml-64">

      <!-- Top Bar -->
      <header class="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30">
        <button
          type="button"
          @click="isSidebarOpen = true"
          class="lg:hidden text-slate-500 shrink-0"
        >
          <i class="fa-solid fa-bars text-lg"></i>
        </button>

        <div class="flex-1">
          <p class="text-sm font-medium text-slate-900">แดชบอร์ดผู้ดูแลระบบ</p>
        </div>

        <div class="flex items-center gap-3 ml-auto shrink-0">
          <div class="flex items-center gap-2">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-medium text-slate-900 leading-tight">{{ admin?.name }}</p>
              <p class="text-[10px] text-slate-400 leading-tight">ผู้ดูแลระบบ</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#051329] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {{ adminInitial }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6">

        <!-- Breadcrumb -->
        <p class="text-xs text-slate-400 mb-1">
          <span class="text-slate-600 font-medium">แดชบอร์ด</span>
        </p>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">สรุปภาพรวม</h1>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <i class="fa-solid fa-users text-blue-500 text-sm"></i>
              </div>
              <p class="text-xs text-slate-500">ลูกค้าทั้งหมด</p>
            </div>
            <div class="text-2xl font-bold text-slate-900">{{ stats.customers }}</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <i class="fa-solid fa-motorcycle text-emerald-500 text-sm"></i>
              </div>
              <p class="text-xs text-slate-500">รถทั้งหมด</p>
            </div>
            <div class="text-2xl font-bold text-slate-900">{{ stats.vehicles }}</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <i class="fa-regular fa-bookmark text-amber-500 text-sm"></i>
              </div>
              <p class="text-xs text-slate-500">การจองทั้งหมด</p>
            </div>
            <div class="text-2xl font-bold text-slate-900">{{ stats.bookings }}</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <i class="fa-solid fa-clock-rotate-left text-rose-500 text-sm"></i>
              </div>
              <p class="text-xs text-slate-500">รออนุมัติ</p>
            </div>
            <div class="text-2xl font-bold text-slate-900">{{ stats.pendingBookings }}</div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-bold text-slate-900">การจองล่าสุด</h2>
            <RouterLink
              to="/admin/bookings"
              class="text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              ดูทั้งหมด <i class="fa-solid fa-chevron-right text-[8px] ml-0.5"></i>
            </RouterLink>
          </div>

          <div v-if="isLoading" class="text-center text-slate-400 text-sm py-10">
            กำลังโหลด...
          </div>

          <div v-else-if="recentBookings.length === 0" class="text-center text-slate-400 text-sm py-10">
            ยังไม่มีรายการจอง
          </div>

          <table v-else class="w-full text-sm hidden md:table">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs">
                <th class="text-left font-medium px-5 py-3">รหัสจอง</th>
                <th class="text-left font-medium px-5 py-3">ลูกค้า</th>
                <th class="text-left font-medium px-5 py-3">รถ</th>
                <th class="text-left font-medium px-5 py-3">วันรับ-คืน</th>
                <th class="text-left font-medium px-5 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="b in recentBookings"
                :key="b.booking_id"
                class="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td class="px-5 py-3 font-medium text-slate-900">{{ b.booking_code }}</td>
                <td class="px-5 py-3 text-slate-600">{{ b.customer_name }}</td>
                <td class="px-5 py-3 text-slate-600">{{ b.vehicle_name }}</td>
                <td class="px-5 py-3 text-slate-600 text-xs">{{ b.pickup_date }} - {{ b.return_date }}</td>
                <td class="px-5 py-3">
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    :class="statusClass(b.status)"
                  >
                    {{ b.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Cards -->
          <div v-if="!isLoading && recentBookings.length > 0" class="md:hidden divide-y divide-slate-100">
            <div
              v-for="b in recentBookings"
              :key="b.booking_id"
              class="px-5 py-3"
            >
              <div class="flex items-center justify-between mb-1">
                <p class="font-medium text-slate-900 text-sm">{{ b.booking_code }}</p>
                <span
                  class="text-xs font-medium px-2.5 py-1 rounded-full"
                  :class="statusClass(b.status)"
                >
                  {{ b.status }}
                </span>
              </div>
              <p class="text-xs text-slate-500">{{ b.customer_name }} &middot; {{ b.vehicle_name }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ b.pickup_date }} - {{ b.return_date }}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
import { supabase } from '../../lib/supabase'

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)

const stats = ref({
  customers: 0,
  vehicles: 0,
  bookings: 0,
  pendingBookings: 0
})

interface RecentBooking {
  booking_id: number
  booking_code: string
  customer_name: string
  vehicle_name: string
  pickup_date: string
  return_date: string
  status: string
}

const recentBookings = ref<RecentBooking[]>([])
const isLoading = ref(false)

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const statusClass = (status: string) => {
  switch (status) {
    case 'รออนุมัติ':
      return 'bg-amber-100 text-amber-700'
    case 'อนุมัติแล้ว':
      return 'bg-blue-100 text-blue-700'
    case 'เสร็จสิ้น':
      return 'bg-emerald-100 text-emerald-700'
    case 'ยกเลิก':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const loadData = async () => {
  isLoading.value = true

  try {
    const [customersRes, vehiclesRes, bookingsRes, pendingRes] = await Promise.all([
      supabase.from('customer').select('customer_id', { count: 'exact', head: true }),
      supabase.from('vehicle').select('vehicle_id', { count: 'exact', head: true }),
      supabase.from('booking').select('booking_id', { count: 'exact', head: true }),
      supabase.from('booking').select('booking_id', { count: 'exact', head: true }).eq('status', 'รออนุมัติ')
    ])

    stats.value.customers = customersRes.count ?? 0
    stats.value.vehicles = vehiclesRes.count ?? 0
    stats.value.bookings = bookingsRes.count ?? 0
    stats.value.pendingBookings = pendingRes.count ?? 0

    // ดึงการจองล่าสุด 5 รายการ
    const { data: bookings } = await supabase
      .from('booking')
      .select('booking_id, booking_code, pickup_date, return_date, status, customer_id, vehicle_id')
      .order('booking_id', { ascending: false })
      .limit(5)

    if (bookings && bookings.length > 0) {
      const customerIds = [...new Set(bookings.map(b => b.customer_id))]
      const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id))]

      const [customersData, vehiclesData] = await Promise.all([
        supabase.from('customer').select('customer_id, name').in('customer_id', customerIds),
        supabase.from('vehicle').select('vehicle_id, brand, model').in('vehicle_id', vehicleIds)
      ])

      const customerMap = new Map((customersData.data ?? []).map(c => [c.customer_id, c.name]))
      const vehicleMap = new Map((vehiclesData.data ?? []).map(v => [v.vehicle_id, `${v.brand} ${v.model}`]))

      recentBookings.value = bookings.map(b => ({
        booking_id: b.booking_id,
        booking_code: b.booking_code,
        customer_name: customerMap.get(b.customer_id) ?? '-',
        vehicle_name: vehicleMap.get(b.vehicle_id) ?? '-',
        pickup_date: b.pickup_date,
        return_date: b.return_date,
        status: b.status
      }))
    }
  } catch (err) {
    console.error('Load dashboard error:', err)
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  await logoutAdmin()
  router.push('/signin')
}

onMounted(async () => {
  admin.value = await getCurrentAdmin()
  if (!admin.value) {
    router.push('/signin')
    return
  }
  loadData()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
