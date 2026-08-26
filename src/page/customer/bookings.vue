<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">
    <div class="w-full max-w-md mx-auto px-4 py-6">

      <!-- Header -->
      <header class="mb-5">
        <h1 class="text-2xl font-bold text-slate-900">ประวัติการจองรถจักรยานยนต์</h1>
      </header>

      <!-- Tabs -->
      <div class="bg-white rounded-xl p-1 flex gap-1 mb-6 shadow-sm border border-slate-100">
        <button
          type="button"
          @click="activeTab = 'active'"
          :class="[
            'flex-1 text-sm font-medium py-2.5 rounded-lg transition-all',
            activeTab === 'active' ? 'bg-[#051329] text-white' : 'text-slate-500'
          ]"
        >
          การจองที่ใช้งานอยู่
        </button>
        <button
          type="button"
          @click="activeTab = 'history'"
          :class="[
            'flex-1 text-sm font-medium py-2.5 rounded-lg transition-all',
            activeTab === 'history' ? 'bg-[#051329] text-white' : 'text-slate-500'
          ]"
        >
          ประวัติการจองที่เสร็จสิ้น
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center text-slate-400 text-sm py-10">
        กำลังโหลดข้อมูล...
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-10">
        {{ errorMessage }}
      </div>

      <!-- Empty -->
      <div v-else-if="filteredBookings.length === 0" class="text-center text-slate-400 text-sm py-10">
        ไม่มีรายการจองในหมวดนี้
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <div
          v-for="booking in filteredBookings"
          :key="booking.booking_id"
          class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
        >
          <div class="flex gap-3 mb-3">
            <div class="w-20 h-20 bg-slate-200 rounded-xl overflow-hidden shrink-0">
              <img
                v-if="booking.vehicle?.image"
                :src="booking.vehicle.image"
                :alt="`${booking.vehicle.brand} ${booking.vehicle.model}`"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                <i class="fa-solid fa-motorcycle text-xl"></i>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-base font-bold text-slate-900 leading-snug">
                  {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
                </h3>
                <span
                  class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                  :class="statusBadge(booking.status).class"
                >
                  {{ statusBadge(booking.status).label }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ booking.vehicle?.engine_size ?? '-' }} cc {{ booking.vehicle?.vehicle_type || '' }}
              </p>
              <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <i class="fa-regular fa-calendar"></i>
                {{ formatDateTh(booking.pickup_date) }} - {{ formatDateTh(booking.return_date) }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <p class="text-xs text-slate-400">ยอดรวมสุทธิ</p>
              <p class="text-lg font-bold text-slate-900">฿{{ formatPrice(booking.rental_price) }}</p>
            </div>
            <button
              type="button"
              @click="router.push(`/bookings/${booking.booking_id}`)"
              class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all active:scale-[0.98]"
            >
              ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <BottomNavigation active="bookings" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../../components/BottomNavigation.vue'
import { getCurrentCustomer, getCustomerBookings, normalizeStatus, type BookingWithVehicle } from '../../services/bookingService'

const router = useRouter()

const bookings = ref<BookingWithVehicle[]>([])
const activeTab = ref<'active' | 'history'>('active')
const isLoading = ref(false)
const errorMessage = ref('')

// สถานะที่ถือว่ายัง "ใช้งานอยู่" vs "เสร็จสิ้นแล้ว" (รวมยกเลิกไว้ในประวัติด้วย)
const ACTIVE_STATUSES = ['รออนุมัติ', 'อนุมัติแล้ว']
const HISTORY_STATUSES = ['เสร็จสิ้น', 'ยกเลิก']

const filteredBookings = computed(() => {
  const statuses = activeTab.value === 'active' ? ACTIVE_STATUSES : HISTORY_STATUSES
  return bookings.value.filter((b) => statuses.includes(normalizeStatus(b.status)))
})

const statusBadge = (rawStatus: string) => {
  const status = normalizeStatus(rawStatus)
  switch (status) {
    case 'รออนุมัติ':
      return { label: 'กำลังดำเนินการ', class: 'bg-amber-100 text-amber-700' }
    case 'อนุมัติแล้ว':
      return { label: 'ยืนยันแล้ว', class: 'bg-emerald-100 text-emerald-700' }
    case 'เสร็จสิ้น':
      return { label: 'เสร็จสิ้น', class: 'bg-slate-200 text-slate-600' }
    case 'ยกเลิก':
      return { label: 'ยกเลิกแล้ว', class: 'bg-red-100 text-red-600' }
    default:
      return { label: status, class: 'bg-slate-200 text-slate-600' }
  }
}

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const formatDateTh = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

const loadBookings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const customer = await getCurrentCustomer()
    if (!customer) {
      errorMessage.value = 'กรุณาเข้าสู่ระบบก่อน'
      return
    }
    bookings.value = await getCustomerBookings(customer.customer_id)
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadBookings()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>