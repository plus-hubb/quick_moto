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
          <p class="text-sm font-medium text-slate-900">รออนุมัติ</p>
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
        <template v-if="!selectedBooking">

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            <span class="text-slate-600 font-medium">รออนุมัติ</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายการจองรออนุมัติ</h1>
            <span v-if="bookings.length > 0" class="text-xs text-slate-400">{{ bookings.length }} รายการ</span>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
            กำลังโหลดข้อมูล...
          </div>

          <!-- Empty -->
          <div v-else-if="bookings.length === 0" class="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            ไม่มีรายการจองรออนุมัติ
          </div>

          <!-- Desktop Table -->
          <div v-else class="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs">
                  <th class="text-left font-medium px-5 py-3">รหัสจอง</th>
                  <th class="text-left font-medium px-5 py-3">ลูกค้า</th>
                  <th class="text-left font-medium px-5 py-3">รถ</th>
                  <th class="text-left font-medium px-5 py-3">วันรับ-คืน</th>
                  <th class="text-left font-medium px-5 py-3">มัดจำ</th>
                  <th class="text-right font-medium px-5 py-3">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="b in bookings"
                  :key="b.booking_id"
                  class="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td class="px-5 py-3 font-medium text-slate-900">{{ b.booking_code }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.customer_name }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.vehicle_brand }} {{ b.vehicle_model }}</td>
                  <td class="px-5 py-3 text-slate-600 text-xs">{{ b.pickup_date }} - {{ b.return_date }}</td>
                  <td class="px-5 py-3 text-slate-900 font-medium">฿{{ formatPrice(b.deposit_price) }}</td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        @click="selectBooking(b)"
                        class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="!isLoading && bookings.length > 0" class="md:hidden space-y-3">
            <div
              v-for="b in bookings"
              :key="b.booking_id"
              class="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-bold text-slate-900">{{ b.booking_code }}</p>
                  <p class="text-xs text-slate-400">{{ b.customer_name }}</p>
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  รออนุมัติ
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ b.vehicle_brand }} {{ b.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-1">{{ b.pickup_date }} - {{ b.return_date }}</p>
              <p class="text-sm font-bold text-slate-900 mb-3">มัดจำ ฿{{ formatPrice(b.deposit_price) }}</p>
              <button
                type="button"
                @click="selectBooking(b)"
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
            รออนุมัติ
            <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
            <span class="text-slate-600 font-medium">{{ selectedBooking.booking_code }}</span>
          </p>

          <!-- Back + Header -->
          <div class="flex items-center gap-3 mb-6">
            <button
              type="button"
              @click="selectedBooking = null"
              class="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
            >
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายละเอียดการจอง</h1>
          </div>

          <!-- รายละเอียดการจอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-slate-900">ข้อมูลการจอง</h2>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                รออนุมัติ
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">รหัสจอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.booking_code }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.booking_date }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">รถที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.vehicle_brand }} {{ selectedBooking.vehicle_model }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันรับรถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.pickup_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันคืนรถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.return_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ค่าเช่า</p>
                <p class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.rental_price) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">มัดจำ</p>
                <p class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.deposit_price) }}</p>
              </div>
            </div>
          </div>

          <!-- ข้อมูลผู้จอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลผู้จอง</h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ชื่อ-นามสกุล</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เบอร์โทรศัพท์</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_phone }}</p>
              </div>
            </div>
          </div>

          <!-- ปุ่มดำเนินการ -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="handleReject"
              :disabled="isProcessing"
              class="flex-1 bg-white border-2 border-red-200 text-red-600 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-red-50 active:scale-[0.99] disabled:opacity-50"
            >
              <template v-if="isProcessing">
                <i class="fa-solid fa-spinner fa-spin text-sm"></i>
              </template>
              <template v-else>
                <i class="fa-solid fa-xmark text-sm"></i>
              </template>
              <span>ยกเลิก</span>
            </button>

            <button
              type="button"
              @click="handleApprove"
              :disabled="isProcessing"
              class="flex-1 bg-[#051329] hover:bg-[#0a1f3d] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <template v-if="isProcessing">
                <i class="fa-solid fa-spinner fa-spin text-sm"></i>
              </template>
              <template v-else>
                <i class="fa-solid fa-check text-sm"></i>
              </template>
              <span>อนุมัติ</span>
            </button>
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
import {
  getPendingApprovals,
  approveBooking,
  rejectBooking
} from '../../services/deliveryReturnService'
import type { BookingWithDetails } from '../../services/deliveryReturnService'

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)
const isProcessing = ref(false)

const bookings = ref<BookingWithDetails[]>([])
const selectedBooking = ref<BookingWithDetails | null>(null)

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const loadData = async () => {
  isLoading.value = true
  try {
    bookings.value = await getPendingApprovals()
  } catch (err) {
    console.error('Load pending approvals error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectBooking = (b: BookingWithDetails) => {
  selectedBooking.value = b
}

const handleApprove = async () => {
  if (!selectedBooking.value || isProcessing.value) return

  const confirmed = window.confirm(
    `ยืนยันอนุมัติการจอง ${selectedBooking.value.booking_code}?`
  )
  if (!confirmed) return

  isProcessing.value = true

  try {
    await approveBooking(selectedBooking.value.booking_id)
    alert('อนุมัติสำเร็จ! รายการจะย้ายไป "รอส่งมอบ"')
    selectedBooking.value = null
    await loadData()
  } catch (err) {
    console.error('Approve error:', err)
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
    alert(`อนุมัติไม่สำเร็จ: ${message}`)
  } finally {
    isProcessing.value = false
  }
}

const handleReject = async () => {
  if (!selectedBooking.value || isProcessing.value) return

  const confirmed = window.confirm(
    `ยืนยันยกเลิกการจอง ${selectedBooking.value.booking_code}?`
  )
  if (!confirmed) return

  isProcessing.value = true

  try {
    await rejectBooking(selectedBooking.value.booking_id)
    alert('ยกเลิกการจองสำเร็จ')
    selectedBooking.value = null
    await loadData()
  } catch (err) {
    console.error('Reject error:', err)
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
    alert(`ยกเลิกไม่สำเร็จ: ${message}`)
  } finally {
    isProcessing.value = false
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
