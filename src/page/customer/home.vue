<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">
    <div class="w-full max-w-md mx-auto px-4 py-6">

      <!-- Header -->
      <header class="mb-5">
        <h1 class="text-2xl font-bold text-slate-900 mb-1">ค้นหามอเตอร์ไซค์</h1>
        <p class="text-sm text-slate-500 leading-relaxed">
          จองมอเตอร์ไซค์ระดับพรีเมียมได้ง่ายๆ เพียงไม่กี่ขั้นตอน
        </p>
      </header>

      <!-- Search Card -->
      <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100 mb-6">
        <form @submit.prevent="handleSearch" class="space-y-4">

          <!-- คำค้นหา -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">คำค้นหา</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <i class="fa-solid fa-magnifying-glass text-sm"></i>
              </span>
              <input
                v-model="searchForm.keyword"
                type="text"
                placeholder="honda, yamaha, 110cc, 125cc"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              >
            </div>
          </div>

          <!-- วันที่ -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">วันที่รับ</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <i class="fa-regular fa-calendar text-sm"></i>
                </span>
                <input
                  v-model="searchForm.pickupDate"
                  type="date"
                  :min="todayStr"
                  class="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">วันที่คืนรถ</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <i class="fa-regular fa-calendar text-sm"></i>
                </span>
                <input
                  v-model="searchForm.returnDate"
                  type="date"
                  :min="searchForm.pickupDate || todayStr"
                  class="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
                >
              </div>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>ค้นหารถ</span>
            <i class="fa-solid fa-arrow-right text-sm"></i>
          </button>
        </form>
      </div>

      <!-- ระบบเกียร์ -->
      <section class="mb-6">
        <h2 class="text-base font-bold text-slate-900 mb-3">ระบบเกียร์</h2>
        <div class="flex gap-3">
          <button
            type="button"
            @click="selectedTransmission = 'Automatic'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all',
              selectedTransmission === 'Automatic'
                ? 'bg-[#051329] text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200'
            ]"
          >
            <i class="fa-solid fa-person-biking"></i>
            <span>Automatic</span>
          </button>
          <button
            type="button"
            @click="selectedTransmission = 'Manual'"
            :class="[
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all',
              selectedTransmission === 'Manual'
                ? 'bg-[#051329] text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200'
            ]"
          >
            <i class="fa-solid fa-motorcycle"></i>
            <span>Manual</span>
          </button>
        </div>
      </section>

      <!-- ผลการค้นหา / รถแนะนำ -->
      <section>
        <h2 class="text-base font-bold text-slate-900 mb-3">
          {{ hasSearchQuery ? 'ผลการค้นหา' : 'รถแนะนำสำหรับคุณ' }}
        </h2>

        <!-- Loading -->
        <div v-if="isLoading || isCheckingAvailability" class="text-center text-slate-400 text-sm py-10">
          {{ isCheckingAvailability ? 'กำลังเช็ควันว่าง...' : 'กำลังโหลดข้อมูล...' }}
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-10">
          {{ errorMessage }}
        </div>

        <!-- Empty -->
        <div v-else-if="filteredVehicles.length === 0" class="text-center text-slate-400 text-sm py-10">
          ไม่พบรถที่ตรงกับเงื่อนไข
        </div>

        <!-- List -->
        <div v-else class="space-y-4">
          <MotorcycleCard
            v-for="vehicle in filteredVehicles"
            :key="vehicle.vehicle_id"
            :vehicle="vehicle"
            :pickup-date="searchForm.pickupDate"
            :return-date="searchForm.returnDate"
          />
        </div>
      </section>

    </div>
  </div>

  <BottomNavigation active="home" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MotorcycleCard from '../../components/MotorcycleCard.vue'
import BottomNavigation from '../../components/BottomNavigation.vue'
import { getVehicles, type Vehicle } from '../../services/customerService'
import { getAvailableUnits } from '../../services/bookingService'

const route = useRoute()

const todayStr = new Date().toISOString().split('T')[0]

// อ่านค่าเริ่มต้นจาก query string (เผื่อกดค้นหามาจากหน้าอื่น)
const searchForm = reactive({
  keyword: (route.query.keyword as string) || '',
  pickupDate: (route.query.pickupDate as string) || '',
  returnDate: (route.query.returnDate as string) || ''
})

// ตัวกรองระบบเกียร์ที่เลือก
const selectedTransmission = ref<'Automatic' | 'Manual'>(
  (route.query.transmission as 'Automatic' | 'Manual') || 'Automatic'
)

// State สำหรับข้อมูลรถจาก Supabase
const vehicles = ref<Vehicle[]>([])
const availableVehicleIds = ref<Set<number> | null>(null)
const isLoading = ref(false)
const isCheckingAvailability = ref(false)
const errorMessage = ref('')

// ตรวจสอบว่ามีการค้นหาหรือไม่
const hasSearchQuery = computed(() => !!(searchForm.keyword || searchForm.pickupDate || searchForm.returnDate))
const hasSearchedDates = computed(() => !!(searchForm.pickupDate && searchForm.returnDate))

const loadVehicles = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    vehicles.value = await getVehicles()
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

// รวมข้อมูลรถเป็น string เดียวเพื่อค้นหาได้ทั้งยี่ห้อ/รุ่น/ประเภท/ซีซี ในช่องเดียว
const matchesKeyword = (v: Vehicle, keyword: string) => {
  if (!keyword) return true
  const haystack = `${v.brand} ${v.model} ${v.vehicle_type ?? ''} ${v.engine_size ?? ''}cc`.toLowerCase()
  return haystack.includes(keyword.toLowerCase().trim())
}

const matchesTransmission = (v: Vehicle) => {
  const type = (v.vehicle_type ?? '').toLowerCase()
  return selectedTransmission.value === 'Automatic' ? type.includes('auto') : type.includes('man')
}

// เช็คว่ารถแต่ละคัน (ที่ผ่าน keyword/transmission แล้ว) ว่างในช่วงวันที่เลือกไหม
const checkAvailability = async () => {
  if (!hasSearchedDates.value) {
    availableVehicleIds.value = null
    return
  }

  isCheckingAvailability.value = true
  try {
    const candidates = vehicles.value.filter(
      (v) => matchesKeyword(v, searchForm.keyword) && matchesTransmission(v)
    )

    const results = await Promise.all(
      candidates.map(async (v) => {
        const units = await getAvailableUnits(
          v.vehicle_id,
          v.quantity,
          searchForm.pickupDate,
          searchForm.returnDate
        )
        return { vehicleId: v.vehicle_id, available: units > 0 }
      })
    )

    availableVehicleIds.value = new Set(results.filter((r) => r.available).map((r) => r.vehicleId))
  } finally {
    isCheckingAvailability.value = false
  }
}

// กรองรถตามเงื่อนไขค้นหา ระบบเกียร์ และวันว่าง
const filteredVehicles = computed(() => {
  return vehicles.value.filter((v) => {
    if (!matchesKeyword(v, searchForm.keyword)) return false
    if (!matchesTransmission(v)) return false
    if (hasSearchedDates.value && availableVehicleIds.value) {
      return availableVehicleIds.value.has(v.vehicle_id)
    }
    return true
  })
})

// Debounce สำหรับเช็ควันว่าง
let debounceHandle: ReturnType<typeof setTimeout> | null = null
watch(
  () => [searchForm.keyword, searchForm.pickupDate, searchForm.returnDate, selectedTransmission.value],
  () => {
    if (debounceHandle) clearTimeout(debounceHandle)
    debounceHandle = setTimeout(() => {
      checkAvailability()
    }, 400)
  }
)

// กด "ค้นหารถ" แล้วแสดงผลในหน้า home เลย
const handleSearch = () => {
  checkAvailability()
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
