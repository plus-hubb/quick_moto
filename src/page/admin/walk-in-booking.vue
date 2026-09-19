<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-28">
    <AdminSidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" @logout="handleLogout" />

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3 md:py-4 md:px-6 flex items-center gap-3">
      <button type="button" @click="sidebarOpen = true" class="text-white lg:hidden">
        <i class="fa-solid fa-bars text-base"></i>
      </button>
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        จองรถ (Walk-in)
      </span>
    </div>

    <div class="w-full max-w-2xl mx-auto px-4 pt-5">

      <!-- สำเร็จ -->
      <div v-if="bookingSuccess" class="text-center py-10">
        <div class="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-check text-white text-2xl"></i>
        </div>
        <h2 class="text-lg font-bold text-slate-900 mb-2">จองรถสำเร็จ!</h2>
        <p class="text-sm text-slate-500 mb-1">รหัสการจอง: <span class="font-bold text-slate-900">{{ createdBookingCode }}</span></p>
        <p class="text-sm text-slate-500 mb-6">สถานะ: รออนุมัติ</p>
        <div class="flex gap-3">
          <button
            type="button"
            @click="resetForm"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all active:scale-[0.98]"
          >
            จองคิวใหม่
          </button>
          <router-link
            to="/admin/pending-approval"
            class="flex-1 py-2.5 rounded-xl bg-[#051329] text-white text-sm font-medium text-center transition-all active:scale-[0.98]"
          >
            ไปหน้ารออนุมัติ
          </router-link>
        </div>
      </div>

      <!-- Form -->
      <template v-else>

        <!-- เลือกรถ -->
        <section class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 mb-4">เลือกรถ</h2>

          <div v-if="isLoadingVehicles" class="text-center text-slate-400 text-sm py-4">
            กำลังโหลดรายการรถ...
          </div>

          <div v-else class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="v in availableVehicles"
                :key="v.vehicle_id"
                type="button"
                @click="selectVehicle(v)"
                :class="[
                  'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  selectedVehicle?.vehicle_id === v.vehicle_id
                    ? 'border-[#051329] bg-[#051329]/5 ring-1 ring-[#051329]'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                ]"
              >
                <div class="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img v-if="v.image" :src="v.image" class="w-full h-full object-cover">
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                    <i class="fa-solid fa-motorcycle text-sm"></i>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 truncate">{{ v.brand }} {{ v.model }}</p>
                  <p class="text-xs text-slate-500">{{ v.engine_size ?? '-' }}cc {{ v.vehicle_type || '' }}</p>
                  <p class="text-xs font-medium text-slate-900 mt-0.5">฿{{ Number(v.price).toLocaleString('en-US') }}/วัน</p>
                </div>
              </button>
            </div>
            <p v-if="availableVehicles.length === 0" class="text-center text-slate-400 text-sm py-4">
              ไม่มีรถว่างในขณะนี้
            </p>
          </div>
        </section>

        <!-- วันที่รับ-คืนรถ -->
        <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 mb-4">เลือกวันที่</h2>

          <div class="grid grid-cols-2 gap-3 mb-3">
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

          <p v-if="isCheckingAvailability" class="text-xs text-slate-400">กำลังเช็คจำนวนรถว่าง...</p>
          <p v-else-if="!isDateRangeAvailable" class="text-xs text-red-500 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-exclamation"></i>
            ช่วงวันที่เลือกเต็มแล้ว กรุณาเลือกวันที่อื่น
          </p>
          <p v-else class="text-xs text-emerald-600 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-check"></i>
            เหลือ {{ availableUnits }} คัน สำหรับช่วงวันที่นี้
          </p>
        </section>

        <!-- ข้อมูลผู้เช่า -->
        <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 mb-4">ข้อมูลผู้เช่า</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">ชื่อ-นามสกุล (ตามใบขับขี่) <span class="text-red-500">*</span></label>
              <input
                v-model="form.fullName"
                type="text"
                required
                placeholder="กรอกชื่อ-นามสกุล"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">เบอร์โทรศัพท์ <span class="text-red-500">*</span></label>
              <input
                v-model="form.phone"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="10"
                required
                placeholder="0xxxxxxxxx"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              >
              <p v-if="form.phone && form.phone.length < 10" class="text-xs text-red-500 mt-1">กรุณากรอกเบอร์โทรให้ครบ 10 หลัก</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">อีเมล <span class="text-xs text-slate-400">(ไม่บังคับ)</span></label>
              <input
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              >
            </div>
          </div>
        </section>

        <!-- สรุปรายการ -->
        <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-4">
          <h2 class="text-base font-bold text-slate-900 mb-3">สรุปรายการ</h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">รถ</span>
              <span class="font-medium text-slate-900">{{ selectedVehicle.brand }} {{ selectedVehicle.model }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">วันรับรถ</span>
              <span class="font-medium text-slate-900">{{ formatDateTh(form.pickupDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">วันคืนรถ</span>
              <span class="font-medium text-slate-900">{{ formatDateTh(form.returnDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">ระยะเวลาเช่า</span>
              <span class="font-medium text-slate-900">{{ rentalDays }} วัน</span>
            </div>
            <div class="border-t border-slate-100 pt-2 flex justify-between">
              <span class="text-slate-500">ค่าเช่ารวม</span>
              <span class="text-lg font-bold text-slate-900">฿{{ formattedTotal }}</span>
            </div>
          </div>
        </section>

        <p v-if="errorMessage" class="text-sm text-red-500 mb-4">{{ errorMessage }}</p>

      </template>
    </div>

    <!-- Bottom Bar -->
    <div
      v-if="selectedVehicle && !bookingSuccess"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4"
    >
      <div class="w-full max-w-md mx-auto flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-400">ราคารวม</p>
          <p class="text-lg font-bold text-slate-900">
            ฿{{ formattedTotal }} <span class="text-xs font-normal text-slate-400">/ {{ rentalDays }} วัน</span>
          </p>
        </div>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting || !isDateRangeAvailable || isCheckingAvailability || !form.fullName || form.phone.length !== 10"
          class="bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-50 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] shrink-0"
        >
          <span>{{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง' }}</span>
          <i class="fa-solid fa-check text-sm"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { supabase } from '../../lib/supabase'
import {
  calcRentalDays,
  getAvailableUnits,
  createHold,
  confirmBooking,
  findOrCreateCustomer
} from '../../services/bookingService'
import type { Vehicle } from '../../services/customerService'

const router = useRouter()

const sidebarOpen = ref(false)
const handleLogout = () => {
  localStorage.removeItem('admin')
  router.push('/signin')
}

const availableVehicles = ref<Vehicle[]>([])
const selectedVehicle = ref<Vehicle | null>(null)
const isLoadingVehicles = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const bookingSuccess = ref(false)
const createdBookingCode = ref('')

const availableUnits = ref(0)
const isCheckingAvailability = ref(false)

const todayStr = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()
const tomorrowStr = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const form = reactive({
  pickupDate: todayStr,
  returnDate: tomorrowStr,
  fullName: '',
  phone: '',
  email: ''
})

const rentalDays = computed(() => calcRentalDays(form.pickupDate, form.returnDate))

const totalPrice = computed(() => {
  if (!selectedVehicle.value) return 0
  return rentalDays.value * Number(selectedVehicle.value.price)
})

const formattedTotal = computed(() => totalPrice.value.toLocaleString('en-US'))

const isDateRangeAvailable = computed(() => availableUnits.value > 0)

const formatDateTh = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

const selectVehicle = (v: Vehicle) => {
  selectedVehicle.value = v
  refreshAvailability()
}

const refreshAvailability = async () => {
  if (!selectedVehicle.value) return
  isCheckingAvailability.value = true
  try {
    availableUnits.value = await getAvailableUnits(
      selectedVehicle.value.vehicle_id,
      selectedVehicle.value.quantity,
      form.pickupDate,
      form.returnDate
    )
  } finally {
    isCheckingAvailability.value = false
  }
}

watch(() => [form.pickupDate, form.returnDate], () => {
  refreshAvailability()
})

// ตัดตัวอักษรที่ไม่ใช่ตัวเลขออกจากเบอร์โทร
watch(() => form.phone, (val) => {
  form.phone = val.replace(/[^0-9]/g, '').slice(0, 10)
})

const loadVehicles = async () => {
  isLoadingVehicles.value = true
  try {
    const { data, error } = await supabase
      .from('vehicle')
      .select('*')
      .gt('quantity', 0)
      .order('vehicle_id', { ascending: false })

    if (error) throw error
    availableVehicles.value = data ?? []
  } catch (err) {
    console.error('loadVehicles error:', err)
  } finally {
    isLoadingVehicles.value = false
  }
}

const handleSubmit = async () => {
  if (!selectedVehicle.value) return

  if (!form.fullName || !form.phone) {
    alert('กรุณากรอกชื่อและเบอร์โทรศัพท์')
    return
  }

  if (form.phone.length !== 10) {
    alert('เบอร์โทรศัพท์ต้องมี 10 หลัก')
    return
  }

  if (new Date(form.returnDate) < new Date(form.pickupDate)) {
    alert('วันคืนรถต้องไม่ก่อนวันรับรถ')
    return
  }

  if (!isDateRangeAvailable.value) {
    alert('ช่วงวันที่เลือกเต็มแล้ว')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 1) หาหรือสร้างลูกค้า
    const customer = await findOrCreateCustomer({
      name: form.fullName,
      phone: form.phone,
      email: form.email
    })

    // 2) สร้าง hold
    const hold = await createHold({
      vehicleId: selectedVehicle.value.vehicle_id,
      customerId: customer.customer_id,
      quantity: selectedVehicle.value.quantity,
      pickupDate: form.pickupDate,
      returnDate: form.returnDate
    })

    // 3) ยืนยัน booking ทันที (walk-in จ่ายเงินสด ไม่ต้องอัพโหลดสลิป)
    const booking = await confirmBooking({
      holdId: hold.hold_id,
      customerId: customer.customer_id,
      vehicleId: selectedVehicle.value.vehicle_id,
      quantity: selectedVehicle.value.quantity,
      pickupDate: form.pickupDate,
      returnDate: form.returnDate,
      rentalPrice: totalPrice.value
    })

    createdBookingCode.value = booking.booking_code
    bookingSuccess.value = true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'จองรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    errorMessage.value = message
    alert(message)
    await refreshAvailability()
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  bookingSuccess.value = false
  createdBookingCode.value = ''
  selectedVehicle.value = null
  form.pickupDate = todayStr
  form.returnDate = tomorrowStr
  form.fullName = ''
  form.phone = ''
  form.email = ''
  loadVehicles()
}

onMounted(() => {
  loadVehicles()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
