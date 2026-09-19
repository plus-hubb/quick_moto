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
            <i class="fa-solid fa-store text-slate-400"></i>
            จองรถ Walk-in
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

      <!-- Page Content -->
      <main class="p-4 sm:p-6 lg:p-8">

        <!-- ====== SUCCESS STATE ====== -->
        <div v-if="bookingSuccess" class="max-w-2xl mx-auto">
          <div class="bg-white rounded-2xl border border-slate-100 p-8 text-center">
            <div class="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <i class="fa-solid fa-check text-emerald-600 text-3xl"></i>
            </div>
            <h2 class="text-xl font-bold text-slate-900 mb-2">จองรถสำเร็จ!</h2>
            <p class="text-sm text-slate-500 mb-6">รายการจองถูกบันทึกเรียบร้อยแล้ว</p>

            <div class="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs text-slate-400">รหัสการจอง</span>
                <span class="text-sm font-bold text-[#051329]">{{ createdBookingCode }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-400">สถานะ</span>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">รออนุมัติ</span>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                @click="resetForm"
                class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                <i class="fa-solid fa-plus text-xs mr-1.5"></i>
                จองคิวใหม่
              </button>
              <router-link
                to="/admin/pending-approval"
                class="flex-1 py-3 rounded-xl bg-[#051329] hover:bg-[#0a1f3d] text-white text-sm font-medium text-center transition-all active:scale-[0.98]"
              >
                <i class="fa-solid fa-arrow-right text-xs mr-1.5"></i>
                ไปหน้ารออนุมัติ
              </router-link>
            </div>
          </div>
        </div>

        <!-- ====== FORM STATE ====== -->
        <template v-else>

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            <span class="text-slate-600 font-medium">จองรถ Walk-in</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">สร้างรายการจองใหม่</h1>
            <span class="text-xs text-slate-400">สำหรับลูกค้าที่ Walk-in เข้ามา</span>
          </div>

          <!-- Step Indicator -->
          <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            <div
              v-for="(step, idx) in steps"
              :key="idx"
              class="flex items-center gap-2 shrink-0"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                :class="currentStep > idx ? 'bg-emerald-500 text-white' : currentStep === idx ? 'bg-[#051329] text-white' : 'bg-slate-200 text-slate-400'"
              >
                <i v-if="currentStep > idx" class="fa-solid fa-check text-[10px]"></i>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span
                class="text-sm font-medium hidden sm:inline"
                :class="currentStep >= idx ? 'text-slate-900' : 'text-slate-400'"
              >{{ step }}</span>
              <div v-if="idx < steps.length - 1" class="w-8 h-px bg-slate-200 mx-1 hidden sm:block"></div>
            </div>
          </div>


            <!-- ===== STEP 1: เลือกรถ ===== -->
            <section class="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 mb-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-motorcycle text-blue-500 text-sm"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">เลือกรถ</h2>
                  <p class="text-xs text-slate-400">เลือกรถที่ต้องการให้เช่า</p>
                </div>
              </div>

              <!-- Loading -->
              <div v-if="isLoadingVehicles" class="flex items-center justify-center gap-2 text-slate-400 text-sm py-8">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>กำลังโหลดรายการรถ...</span>
              </div>

              <!-- Vehicle Grid -->
              <div v-else class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    v-for="v in availableVehicles"
                    :key="v.vehicle_id"
                    type="button"
                    @click="selectVehicle(v)"
                    :class="[
                      'group relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                      selectedVehicle?.vehicle_id === v.vehicle_id
                        ? 'border-[#051329] bg-[#051329]/5 ring-1 ring-[#051329]'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                    ]"
                  >
                    <div
                      v-if="selectedVehicle?.vehicle_id === v.vehicle_id"
                      class="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#051329] flex items-center justify-center"
                    >
                      <i class="fa-solid fa-check text-white text-[9px]"></i>
                    </div>
                    <div class="w-18 h-18 rounded-xl bg-slate-100 overflow-hidden shrink-0" style="width: 72px; height: 72px;">
                      <img v-if="v.image" :src="v.image" class="w-full h-full object-cover">
                      <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                        <i class="fa-solid fa-motorcycle text-xl"></i>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-bold text-slate-900 truncate">{{ v.brand }} {{ v.model }}</p>
                      <p class="text-xs text-slate-400 mt-0.5">{{ v.engine_size ?? '-' }}cc {{ v.vehicle_type || '' }}</p>
                      <div class="flex items-center gap-1.5 mt-1.5">
                        <span class="text-sm font-bold text-[#051329]">฿{{ Number(v.price).toLocaleString('en-US') }}</span>
                        <span class="text-[10px] text-slate-400">/วัน</span>
                      </div>
                    </div>
                  </button>
                </div>
                <div v-if="availableVehicles.length === 0" class="text-center py-10">
                  <div class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-motorcycle text-slate-300 text-xl"></i>
                  </div>
                  <p class="text-sm text-slate-400">ไม่มีรถว่างในขณะนี้</p>
                </div>
              </div>
            </section>

            <!-- ===== STEP 2: เลือกวันที่ ===== -->
            <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 mb-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <i class="fa-regular fa-calendar text-violet-500 text-sm"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">เลือกวันที่เช่า</h2>
                  <p class="text-xs text-slate-400">กำหนดวันรับรถและวันคืนรถ</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">วันรับรถ</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <i class="fa-solid fa-circle-arrow-right text-xs"></i>
                    </span>
                    <input
                      v-model="form.pickupDate"
                      type="date"
                      :min="todayStr"
                      class="w-full pl-8 pr-2 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#051329] transition-all"
                      :class="isDateRangeAvailable ? 'border-slate-200' : 'border-red-300'"
                    >
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">วันคืนรถ</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <i class="fa-solid fa-circle-arrow-left text-xs"></i>
                    </span>
                    <input
                      v-model="form.returnDate"
                      type="date"
                      :min="form.pickupDate || todayStr"
                      class="w-full pl-8 pr-2 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#051329] transition-all"
                      :class="isDateRangeAvailable ? 'border-slate-200' : 'border-red-300'"
                    >
                  </div>
                </div>
              </div>

              <!-- Availability Status -->
              <div
                v-if="isCheckingAvailability"
                class="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2"
              >
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>กำลังเช็คจำนวนรถว่าง...</span>
              </div>
              <div
                v-else-if="!isDateRangeAvailable"
                class="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2"
              >
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>ช่วงวันที่เลือกเต็มแล้ว กรุณาเลือกวันที่อื่น</span>
              </div>
              <div
                v-else
                class="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2"
              >
                <i class="fa-solid fa-circle-check"></i>
                <span>เหลือ {{ availableUnits }} คัน สำหรับช่วงวันที่นี้</span>
              </div>
            </section>

            <!-- ===== STEP 3: ข้อมูลผู้เช่า ===== -->
            <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 mb-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-user text-amber-500 text-sm"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">ข้อมูลผู้เช่า</h2>
                  <p class="text-xs text-slate-400">กรอกข้อมูลลูกค้าที่มาเช่า</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">
                    ชื่อ-นามสกุล <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.fullName"
                    type="text"
                    required
                    placeholder="กรอกชื่อ-นามสกุล ตามใบขับขี่"
                    class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#051329] focus:border-[#051329] transition-all"
                  >
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">
                    เบอร์โทรศัพท์ <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <i class="fa-solid fa-phone text-xs"></i>
                    </span>
                    <input
                      v-model="form.phone"
                      type="tel"
                      inputmode="numeric"
                      pattern="[0-9]*"
                      maxlength="10"
                      required
                      placeholder="0xxxxxxxxx"
                      class="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#051329] focus:border-[#051329] transition-all"
                    >
                  </div>
                  <p v-if="form.phone && form.phone.length > 0 && form.phone.length < 10" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <i class="fa-solid fa-circle-info"></i>
                    กรุณากรอกเบอร์โทรให้ครบ 10 หลัก
                  </p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-medium text-slate-500 mb-1.5">
                    อีเมล <span class="text-slate-400">(ไม่บังคับ)</span>
                  </label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <i class="fa-solid fa-envelope text-xs"></i>
                    </span>
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="example@email.com"
                      class="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#051329] focus:border-[#051329] transition-all"
                    >
                  </div>
                </div>
              </div>
            </section>

            <!-- ===== STEP 4: สรุปรายการ ===== -->
            <section v-if="selectedVehicle" class="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm border border-slate-100 mb-5">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-receipt text-emerald-500 text-sm"></i>
                </div>
                <div>
                  <h2 class="text-base font-bold text-slate-900">สรุปรายการ</h2>
                  <p class="text-xs text-slate-400">ตรวจสอบข้อมูลก่อนยืนยัน</p>
                </div>
              </div>

              <div class="bg-slate-50 rounded-xl p-4 space-y-3">
                <!-- Vehicle -->
                <div class="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div class="w-12 h-12 rounded-lg bg-white overflow-hidden shrink-0 border border-slate-200">
                    <img v-if="selectedVehicle.image" :src="selectedVehicle.image" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                      <i class="fa-solid fa-motorcycle text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-slate-900 truncate">{{ selectedVehicle.brand }} {{ selectedVehicle.model }}</p>
                    <p class="text-xs text-slate-400">{{ selectedVehicle.engine_size ?? '-' }}cc</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-slate-900">฿{{ Number(selectedVehicle.price).toLocaleString('en-US') }}</p>
                    <p class="text-[10px] text-slate-400">/วัน</p>
                  </div>
                </div>

                <!-- Details -->
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-400">วันรับรถ</span>
                    <span class="font-medium text-slate-900">{{ formatDateTh(form.pickupDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">วันคืนรถ</span>
                    <span class="font-medium text-slate-900">{{ formatDateTh(form.returnDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-400">ระยะเวลาเช่า</span>
                    <span class="font-medium text-slate-900">{{ rentalDays }} วัน</span>
                  </div>
                </div>

                <!-- Total -->
                <div class="border-t border-slate-200 pt-3">
                  <div class="flex justify-between items-end">
                    <div>
                      <p class="text-xs text-slate-400">ค่าเช่ารวม</p>
                      <p class="text-xs text-slate-400">{{ rentalDays }} วัน x ฿{{ Number(selectedVehicle.price).toLocaleString('en-US') }}</p>
                    </div>
                    <p class="text-xl font-bold text-[#051329]">฿{{ formattedTotal }}</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Error Message -->
            <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
              <i class="fa-solid fa-circle-exclamation text-red-500 mt-0.5 shrink-0"></i>
              <p class="text-sm text-red-600">{{ errorMessage }}</p>
            </div>

        </template>

      </main>
    </div>

    <!-- ===== BOTTOM BAR ===== -->
    <div
      v-if="selectedVehicle && !bookingSuccess"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-4 z-30"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-400">ราคารวม</p>
          <p class="text-lg font-bold text-slate-900">
            ฿{{ formattedTotal }}
            <span class="text-xs font-normal text-slate-400">/ {{ rentalDays }} วัน</span>
          </p>
        </div>
        <button
          @click="handleSubmit"
          :disabled="isSubmitting || !isDateRangeAvailable || isCheckingAvailability || !form.fullName || form.phone.length !== 10"
          class="bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] shrink-0"
        >
          <template v-if="isSubmitting">
            <i class="fa-solid fa-spinner fa-spin text-sm"></i>
            <span>กำลังบันทึก...</span>
          </template>
          <template v-else>
            <i class="fa-solid fa-check text-sm"></i>
            <span>ยืนยันการจอง</span>
          </template>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
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

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)

const handleLogout = async () => {
  await logoutAdmin()
  router.push('/signin')
}

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const steps = ['เลือกรถ', 'เลือกวันที่', 'ข้อมูลผู้เช่า', 'สรุปรายการ']

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

const currentStep = computed(() => {
  if (!selectedVehicle.value) return 0
  if (!form.pickupDate || !form.returnDate) return 1
  if (!form.fullName || form.phone.length !== 10) return 2
  return 3
})

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
    const customer = await findOrCreateCustomer({
      name: form.fullName,
      phone: form.phone,
      email: form.email
    })

    const hold = await createHold({
      vehicleId: selectedVehicle.value.vehicle_id,
      customerId: customer.customer_id,
      quantity: selectedVehicle.value.quantity,
      pickupDate: form.pickupDate,
      returnDate: form.returnDate
    })

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

onMounted(async () => {
  admin.value = await getCurrentAdmin()
  if (!admin.value) {
    router.push('/signin')
    return
  }
  loadVehicles()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
