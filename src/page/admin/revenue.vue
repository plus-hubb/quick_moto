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
          <p class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-chart-line text-slate-400"></i>
            รายงานรายได้
          </p>
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

      <main class="p-4 sm:p-6">

        <!-- Breadcrumb -->
        <p class="text-xs text-slate-400 mb-1">
          <span class="text-slate-600 font-medium">รายงานรายได้</span>
        </p>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายงานรายได้</h1>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
          กำลังโหลดข้อมูล...
        </div>

        <template v-else>

          <!-- Summary Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <!-- ค่ามัดจำ -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <i class="fa-solid fa-coins text-amber-500 text-sm"></i>
                </div>
                <p class="text-xs text-slate-500">ค่ามัดจำที่ได้</p>
              </div>
              <p class="text-xl font-bold text-slate-900">฿{{ formatPrice(revenue.totalDeposit) }}</p>
              <p class="text-[10px] text-slate-400 mt-1">จากรายการที่ลูกค้ายกเลิก / ไม่มารับรถ</p>
            </div>

            <!-- ค่าเช่า -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <i class="fa-solid fa-money-bill text-emerald-500 text-sm"></i>
                </div>
                <p class="text-xs text-slate-500">ค่าเช่าที่ได้</p>
              </div>
              <p class="text-xl font-bold text-slate-900">฿{{ formatPrice(revenue.totalRental) }}</p>
              <p class="text-[10px] text-slate-400 mt-1">จากรายการเช่าที่เสร็จสิ้น</p>
            </div>

            <!-- ค่าปรับ -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                  <i class="fa-solid fa-gavel text-rose-500 text-sm"></i>
                </div>
                <p class="text-xs text-slate-500">ค่าปรับที่ได้</p>
              </div>
              <p class="text-xl font-bold text-slate-900">฿{{ formatPrice(revenue.totalPenalty) }}</p>
              <p class="text-[10px] text-slate-400 mt-1">ค่าปรับความเสียหาย / คืนล่าช้า</p>
            </div>

            <!-- รายได้รวม -->
            <div class="bg-[#051329] rounded-2xl p-5 shadow-sm text-white">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <i class="fa-solid fa-chart-line text-white text-sm"></i>
                </div>
                <p class="text-xs text-white/70">รายได้รวมทั้งหมด</p>
              </div>
              <p class="text-xl font-bold">฿{{ formatPrice(revenue.totalRevenue) }}</p>
              <p class="text-[10px] text-white/50 mt-1">ทุกรายการที่นับเป็นรายได้</p>
            </div>

          </div>

          <!-- Monthly Table -->
          <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-100">
              <h2 class="text-sm font-bold text-slate-900">รายได้รายเดือน</h2>
            </div>

            <!-- Empty -->
            <div v-if="revenue.monthly.length === 0" class="text-center text-slate-400 text-sm py-10">
              ยังไม่มีรายได้
            </div>

            <!-- Desktop Table -->
            <table v-else class="w-full text-sm hidden md:table">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs">
                  <th class="text-left font-medium px-5 py-3">เดือน</th>
                  <th class="text-right font-medium px-5 py-3">จำนวนรายการ</th>
                  <th class="text-right font-medium px-5 py-3">ค่ามัดจำ</th>
                  <th class="text-right font-medium px-5 py-3">ค่าเช่า</th>
                  <th class="text-right font-medium px-5 py-3">ค่าปรับ</th>
                  <th class="text-right font-medium px-5 py-3">รายได้รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="m in revenue.monthly"
                  :key="m.month"
                  class="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td class="px-5 py-3 font-medium text-slate-900">{{ m.label }}</td>
                  <td class="px-5 py-3 text-slate-600 text-right">{{ m.count }}</td>
                  <td class="px-5 py-3 text-slate-600 text-right">฿{{ formatPrice(m.deposit) }}</td>
                  <td class="px-5 py-3 text-slate-600 text-right">฿{{ formatPrice(m.rental) }}</td>
                  <td class="px-5 py-3 text-slate-600 text-right">฿{{ formatPrice(m.penalty) }}</td>
                  <td class="px-5 py-3 text-right">
                    <span class="font-bold text-slate-900">฿{{ formatPrice(m.total) }}</span>
                  </td>
                </tr>
              </tbody>
              <!-- Total Row -->
              <tfoot>
                <tr class="bg-slate-50 border-t-2 border-slate-200">
                  <td class="px-5 py-3 font-bold text-slate-900">รวมทั้งหมด</td>
                  <td class="px-5 py-3 text-right font-medium text-slate-600">{{ totalCount }}</td>
                  <td class="px-5 py-3 text-right font-medium text-slate-600">฿{{ formatPrice(revenue.totalDeposit) }}</td>
                  <td class="px-5 py-3 text-right font-medium text-slate-600">฿{{ formatPrice(revenue.totalRental) }}</td>
                  <td class="px-5 py-3 text-right font-medium text-slate-600">฿{{ formatPrice(revenue.totalPenalty) }}</td>
                  <td class="px-5 py-3 text-right font-bold text-[#051329]">฿{{ formatPrice(revenue.totalRevenue) }}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Mobile Cards -->
            <div v-if="revenue.monthly.length > 0" class="md:hidden divide-y divide-slate-100">
              <div
                v-for="m in revenue.monthly"
                :key="m.month"
                class="px-5 py-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <p class="font-bold text-slate-900">{{ m.label }}</p>
                  <span class="text-xs text-slate-400">{{ m.count }} รายการ</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p class="text-slate-400">ค่ามัดจำ</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(m.deposit) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">ค่าเช่า</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(m.rental) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">ค่าปรับ</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(m.penalty) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">รายได้รวม</p>
                    <p class="font-bold text-[#051329]">฿{{ formatPrice(m.total) }}</p>
                  </div>
                </div>
              </div>

              <!-- Mobile Total -->
              <div class="px-5 py-4 bg-slate-50">
                <p class="font-bold text-slate-900 mb-2">รวมทั้งหมด</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p class="text-slate-400">ค่ามัดจำ</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(revenue.totalDeposit) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">ค่าเช่า</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(revenue.totalRental) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">ค่าปรับ</p>
                    <p class="font-medium text-slate-700">฿{{ formatPrice(revenue.totalPenalty) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-400">รายได้รวม</p>
                    <p class="font-bold text-[#051329]">฿{{ formatPrice(revenue.totalRevenue) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </template>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
import { getRevenueData, type RevenueSummary } from '../../services/revenueService'

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)

const revenue = ref<RevenueSummary>({
  totalDeposit: 0,
  totalRental: 0,
  totalPenalty: 0,
  totalRevenue: 0,
  monthly: []
})

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const totalCount = computed(() =>
  revenue.value.monthly.reduce((sum, m) => sum + m.count, 0)
)

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const loadData = async () => {
  isLoading.value = true
  try {
    revenue.value = await getRevenueData()
  } catch (err) {
    console.error('Load revenue error:', err)
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
