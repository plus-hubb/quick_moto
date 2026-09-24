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
            <i class="fa-solid fa-money-bill-transfer text-emerald-500"></i>
            คืนเงินแล้ว
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

        <!-- ====== _LIST VIEW ====== -->
        <template v-if="!selectedRefund">

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            <span class="text-slate-600 font-medium">คืนเงินแล้ว</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายการที่คืนเงินแล้ว</h1>
            <span v-if="filteredRefunds.length > 0" class="text-xs text-slate-400">{{ filteredRefunds.length }} รายการ</span>
          </div>

          <!-- Search -->
          <div class="relative mb-5">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="ค้นหาด้วยรหัสจอง ชื่อลูกค้า เบอร์โทร ทะเบียนรถ หรือรุ่นรถ..."
              class="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            />
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
            กำลังโหลดข้อมูล...
          </div>

          <!-- Empty -->
          <div v-else-if="filteredRefunds.length === 0" class="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            {{ searchKeyword ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการที่คืนเงิน' }}
          </div>

          <!-- Desktop Table -->
          <div v-if="filteredRefunds.length > 0" class="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs">
                  <th class="text-left font-medium px-5 py-3">รหัสจอง</th>
                  <th class="text-left font-medium px-5 py-3">ลูกค้า</th>
                  <th class="text-left font-medium px-5 py-3">รถ</th>
                  <th class="text-left font-medium px-5 py-3">วันที่คืนเงิน</th>
                  <th class="text-right font-medium px-5 py-3">ยอดคืนเงิน</th>
                  <th class="text-right font-medium px-5 py-3">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="r in filteredRefunds"
                  :key="r.booking_id"
                  class="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td class="px-5 py-3 font-medium text-slate-900">{{ r.booking_code }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ r.customer_name }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ r.vehicle_brand }} {{ r.vehicle_model }}</td>
                  <td class="px-5 py-3 text-slate-600 text-xs">{{ formatDateTime(r.refund?.refund_date) }}</td>
                  <td class="px-5 py-3 text-right font-bold text-emerald-600">฿{{ formatPrice(r.refund?.amount ?? 0) }}</td>
                  <td class="px-5 py-3 text-right">
                    <button
                      type="button"
                      @click="selectRefund(r)"
                      class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="!isLoading && filteredRefunds.length > 0" class="md:hidden space-y-3">
            <div
              v-for="r in filteredRefunds"
              :key="r.booking_id"
              class="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-bold text-slate-900">{{ r.booking_code }}</p>
                  <p class="text-xs text-slate-400">{{ r.customer_name }}</p>
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  คืนเงิน ฿{{ formatPrice(r.refund?.amount ?? 0) }}
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ r.vehicle_brand }} {{ r.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-2">{{ formatDateTime(r.refund?.refund_date) }}</p>
              <button
                type="button"
                @click="selectRefund(r)"
                class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium py-2.5 rounded-xl transition-all"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>

        </template>

        <!-- ====== _DETAIL VIEW ====== -->
        <template v-else>

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            คืนเงินแล้ว
            <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
            <span class="text-slate-600 font-medium">{{ selectedRefund.booking_code }}</span>
          </p>

          <!-- Back + Header -->
          <div class="flex items-center gap-3 mb-6">
            <button
              type="button"
              @click="selectedRefund = null"
              class="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
            >
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายละเอียดการคืนเงิน</h1>
          </div>

          <!-- ข้อมูลการจอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-slate-900">ข้อมูลการจอง</h2>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                คืนเงินแล้ว
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">รหัสจอง</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.booking_code }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.booking_date }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">รถที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.vehicle_brand }} {{ selectedRefund.vehicle_model }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันรับรถ</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.pickup_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันคืนรถ</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.return_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เงินมัดจำ</p>
                <p class="font-medium text-slate-900">฿{{ formatPrice(selectedRefund.deposit_price) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เหตุผลยกเลิก</p>
                <p class="font-medium text-red-600">{{ getCancelLabel(selectedRefund.cancel_reason) }}</p>
              </div>
              <div v-if="selectedRefund.cancel_note" class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">หมายเหตุ</p>
                <p class="font-medium text-slate-900 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">{{ selectedRefund.cancel_note }}</p>
              </div>
            </div>
          </div>

          <!-- ข้อมูลผู้จอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลผู้จอง</h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ชื่อ-นามสกุล</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.customer_name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เบอร์โทรศัพท์</p>
                <p class="font-medium text-slate-900">{{ selectedRefund.customer_phone }}</p>
              </div>
            </div>
          </div>

          <!-- ข้อมูลการคืนเงิน -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลการคืนเงิน</h2>
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่คืนเงิน</p>
                <p class="font-medium text-slate-900">{{ formatDateTime(selectedRefund.refund?.refund_date) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">จำนวนเงิน</p>
                <p class="font-medium text-emerald-600">฿{{ formatPrice(selectedRefund.refund?.amount ?? 0) }}</p>
              </div>
            </div>

            <h3 class="text-xs font-bold text-slate-500 mb-2">สลิปการคืนเงิน</h3>
            <div class="rounded-xl overflow-hidden border border-slate-200">
              <img
                v-if="selectedRefund.refund?.refund_slip"
                :src="selectedRefund.refund.refund_slip"
                alt="สลิปการคืนเงิน"
                class="w-full object-contain max-h-96"
                @error="slipImageError = true"
              />
              <p v-else class="text-sm text-slate-400 py-10 text-center">ไม่มีสลิปการคืนเงิน</p>
            </div>
            <p v-if="slipImageError" class="text-xs text-red-500 mt-2">ไม่สามารถโหลดรูปสลิปได้</p>
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
import { getRefundedBookings, type RefundedBooking } from '../../services/refundService'

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)

const refunds = ref<RefundedBooking[]>([])
const selectedRefund = ref<RefundedBooking | null>(null)
const slipImageError = ref(false)
const searchKeyword = ref('')

const filteredRefunds = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return refunds.value
  return refunds.value.filter((r) => {
    const haystack = `${r.booking_code} ${r.customer_name} ${r.customer_phone} ${r.vehicle_brand} ${r.vehicle_model}`.toLowerCase()
    return haystack.includes(keyword)
  })
})

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const formatDateTime = (dateStr?: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCancelLabel = (reason: string | null) => {
  switch (reason) {
    case 'customer_cancel': return 'ลูกค้ายกเลิก'
    case 'admin_reject': return 'Admin ยกเลิก'
    case 'no_show': return 'ไม่มารับรถ'
    case 'auto_expire': return 'หมดอายุ'
    default: return 'ยกเลิก'
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    refunds.value = await getRefundedBookings()
  } catch (err) {
    console.error('Load refunded bookings error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectRefund = (r: RefundedBooking) => {
  selectedRefund.value = r
  slipImageError.value = false
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