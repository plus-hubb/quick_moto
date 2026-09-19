<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3 md:py-4 md:px-6 flex items-center gap-3">
      <button type="button" @click="goBack" class="text-white">
        <i class="fa-solid fa-arrow-left text-base"></i>
      </button>
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

    <div v-else-if="booking" class="w-full max-w-2xl mx-auto px-4 pt-6">

      <!-- Status Icon + Heading -->
      <div class="flex flex-col items-center text-center mb-6">
        <div
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3"
          :class="statusDisplay.iconBg"
        >
          <i class="fa-solid text-xl sm:text-2xl text-white" :class="statusDisplay.icon"></i>
        </div>
        <h1 class="text-base sm:text-lg font-bold text-slate-900">{{ statusDisplay.heading }}</h1>
        <p class="text-xs text-slate-400 mt-1">รหัสการจองของคุณ: {{ booking.booking_code }}</p>
      </div>

      <!-- Refund Notice (แสดงเฉพาะเมื่อยกเลิกด้วยเหตุผลที่ต้องขอเงินคืน) -->
      <div
        v-if="showRefundNotice"
        class="rounded-2xl p-4 mb-6 flex items-start gap-3"
        :class="refundNoticeStyle.class"
      >
        <i class="fa-solid text-lg mt-0.5" :class="refundNoticeStyle.iconClass"></i>
        <div class="flex-1">
          <p class="text-sm font-bold" :class="refundNoticeStyle.textClass">{{ refundNoticeStyle.title }}</p>
          <p
            v-if="refundNoticeStyle.message"
            class="text-xs mt-1 opacity-80"
            :class="refundNoticeStyle.textClass"
          >
            {{ refundNoticeStyle.message }}
          </p>
          <router-link
            v-if="showContactLink"
            to="/contact"
            class="inline-flex items-center gap-1.5 mt-2 text-xs font-medium underline"
            :class="refundNoticeStyle.textClass"
          >
            <i class="fa-solid fa-phone"></i>
            ติดต่อเรา
          </router-link>
        </div>
      </div>

      <!-- หมายเหตุการยกเลิก (แสดงเฉพาะเมื่อมี cancel_note) -->
      <div
        v-if="booking.cancel_note"
        class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3"
      >
        <i class="fa-solid fa-message text-amber-500 text-lg mt-0.5"></i>
        <div class="flex-1">
          <p class="text-sm font-bold text-amber-800">หมายเหตุ</p>
          <p class="text-xs text-amber-700 mt-1">{{ booking.cancel_note }}</p>
        </div>
      </div>

      <!-- Vehicle Card -->
      <section class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <div class="w-full h-52 sm:h-64 bg-slate-200 rounded-xl overflow-hidden mb-4">
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
            <h2 class="text-sm sm:text-base font-bold text-slate-900">
              {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              {{ booking.vehicle?.engine_size ?? '-' }} cc {{ booking.vehicle?.vehicle_type || '' }}
            </p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs text-slate-400">ราคารวม</p>
            <p class="text-sm sm:text-base font-bold text-slate-900">฿{{ formatPrice(booking.rental_price) }}</p>
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
        <div v-if="booking.license_plate" class="mt-2 bg-slate-50 rounded-xl p-3 text-center">
          <p class="text-xs text-slate-400 mb-1">เลขทะเบียนรถ</p>
          <p class="text-sm font-bold text-slate-900">{{ booking.license_plate }}</p>
        </div>
        <div v-if="booking.accommodation" class="mt-2 bg-slate-50 rounded-xl p-3 text-center">
          <p class="text-xs text-slate-400 mb-1">ที่พัก</p>
          <p class="text-sm font-bold text-slate-900">{{ booking.accommodation }}</p>
        </div>
      </section>

      <!-- ค่าปรับ (แสดงเฉพาะเมื่อมี) -->
      <section v-if="penalty && penalty.total_penalty > 0" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
        <h3 class="text-sm font-bold text-slate-900 mb-3">
          <i class="fa-solid fa-circle-exclamation text-red-500 mr-1"></i>
          ค่าปรับ
        </h3>
        <div class="space-y-2">
          <div v-if="penalty.damage" class="text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-600">มีความเสียหาย</span>
              <span class="font-medium text-slate-900">฿{{ formatPrice(penalty.damage_fee) }}</span>
            </div>
            <p v-if="penalty.damage_note" class="text-xs text-slate-400 mt-0.5">{{ penalty.damage_note }}</p>
          </div>
          <div v-if="penalty.late_return" class="text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-600">คืนรถล่าช้า</span>
              <span class="font-medium text-slate-900">฿{{ formatPrice(penalty.late_fee) }}</span>
            </div>
            <p v-if="penalty.late_note" class="text-xs text-slate-400 mt-0.5">{{ penalty.late_note }}</p>
          </div>
          <div v-if="penalty.missing_item" class="text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-600">อุปกรณ์หาย / ไม่ครบ</span>
              <span class="font-medium text-slate-900">฿{{ formatPrice(penalty.missing_item_fee) }}</span>
            </div>
            <p v-if="penalty.missing_item_note" class="text-xs text-slate-400 mt-0.5">{{ penalty.missing_item_note }}</p>
          </div>
          <div class="bg-red-50 rounded-xl p-3 flex items-center justify-between mt-2">
            <span class="text-sm font-medium text-red-700">ยอดค่าปรับรวม</span>
            <span class="text-lg font-bold text-red-700">฿{{ formatPrice(penalty.total_penalty) }}</span>
          </div>
        </div>
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
          :disabled="!canDownload"
          class="w-full bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <i class="fa-solid fa-download"></i>
          <span>ดาวน์โหลดใบรับรองการจอง</span>
        </button>

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

  <!-- Cancel Note Modal -->
  <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl w-full max-w-md p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-1">ยืนยันยกเลิกการจอง</h3>
      <p class="text-sm text-slate-500 mb-4">รหัส: {{ booking?.booking_code }}</p>
      <div class="mb-4">
        <label class="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุ <span class="text-xs text-slate-400">(ไม่บังคับ)</span></label>
        <textarea
          v-model="cancelNote"
          rows="3"
          placeholder="เช่น เปลี่ยนวันไม่ได้, ไม่ต้องการเช่าแล้ว..."
          class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all resize-none"
        ></textarea>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          @click="showCancelModal = false; cancelNote = ''"
          class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all active:scale-[0.98]"
        >
          กลับ
        </button>
        <button
          type="button"
          @click="confirmCancel"
          :disabled="isCancelling"
          class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          {{ isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก' }}
        </button>
      </div>
    </div>
  </div>
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
import { getPenaltyByBookingId, type Penalty } from '../../services/deliveryReturnService'

const route = useRoute()
const router = useRouter()

const goBack = () => {
  router.back()
}

const booking = ref<BookingWithVehicle | null>(null)
const penalty = ref<Penalty | null>(null)
const isLoading = ref(false)
const isCancelling = ref(false)
const errorMessage = ref('')
const showCancelModal = ref(false)
const cancelNote = ref('')

const rentalDays = computed(() =>
  booking.value ? calcRentalDays(booking.value.pickup_date, booking.value.return_date) : 0
)

const canCancel = computed(() =>
  booking.value ? ['รออนุมัติ', 'อนุมัติแล้ว'].includes(normalizeStatus(booking.value.status)) : false
)

const canDownload = computed(() => {
  if (!booking.value) return false
  const status = normalizeStatus(booking.value.status)
  return ['อนุมัติแล้ว', 'กำลังเช่า', 'เสร็จสิ้น', 'ยกเลิก'].includes(status)
})

const showRefundNotice = computed(() => {
  if (!booking.value) return false
  const status = normalizeStatus(booking.value.status)
  if (status !== 'ยกเลิก') return false
  const reason = booking.value.cancel_reason
  // no_show = ไม่คืนเงิน ส่วน admin_reject/auto_expire = ขอคืนเงินได้
  if (reason === 'no_show') return true
  return reason === 'admin_reject' || reason === 'auto_expire' || reason === null || reason === ''
})

const refundNoticeStyle = computed(() => {
  const reason = booking.value?.cancel_reason
  if (reason === 'no_show') {
    return {
      class: 'bg-red-50 border border-red-200',
      iconClass: 'fa-user-xmark text-red-500',
      textClass: 'text-red-800',
      title: 'ไม่มารับรถภายในวันที่เช่า',
      message: 'ลูกค้าไม่ได้มารับรถตามวันที่ระบุในการจอง การจองจึงถูกยกเลิกโดยอัตโนมัติ ไม่มีการคืนเงิน'
    }
  }
  if (reason === 'auto_expire') {
    return {
      class: 'bg-amber-50 border border-amber-200',
      iconClass: 'fa-clock text-amber-500',
      textClass: 'text-amber-800',
      title: 'การจองหมดอายุ',
      message: 'การจองของคุณถูกยกเลิกอัตโนมัติเนื่องจากไม่ได้รับการอนุมัติภายในเวลาที่กำหนด กรุณาติดต่อร้านเพื่อขอเงินมัดจำคืน'
    }
  }
  return {
    class: 'bg-red-50 border border-red-200',
    iconClass: 'fa-circle-exclamation text-red-500',
    textClass: 'text-red-800',
    title: 'การจองถูกยกเลิก',
    message: 'การจองนี้ถูกยกเลิกโดยผู้ดูแลระบบ กรุณาติดต่อร้านเพื่อขอเงินมัดจำคืน'
  }
})

const showContactLink = computed(() => {
  const reason = booking.value?.cancel_reason
  return reason !== 'no_show'
})

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const formatDateTh = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

const statusDisplay = computed(() => {
  const status = booking.value ? normalizeStatus(booking.value.status) : ''
  switch (status) {
    case 'อนุมัติแล้ว':
      return { heading: 'การจองเสร็จสมบูรณ์!', icon: 'fa-check', iconBg: 'bg-emerald-500' }
    case 'กำลังเช่า':
      return { heading: 'กำลังเช่ารถ', icon: 'fa-motorcycle', iconBg: 'bg-blue-500' }
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

    if (normalizeStatus(data.status) === 'เสร็จสิ้น') {
      penalty.value = await getPenaltyByBookingId(bookingId)
    }
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

const handleCancelBooking = async () => {
  if (!booking.value) return
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!booking.value) return

  isCancelling.value = true
  try {
    await cancelBookingRecord(booking.value.booking_id, cancelNote.value || undefined)
    showCancelModal.value = false
    cancelNote.value = ''
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

// สร้างใบรับรองการจองเป็น PDF แล้วดาวน์โหลด
const handleDownloadCertificate = async () => {
  if (!booking.value || !canDownload.value) return

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const navy: [number, number, number] = [15, 23, 42]
  const white: [number, number, number] = [255, 255, 255]
  const gray50: [number, number, number] = [248, 250, 252]
  const gray300: [number, number, number] = [203, 213, 225]
  const gray500: [number, number, number] = [100, 116, 139]
  const gray900: [number, number, number] = [15, 23, 42]

  // ===== BACKGROUND =====
  doc.setFillColor(...gray50)
  doc.rect(0, 0, pageW, pageH, 'F')

  // ===== HEADER BAR =====
  doc.setFillColor(...navy)
  doc.rect(0, 0, pageW, 50, 'F')

  // แถบไฮไลท์บางๆ ด้านล่าง header
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 50, pageW, 1.5, 'F')

  // ชื่อร้าน
  doc.setTextColor(...white)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('QUICK MOTO', 25, 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('MOTORCYCLE RENTAL SERVICE', 25, 30)

  // หัวข้อใบรับรอง
  doc.setTextColor(...white)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BOOKING CERTIFICATE', 25, 45)

  // ===== STATUS BADGE =====
  const status = normalizeStatus(booking.value.status)
  let statusLabel: string
  let badgeColor: [number, number, number]

  if (status === 'อนุมัติแล้ว') {
    statusLabel = 'APPROVED'
    badgeColor = [34, 197, 94]
  } else if (status === 'กำลังเช่า') {
    statusLabel = 'RENTING'
    badgeColor = [59, 130, 246]
  } else if (status === 'เสร็จสิ้น') {
    statusLabel = 'COMPLETED'
    badgeColor = [100, 116, 139]
  } else if (status === 'ยกเลิก') {
    statusLabel = 'CANCELLED'
    badgeColor = [239, 68, 68]
  } else {
    statusLabel = status.toUpperCase()
    badgeColor = [100, 116, 139]
  }

  const badgePad = 4
  const badgeW = doc.getStringUnitWidth(statusLabel) * 10 / doc.internal.scaleFactor + badgePad * 2
  const badgeX = pageW - badgeW - 25
  doc.setFillColor(...badgeColor)
  doc.roundedRect(badgeX, 38, badgeW, 9, 2, 2, 'F')
  doc.setTextColor(...white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(statusLabel, badgeX + badgeW / 2, 44.5, { align: 'center' })

  // ===== BOOKING CODE =====
  let y = 62
  doc.setFillColor(...white)
  doc.roundedRect(25, y, pageW - 50, 16, 2, 2, 'F')
  doc.setDrawColor(...gray300)
  doc.setLineWidth(0.3)
  doc.roundedRect(25, y, pageW - 50, 16, 2, 2, 'S')

  doc.setTextColor(...gray500)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('BOOKING CODE', 30, y + 5.5)
  doc.setTextColor(...gray900)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(booking.value.booking_code, 30, y + 12)

  // ===== DETAILS SECTION =====
  y += 24

  // เส้นคั่น
  doc.setDrawColor(...gray300)
  doc.setLineWidth(0.2)
  doc.line(25, y, pageW - 25, y)

  const fieldGap = 18
  const drawRow = (label1: string, val1: string, label2: string, val2: string, yPos: number) => {
    doc.setTextColor(...gray500)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label1, 30, yPos)
    doc.setTextColor(...gray900)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(val1, 30, yPos + 5)
    doc.setTextColor(...gray500)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(label2, pageW / 2 + 5, yPos)
    doc.setTextColor(...gray900)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(val2, pageW / 2 + 5, yPos + 5)
  }

  y += 6
  drawRow(
    'RENTER NAME', booking.value.customer?.name || '-',
    'PHONE', booking.value.customer?.phone || '-',
    y
  )

  y += fieldGap
  doc.line(25, y, pageW - 25, y)

  y += 5
  drawRow(
    'VEHICLE', `${booking.value.vehicle?.brand} ${booking.value.vehicle?.model}`,
    'ENGINE SIZE', `${booking.value.vehicle?.engine_size ?? '-'} cc`,
    y
  )

  y += fieldGap
  doc.line(25, y, pageW - 25, y)

  y += 5
  drawRow(
    'PICKUP DATE', formatDateEn(booking.value.pickup_date),
    'RETURN DATE', formatDateEn(booking.value.return_date),
    y
  )

  y += fieldGap
  doc.line(25, y, pageW - 25, y)

  y += 5
  drawRow(
    'RENTAL DAYS', `${rentalDays.value} day${rentalDays.value > 1 ? 's' : ''}`,
    'VEHICLE TYPE', booking.value.vehicle?.vehicle_type || '-',
    y
  )

  y += fieldGap
  doc.line(25, y, pageW - 25, y)

  // ===== PRICING =====
  y += 8
  doc.setFillColor(...white)
  doc.roundedRect(25, y, pageW - 50, 34, 2, 2, 'F')
  doc.setDrawColor(...gray300)
  doc.roundedRect(25, y, pageW - 50, 34, 2, 2, 'S')

  const drawPriceRow = (label: string, value: string, yPos: number, bold: boolean) => {
    doc.setTextColor(...gray500)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(label, 32, yPos)
    doc.setTextColor(...gray900)
    doc.setFontSize(bold ? 11 : 10)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(value, pageW - 32, yPos, { align: 'right' })
  }

  drawPriceRow('DEPOSIT', `${booking.value.deposit_price.toLocaleString()} THB`, y + 8, false)
  drawPriceRow('RENTAL FEE', `${booking.value.rental_price.toLocaleString()} THB`, y + 15, false)

  // เส้นคั่นราคา
  doc.setDrawColor(...gray300)
  doc.setLineWidth(0.4)
  doc.line(32, y + 20, pageW - 32, y + 20)

  drawPriceRow('TOTAL', `${booking.value.rental_price.toLocaleString()} THB`, y + 27, true)

  // ===== CANCEL NOTE (เฉพาะยกเลิก) =====
  if (status === 'ยกเลิก') {
    y += 42
    doc.setFillColor(254, 226, 226)
    doc.roundedRect(25, y, pageW - 50, 16, 2, 2, 'F')
    doc.setDrawColor(252, 165, 165)
    doc.roundedRect(25, y, pageW - 50, 16, 2, 2, 'S')

    doc.setTextColor(153, 27, 27)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('NOTE', 32, y + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    let noteLine1 = ''
    let noteLine2 = ''
    const reason = booking.value.cancel_reason

    if (reason === 'no_show') {
      noteLine1 = 'Customer did not pick up the vehicle within the rental date.'
      noteLine2 = 'No refund will be provided.'
    } else if (reason === 'admin_reject') {
      noteLine1 = 'This booking was cancelled by the administrator.'
      noteLine2 = 'Please contact the shop for a refund.'
    } else if (reason === 'auto_expire') {
      noteLine1 = 'This booking has expired due to no approval within the time limit.'
      noteLine2 = 'Please contact the shop for a refund.'
    } else {
      noteLine1 = 'This booking has been cancelled.'
      noteLine2 = 'Please contact the shop for more information.'
    }
    doc.text(noteLine1, 32, y + 10.5)
    doc.text(noteLine2, 32, y + 14)
  }

  // ===== FOOTER =====
  doc.setDrawColor(...gray300)
  doc.setLineWidth(0.2)
  doc.line(25, pageH - 18, pageW - 25, pageH - 18)

  doc.setTextColor(...gray500)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Quick Moto - Motorcycle Rental Service', 25, pageH - 13)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageW - 25, pageH - 13, { align: 'right' })

  doc.save(`booking-${booking.value.booking_code}.pdf`)
}

const formatDateEn = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

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