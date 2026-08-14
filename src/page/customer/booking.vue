<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-28">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3">
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        จองรถ
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
      กำลังโหลดข้อมูล...
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-16">
      {{ errorMessage }}
    </div>

    <div v-else-if="vehicle" class="w-full max-w-md mx-auto px-4">

      <!-- Vehicle Image + Info -->
      <div class="pt-5">
        <div class="w-full h-48 sm:h-56 bg-slate-200 rounded-2xl overflow-hidden">
          <img
            v-if="vehicle.image"
            :src="vehicle.image"
            :alt="`${vehicle.brand} ${vehicle.model}`"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
            <i class="fa-solid fa-motorcycle text-4xl"></i>
          </div>
        </div>
      </div>

      <div class="py-5">
        <h1 class="text-xl font-bold text-slate-900">{{ vehicle.brand }} {{ vehicle.model }}</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ vehicle.vehicle_type || '-' }}</p>
      </div>

      <!-- วันที่รับ-คืนรถ (ปฏิทินแบบเดียวกับ home.vue) -->
      <div class="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">วันรับรถ</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <i class="fa-regular fa-calendar text-sm"></i>
            </span>
            <input
              v-model="form.pickupDate"
              type="date"
              :min="todayStr"
              class="w-full pl-9 pr-2 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
              :class="isDateRangeAvailable ? 'border-slate-200' : 'border-red-300'"
            >
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">วันคืนรถ</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <i class="fa-regular fa-calendar text-sm"></i>
            </span>
            <input
              v-model="form.returnDate"
              type="date"
              :min="form.pickupDate || todayStr"
              class="w-full pl-9 pr-2 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
              :class="isDateRangeAvailable ? 'border-slate-200' : 'border-red-300'"
            >
          </div>
        </div>
      </div>

      <!-- แจ้งเตือนถ้าช่วงวันที่เลือกทับกับ booking เดิม -->
      <p v-if="!isDateRangeAvailable" class="text-xs text-red-500 mb-2 flex items-center gap-1.5">
        <i class="fa-solid fa-circle-exclamation"></i>
        ช่วงวันที่เลือกถูกจองไปแล้ว กรุณาเลือกวันที่อื่น
      </p>

      <!-- รายการช่วงวันที่ไม่ว่าง -->
      <div v-if="bookedRanges.length > 0" class="mb-6">
        <p class="text-xs text-slate-400 mb-1.5">ช่วงวันที่ไม่ว่าง</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(range, idx) in bookedRanges"
            :key="idx"
            class="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full"
          >
            {{ formatDateTh(range.pickup_date) }} - {{ formatDateTh(range.return_date) }}
          </span>
        </div>
      </div>
      <div v-else class="mb-6"></div>

      <!-- ข้อมูลผู้ขับขี่ -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 class="text-base font-bold text-slate-900 mb-4">ข้อมูลผู้ขับขี่</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล (ตามใบขับขี่)</label>
            <input
              v-model="form.fullName"
              type="text"
              placeholder="กรอกชื่อ-นามสกุล"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">เบอร์โทรศัพท์</label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="08X-XXX-XXXX"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">อีเมล</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="example@email.com"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
        </div>
      </section>

      <!-- ข้อตกลงการเช่ารถ -->
      <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
        <div class="flex items-center gap-2 mb-3">
          <i class="fa-regular fa-file-lines text-slate-700"></i>
          <h2 class="text-base font-bold text-slate-900">ข้อตกลงการเช่ารถจักรยานยนต์</h2>
        </div>

        <div class="text-sm text-slate-600 leading-relaxed space-y-2" :class="{ 'line-clamp-4': !showFullTerms }">
          <p>1. <strong>ใบอนุญาตขับขี่</strong>: ผู้เช่าต้องมีใบอนุญาตขับขี่รถจักรยานยนต์ที่ยังไม่หมดอายุและมีอายุการใช้งานไม่น้อยกว่า 1 ปี</p>
          <p>2. <strong>อุปกรณ์ความปลอดภัย</strong>: ผู้เช่าต้องสวมหมวกนิรภัย (Helmet) ตลอดเวลาขณะขับขี่ทุกครั้ง</p>
          <p>3. <strong>การคืนรถ</strong>: รถต้องถูกคืนตามวันและเวลาที่กำหนดในสภาพเรียบร้อยเหมือนตอนรับรถ หากคืนล่าช้าจะมีค่าปรับตามอัตราที่บริษัทกำหนด</p>
        </div>

        <button
          type="button"
          @click="showFullTerms = !showFullTerms"
          class="text-sm font-medium text-slate-900 underline mt-2"
        >
          {{ showFullTerms ? 'ย่อข้อความ' : 'อ่านทั้งหมด' }}
        </button>
      </section>

    </div>

    <!-- Bottom Bar -->
    <div
      v-if="vehicle"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4"
    >
      <div class="w-full max-w-md mx-auto flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-400">ราคารวมที่ต้องชำระ</p>
          <p class="text-lg font-bold text-slate-900">
            ฿{{ formattedTotal }} <span class="text-xs font-normal text-slate-400">/ {{ rentalDays }} วัน</span>
          </p>
        </div>
        <button
          @click="handleSubmitBooking"
          :disabled="isSubmitting || !isDateRangeAvailable"
          class="bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] shrink-0"
        >
          <span>{{ isSubmitting ? 'กำลังจอง...' : !isDateRangeAvailable ? 'วันที่ไม่ว่าง' : 'ไปที่ชำระเงิน' }}</span>
          <i class="fa-solid fa-arrow-right text-sm"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVehicleById, type Vehicle } from '../../services/customerService'
import {
  getCurrentCustomer,
  calcRentalDays,
  getBookedRanges,
  isRangeOverlapping,
  holdVehicle,
  type BookedRange
} from '../../services/bookingService'

const route = useRoute()
const router = useRouter()

const vehicle = ref<Vehicle | null>(null)
const customerId = ref<number | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const showFullTerms = ref(false)
const bookedRanges = ref<BookedRange[]>([])

const todayStr = new Date().toISOString().split('T')[0]
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const form = reactive({
  pickupDate: todayStr,
  returnDate: tomorrowStr,
  fullName: '',
  phone: '',
  email: ''
})

const rentalDays = computed(() => calcRentalDays(form.pickupDate, form.returnDate))

const totalPrice = computed(() => {
  if (!vehicle.value) return 0
  return rentalDays.value * Number(vehicle.value.price)
})

const formattedTotal = computed(() => totalPrice.value.toLocaleString('en-US'))

// เช็คว่าช่วงวันที่เลือกอยู่ตอนนี้ ทับกับ booking เดิมของรถคันนี้หรือไม่
const isDateRangeAvailable = computed(() => {
  return !bookedRanges.value.some((r) =>
    isRangeOverlapping(form.pickupDate, form.returnDate, r.pickup_date, r.return_date)
  )
})

const formatDateTh = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const vehicleId = Number(route.params.id)

  try {
    const [vehicleData, customerData, bookedRangesData] = await Promise.all([
      getVehicleById(vehicleId),
      getCurrentCustomer(),
      getBookedRanges(vehicleId)
    ])

    bookedRanges.value = bookedRangesData

    if (!vehicleData) {
      errorMessage.value = 'ไม่พบข้อมูลรถคันนี้'
      return
    }
    vehicle.value = vehicleData

    if (customerData) {
      customerId.value = customerData.customer_id
      form.fullName = customerData.name ?? ''
      form.phone = customerData.phone ?? ''
      form.email = customerData.email ?? ''
    } else {
      errorMessage.value = 'กรุณาเข้าสู่ระบบก่อนทำการจอง'
    }
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

// STEP 1: hold รถไว้ก่อน (สถานะ unavailable) แต่ "ยังไม่บันทึก" ลงตาราง booking
// จะบันทึกจริงตอนแนบสลิปสำเร็จในหน้า payment.vue เท่านั้น
const handleSubmitBooking = async () => {
  if (!vehicle.value || !customerId.value) {
    alert('ไม่พบข้อมูลลูกค้า กรุณาเข้าสู่ระบบก่อนทำการจอง')
    return
  }

  if (!form.fullName || !form.phone) {
    alert('กรุณากรอกข้อมูลผู้ขับขี่ให้ครบถ้วน')
    return
  }

  if (new Date(form.returnDate) < new Date(form.pickupDate)) {
    alert('วันคืนรถต้องไม่ก่อนวันรับรถ')
    return
  }

  if (!isDateRangeAvailable.value) {
    alert('ช่วงวันที่เลือกถูกจองไปแล้ว กรุณาเลือกวันที่อื่น')
    return
  }

  isSubmitting.value = true

  try {
    await holdVehicle(vehicle.value.vehicle_id)

    const expiresAt = Date.now() + 5 * 60 * 1000

    // ส่งข้อมูลร่างการจองไปหน้า payment ผ่าน query (ยังไม่มี booking_id เพราะยังไม่ insert)
    const query = new URLSearchParams({
      vehicleId: String(vehicle.value.vehicle_id),
      customerId: String(customerId.value),
      pickupDate: form.pickupDate,
      returnDate: form.returnDate,
      rentalPrice: String(totalPrice.value),
      expires: String(expiresAt)
    })

    router.push(`/payment?${query.toString()}`)
  } catch (err) {
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>