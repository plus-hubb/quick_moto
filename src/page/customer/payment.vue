<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-10">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3">
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        ชำระเงิน
      </span>
    </div>

    <!-- Error / Expired -->
    <div v-if="errorMessage" class="text-center text-red-400 text-sm py-16 px-6">
      {{ errorMessage }}
    </div>

    <div v-else-if="draft" class="w-full max-w-md mx-auto px-4 pt-5">

      <!-- สรุปยอด -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <p class="text-sm text-red-500 mb-1">ยอดที่ต้องชำระครั้งนี้</p>
        <p class="text-3xl font-bold text-red-500 mb-4">฿{{ formattedDeposit }}</p>

        <div class="flex items-center justify-between text-sm py-2 border-t border-slate-100">
          <span class="text-slate-500">ค่ามัดจำ</span>
          <span class="font-medium text-slate-900">฿{{ formattedDeposit }}</span>
        </div>

        <div class="pt-2 border-t border-slate-100">
          <p class="text-sm font-bold text-slate-900 mb-1">ยอดรวมที่ต้องชำระที่หน้าร้าน</p>
          <p class="text-xl font-bold text-slate-900 mb-2">฿{{ formattedRental }}</p>
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-500">ค่าเช่ารถมอเตอร์ไซค์ ({{ rentalDays }} วัน)</span>
            <span class="font-medium text-slate-900">฿{{ formattedRental }}</span>
          </div>
        </div>
      </section>

      <!-- วิธีการชำระเงิน -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 text-center">
        <h2 class="text-base font-bold text-slate-900 mb-3">วิธีการชำระเงิน</h2>

        <p v-if="!slipUploaded" class="text-sm text-slate-500 mb-4">
          ชำระเงินและอัพโหลดหลักฐานการชำระภายใน
          <span class="font-bold" :class="isUrgent ? 'text-red-500' : 'text-slate-900'">{{ countdownLabel }} นาที</span>
        </p>
        <p v-else class="text-sm text-emerald-600 font-medium mb-4">
          <i class="fa-solid fa-circle-check mr-1"></i>
          แนบสลิปเรียบร้อยแล้ว บันทึกการจองสำเร็จ รอการตรวจสอบ
        </p>

        <div class="flex justify-center mb-5">
          <img
            :src="qrCodeUrl"
            alt="QR Code สำหรับชำระเงิน"
            class="w-48 h-48 rounded-xl border border-slate-100"
          >
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileSelected"
        >

        <div class="space-y-3">
          <button
            type="button"
            @click="fileInputRef?.click()"
            :disabled="isUploading || slipUploaded"
            class="w-full bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <i class="fa-solid fa-upload"></i>
            <span>{{ isUploading ? 'กำลังบันทึกการจอง...' : slipUploaded ? 'แนบสลิปแล้ว' : 'อัพโหลดสลิป' }}</span>
          </button>

          <button
            type="button"
            :disabled="!slipUploaded"
            @click="handleContinue"
            class="w-full bg-white text-slate-900 font-medium py-3 px-4 rounded-xl border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            ดำเนินการต่อ
          </button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { confirmBooking, createPayment, releaseHold, calcRentalDays } from '../../services/bookingService'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const router = useRouter()

// ร่างข้อมูลการจองที่ผูกกับ hold ชั่วคราว (ส่งมาจาก booking.vue ผ่าน query)
interface BookingDraft {
  holdId: number
  vehicleId: number
  customerId: number
  quantity: number
  pickupDate: string
  returnDate: string
  rentalPrice: number
}

const draft = ref<BookingDraft | null>(null)
const errorMessage = ref('')

const slipUploaded = ref(false)
const isUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// booking_code จะมีค่าก็ต่อเมื่อ insert booking สำเร็จแล้ว (หลังแนบสลิป)
const createdBookingCode = ref<string | null>(null)
const createdBookingId = ref<number | null>(null)

const expiresAt = Number(route.query.expires) || Date.now() + 5 * 60 * 1000
const remainingMs = ref(expiresAt - Date.now())
let timerHandle: ReturnType<typeof setInterval> | null = null

const rentalDays = computed(() =>
  draft.value ? calcRentalDays(draft.value.pickupDate, draft.value.returnDate) : 0
)

const depositPrice = 500
const formattedDeposit = computed(() => depositPrice.toLocaleString('en-US'))
const formattedRental = computed(() => (draft.value ? draft.value.rentalPrice.toLocaleString('en-US') : '0'))

const countdownLabel = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs.value / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}.${seconds.toString().padStart(2, '0')}`
})

const isUrgent = computed(() => remainingMs.value < 60 * 1000)

const qrCodeUrl = computed(() => {
  const payload = encodeURIComponent(`vehicle:${draft.value?.vehicleId ?? ''}|amount:${depositPrice}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${payload}`
})

const startCountdown = () => {
  timerHandle = setInterval(async () => {
    remainingMs.value = expiresAt - Date.now()

    if (remainingMs.value <= 0 && !slipUploaded.value) {
      clearInterval(timerHandle!)
      timerHandle = null

      // หมดเวลาโดยยังไม่แนบสลิป -> ลบ hold ทิ้ง คันนี้ในช่วงวันที่นี้กลับมาว่างทันที
      if (draft.value) {
        try {
          await releaseHold(draft.value.holdId)
        } catch (err) {
          console.error('releaseHold on timeout error:', err)
        }
      }

      errorMessage.value = 'หมดเวลาชำระเงิน การจองถูกยกเลิกแล้ว กรุณาทำการจองใหม่อีกครั้ง'
      draft.value = null
    }
  }, 1000)
}

// ตอนแนบสลิปสำเร็จเท่านั้น ถึง insert ลงตาราง booking + payment จริง
const handleFileSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !draft.value) return

  isUploading.value = true

  try {
    // 1) แปลง hold เป็น booking จริง (status = รออนุมัติ)
    const booking = await confirmBooking({
      holdId: draft.value.holdId,
      customerId: draft.value.customerId,
      vehicleId: draft.value.vehicleId,
      quantity: draft.value.quantity,
      pickupDate: draft.value.pickupDate,
      returnDate: draft.value.returnDate,
      rentalPrice: draft.value.rentalPrice
    })
    createdBookingCode.value = booking.booking_code
    createdBookingId.value = booking.booking_id

    // 2) อัพโหลดไฟล์สลิปขึ้น Supabase Storage (bucket เดียวกับรูปรถ เก็บในโฟลเดอร์ payment/)
    const filePath = `payment/${booking.booking_code}-${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('qrick_moto_img')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage
      .from('qrick_moto_img')
      .getPublicUrl(filePath)

    // 3) บันทึกสลิปลงตาราง payment
    await createPayment({
      bookingId: booking.booking_id,
      slipUrl: publicUrlData.publicUrl
    })

    if (timerHandle) {
      clearInterval(timerHandle)
      timerHandle = null
    }
    slipUploaded.value = true
  } catch (err) {
    console.error('confirm booking / upload slip error:', err)
    const message = err instanceof Error ? err.message : 'บันทึกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    alert(message)
  } finally {
    isUploading.value = false
  }
}

const handleContinue = () => {
  if (createdBookingId.value) {
    router.push(`/home`)
  } else {
    router.push('/home')
  }
}

// เตือนก่อนออกจากหน้านี้ ถ้ายังไม่ได้แนบสลิป (จะไม่มีอะไรถูกบันทึกไว้เลยถ้าออกตอนนี้)
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!slipUploaded.value && draft.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onBeforeRouteLeave(async (_to, _from, next) => {
  if (slipUploaded.value || !draft.value) {
    next()
    return
  }

  const confirmLeave = window.confirm(
    'หากย้อนกลับ การจองจะถูกยกเลิกและรถจะกลับไปว่างทันที ต้องการดำเนินการต่อหรือไม่?'
  )

  if (!confirmLeave) {
    next(false)
    return
  }

  try {
    await releaseHold(draft.value.holdId)
  } catch (err) {
    console.error('releaseHold on leave error:', err)
  }

  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }

  next()
})

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  const q = route.query

  if (
    !q.holdId ||
    !q.vehicleId ||
    !q.customerId ||
    !q.quantity ||
    !q.pickupDate ||
    !q.returnDate ||
    !q.rentalPrice
  ) {
    errorMessage.value = 'ไม่พบข้อมูลการจอง กรุณาทำรายการจองใหม่อีกครั้ง'
    return
  }

  draft.value = {
    holdId: Number(q.holdId),
    vehicleId: Number(q.vehicleId),
    customerId: Number(q.customerId),
    quantity: Number(q.quantity),
    pickupDate: String(q.pickupDate),
    returnDate: String(q.returnDate),
    rentalPrice: Number(q.rentalPrice)
  }

  startCountdown()
})

onUnmounted(() => {
  if (timerHandle) clearInterval(timerHandle)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>