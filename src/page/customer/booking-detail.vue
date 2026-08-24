<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3">
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        รายละเอียดการจอง
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
      กำลังโหลดข้อมูล...
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-16 px-6">
      {{ errorMessage }}
    </div>

    <div v-else-if="booking" class="w-full max-w-md mx-auto px-4 pt-6">

      <!-- Status Icon + Heading -->
      <div class="flex flex-col items-center text-center mb-6">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center mb-3"
          :class="statusDisplay.iconBg"
        >
          <i class="fa-solid text-2xl text-white" :class="statusDisplay.icon"></i>
        </div>
        <h1 class="text-lg font-bold text-slate-900">{{ statusDisplay.heading }}</h1>
        <p class="text-xs text-slate-400 mt-1">รหัสการจองของคุณ: {{ booking.booking_code }}</p>
      </div>

      <!-- Vehicle Card -->
      <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="w-full h-40 bg-slate-200 rounded-xl overflow-hidden mb-4">
          <img
            v-if="booking.vehicle?.image"
            :src="booking.vehicle.image"
            :alt="`${booking.vehicle.brand} ${booking.vehicle.model}`"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <i class="fa-solid fa-motorcycle text-3xl"></i>
          </div>
        </div>

        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">
              {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ booking.vehicle?.engine_size ?? '-' }} cc {{ booking.vehicle?.vehicle_type || '' }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs text-slate-400">ราคารวม</p>
            <p class="text-base font-bold text-slate-900">฿{{ formatPrice(booking.rental_price) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <i class="fa-regular fa-calendar"></i> วันรับรถ
            </p>
            <p class="text-sm font-bold text-slate-900">{{ formatDateTh(booking.pickup_date) }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <i class="fa-regular fa-calendar"></i> วันคืนรถ
            </p>
            <p class="text-sm font-bold text-slate-900">{{ formatDateTh(booking.return_date) }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-2 text-center">ระยะเวลาเช่า {{ rentalDays }} วัน</p>
      </section>

      <!-- คำแนะนำการรับรถและคืนรถ -->
      <section class="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <div class="flex items-start gap-2">
          <i class="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
          <div>
            <h3 class="text-sm font-bold text-slate-900 mb-1.5">คำแนะนำการรับรถและคืนรถ</h3>
            <ul class="text-xs text-slate-600 leading-relaxed space-y-1 list-disc pl-4">
              <li>กรุณาเตรียมบัตรประชาชนและใบอนุญาตขับขี่ตัวจริงมาแสดงตอนรับรถ</li>
              <li>ตรวจสอบสภาพรถและอุปกรณ์ต่างๆ ร่วมกับพนักงานก่อนรับรถทุกครั้ง</li>
              <li>คืนรถตามวันและเวลาที่กำหนด หากคืนล่าช้าจะมีค่าปรับตามอัตราที่บริษัทกำหนด</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="space-y-3 mb-6">
        <button
          type="button"
          @click="handleDownloadCertificate"
          :disabled="normalizeStatus(booking.status) !== 'อนุมัติแล้ว'"
          class="w-full bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <i class="fa-solid fa-download"></i>
          <span>ดาวน์โหลดใบรับรองการจอง</span>
        </button>
        <p v-if="normalizeStatus(booking.status) !== 'อนุมัติแล้ว'" class="text-xs text-slate-400 text-center -mt-1.5">
          ดาวน์โหลดใบรับรองได้เมื่อสถานะเป็น "ยืนยันแล้ว" เท่านั้น
        </p>

        <button
          v-if="canCancel"
          type="button"
          @click="handleCancelBooking"
          :disabled="isCancelling"
          class="w-full bg-white text-red-500 font-medium py-3 px-4 rounded-xl border border-red-200 disabled:opacity-50 transition-all active:scale-[0.99]"
        >
          {{ isCancelling ? 'กำลังยกเลิก...' : 'ยกเลิกการจอง' }}
        </button>

        <button
          type="button"
          @click="router.push('/home')"
          class="w-full bg-white text-slate-600 font-medium py-3 px-4 rounded-xl border border-slate-200 transition-all active:scale-[0.99]"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>

    </div>
  </div>

  <BottomNavigation active="bookings" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNavigation from '../../components/BottomNavigation.vue'
import {
  getBookingDetail,
  cancelBookingRecord,
  calcRentalDays,
  normalizeStatus,
  type BookingWithVehicle
} from '../../services/bookingService'

const route = useRoute()
const router = useRouter()

const booking = ref<BookingWithVehicle | null>(null)
const isLoading = ref(false)
const isCancelling = ref(false)
const errorMessage = ref('')

const rentalDays = computed(() =>
  booking.value ? calcRentalDays(booking.value.pickup_date, booking.value.return_date) : 0
)

const canCancel = computed(() =>
  booking.value ? ['รออนุมัติ', 'อนุมัติแล้ว'].includes(normalizeStatus(booking.value.status)) : false
)

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const formatDateTh = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

const statusDisplay = computed(() => {
  const status = booking.value ? normalizeStatus(booking.value.status) : ''
  switch (status) {
    case 'อนุมัติแล้ว':
      return { heading: 'การจองเสร็จสมบูรณ์!', icon: 'fa-check', iconBg: 'bg-emerald-500' }
    case 'รออนุมัติ':
      return { heading: 'กำลังรอการอนุมัติ', icon: 'fa-clock', iconBg: 'bg-amber-500' }
    case 'เสร็จสิ้น':
      return { heading: 'การเช่าสิ้นสุดแล้ว', icon: 'fa-flag-checkered', iconBg: 'bg-slate-500' }
    case 'ยกเลิก':
      return { heading: 'การจองถูกยกเลิก', icon: 'fa-xmark', iconBg: 'bg-red-500' }
    default:
      return { heading: 'รายละเอียดการจอง', icon: 'fa-circle-info', iconBg: 'bg-slate-400' }
  }
})

const loadBooking = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const bookingId = Number(route.params.id)

  try {
    const data = await getBookingDetail(bookingId)
    if (!data) {
      errorMessage.value = 'ไม่พบรายการจองนี้'
      return
    }
    booking.value = data
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

const handleCancelBooking = async () => {
  if (!booking.value) return
  const confirmed = window.confirm('ยืนยันยกเลิกการจองนี้หรือไม่?')
  if (!confirmed) return

  isCancelling.value = true
  try {
    await cancelBookingRecord(booking.value.booking_id)
    // โหลดข้อมูลใหม่จาก DB จริงๆ แทนการเดาแก้ค่าใน local state
    // เพื่อให้ UI ตรงกับความจริงเสมอ และเห็น error ชัดเจนถ้า RLS บล็อกการ update
    await loadBooking()
  } catch (err) {
    const message =
      err instanceof Error
        ? `ยกเลิกการจองไม่สำเร็จ: ${err.message}`
        : 'ยกเลิกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    alert(message)
  } finally {
    isCancelling.value = false
  }
}

// สร้างใบรับรองการจองเป็น PDF แล้วดาวน์โหลด (ต้องติดตั้ง jspdf ก่อน: npm install jspdf)
const handleDownloadCertificate = async () => {
  if (!booking.value || normalizeStatus(booking.value.status) !== 'อนุมัติแล้ว') return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Booking Certificate / ใบรับรองการจอง', 20, 20)

  doc.setFontSize(11)
  const lines = [
    `Booking Code: ${booking.value.booking_code}`,
    `Vehicle: ${booking.value.vehicle?.brand} ${booking.value.vehicle?.model}`,
    `Pickup Date: ${booking.value.pickup_date}`,
    `Return Date: ${booking.value.return_date}`,
    `Rental Days: ${rentalDays.value}`,
    `Deposit Paid: ${booking.value.deposit_price} THB`,
    `Total Rental Price: ${booking.value.rental_price} THB`,
    `Status: ${booking.value.status}`
  ]

  lines.forEach((line, i) => {
    doc.text(line, 20, 40 + i * 8)
  })

  doc.save(`booking-${booking.value.booking_code}.pdf`)
}

onMounted(() => {
  loadBooking()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>