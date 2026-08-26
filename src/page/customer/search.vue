<template>
  <div class="bg-slate-50 min-h-screen font-kanit pb-24">

    <!-- Hero Header -->
    <div class="bg-[#051329] px-4 pt-6 pb-14 rounded-b-3xl">
      <div class="w-full max-w-md mx-auto">
        <h1 class="text-xl font-bold text-white mb-1">ค้นหา & กรองรถ</h1>
        <p class="text-xs text-white/60">พิมพ์ชื่อรุ่น ยี่ห้อ หรือ cc แล้วผลลัพธ์จะขึ้นทันที</p>
      </div>
    </div>

    <div class="w-full max-w-md mx-auto px-4 -mt-8">

      <!-- Floating Search Pill -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 flex items-center gap-2 mb-4">
        <span class="pl-2 text-slate-400">
          <i class="fa-solid fa-magnifying-glass"></i>
        </span>
        <input
          v-model="searchForm.keyword"
          type="text"
          placeholder="honda, yamaha, 110cc, 125cc..."
          class="flex-1 py-2 text-sm focus:outline-none bg-transparent"
        >
        <button
          type="button"
          @click="showDateFilter = !showDateFilter"
          class="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors shrink-0"
          :class="hasSearchedDates ? 'bg-[#051329] text-white' : 'bg-slate-100 text-slate-600'"
        >
          <i class="fa-regular fa-calendar"></i>
          <span>{{ hasSearchedDates ? 'เลือกวันแล้ว' : 'วันที่' }}</span>
        </button>
      </div>

      <!-- Date Filter Panel (พับ/กาง) -->
      <div v-if="showDateFilter" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4">
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">วันที่รับ</label>
            <input
              v-model="searchForm.pickupDate"
              type="date"
              :min="todayStr"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            >
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1.5">วันที่คืนรถ</label>
            <input
              v-model="searchForm.returnDate"
              type="date"
              :min="searchForm.pickupDate || todayStr"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            >
          </div>
        </div>
        <button
          v-if="hasSearchedDates"
          type="button"
          @click="clearDates"
          class="text-xs text-red-500 font-medium"
        >
          ล้างวันที่
        </button>
      </div>

      <!-- Filter Chips: ระบบเกียร์ -->
      <div class="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          @click="selectedTransmission = 'Automatic'"
          class="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors shrink-0"
          :class="selectedTransmission === 'Automatic' ? 'bg-[#051329] text-white' : 'bg-white text-slate-500 border border-slate-200'"
        >
          <i class="fa-solid fa-person-biking"></i>
          Automatic
        </button>
        <button
          type="button"
          @click="selectedTransmission = 'Manual'"
          class="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors shrink-0"
          :class="selectedTransmission === 'Manual' ? 'bg-[#051329] text-white' : 'bg-white text-slate-500 border border-slate-200'"
        >
          <i class="fa-solid fa-motorcycle"></i>
          Manual
        </button>
      </div>

      <!-- Results -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold text-slate-900">
          {{ hasSearchedDates ? 'รถที่ว่างในช่วงวันที่เลือก' : 'ผลการค้นหา' }}
        </h2>
        <span v-if="!isLoading && !isCheckingAvailability" class="text-xs text-slate-400">
          พบ {{ resultVehicles.length }} คัน
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading || isCheckingAvailability" class="text-center text-slate-400 text-sm py-10">
        {{ isCheckingAvailability ? 'กำลังเช็ควันว่าง...' : 'กำลังโหลดข้อมูล...' }}
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-10">
        {{ errorMessage }}
      </div>

      <!-- Empty -->
      <div v-else-if="resultVehicles.length === 0" class="text-center text-slate-400 text-sm py-10">
        ไม่พบรถที่ตรงกับเงื่อนไข
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <MotorcycleCard
          v-for="vehicle in resultVehicles"
          :key="vehicle.vehicle_id"
          :vehicle="vehicle"
          :pickup-date="searchForm.pickupDate"
          :return-date="searchForm.returnDate"
        />
      </div>

    </div>
  </div>

  <BottomNavigation active="search" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MotorcycleCard from '../../components/MotorcycleCard.vue'
import BottomNavigation from '../../components/BottomNavigation.vue'
import { getVehicles, type Vehicle } from '../../services/customerService'
import { getAvailableUnits } from '../../services/bookingService'

const route = useRoute()
const router = useRouter()

const todayStr = new Date().toISOString().split('T')[0]

// อ่านค่าเริ่มต้นจาก query string (เผื่อกดค้นหามาจากหน้า home)
const searchForm = reactive({
  keyword: (route.query.keyword as string) || '',
  pickupDate: (route.query.pickupDate as string) || '',
  returnDate: (route.query.returnDate as string) || ''
})

const showDateFilter = ref(!!(searchForm.pickupDate || searchForm.returnDate))

const selectedTransmission = ref<'Automatic' | 'Manual'>(
  (route.query.transmission as 'Automatic' | 'Manual') || 'Automatic'
)

const vehicles = ref<Vehicle[]>([])
const availableVehicleIds = ref<Set<number> | null>(null) // null = ยังไม่ได้เช็ควันว่าง
const isLoading = ref(false)
const isCheckingAvailability = ref(false)
const errorMessage = ref('')

const hasSearchedDates = computed(() => !!(searchForm.pickupDate && searchForm.returnDate))

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

const resultVehicles = computed(() => {
  return vehicles.value.filter((v) => {
    if (!matchesKeyword(v, searchForm.keyword)) return false
    if (!matchesTransmission(v)) return false
    // ถ้าเลือกวันที่ไว้ครบทั้งคู่ ต้องเช็คว่ายังว่างในช่วงนั้นด้วย (ผลจาก checkAvailability)
    if (hasSearchedDates.value && availableVehicleIds.value) {
      return availableVehicleIds.value.has(v.vehicle_id)
    }
    return true
  })
})

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

const clearDates = () => {
  searchForm.pickupDate = ''
  searchForm.returnDate = ''
}

// sync query string ให้ตรงกับฟอร์มเสมอ (สำรองไว้เผื่อ fallback ใน MotorcycleCard และทำให้ URL แชร์ได้)
const syncQuery = () => {
  router.replace({
    path: '/search',
    query: {
      ...(searchForm.keyword ? { keyword: searchForm.keyword } : {}),
      ...(searchForm.pickupDate ? { pickupDate: searchForm.pickupDate } : {}),
      ...(searchForm.returnDate ? { returnDate: searchForm.returnDate } : {}),
      transmission: selectedTransmission.value
    }
  })
}

// เช็คว่างใหม่ทุกครั้งที่วันที่/เกียร์/คำค้นหาเปลี่ยน — debounce 400ms กันยิง Supabase ถี่เกินไปตอนพิมพ์
let debounceHandle: ReturnType<typeof setTimeout> | null = null
watch(
  () => [searchForm.keyword, searchForm.pickupDate, searchForm.returnDate, selectedTransmission.value],
  () => {
    if (debounceHandle) clearTimeout(debounceHandle)
    debounceHandle = setTimeout(() => {
      syncQuery()
      checkAvailability()
    }, 400)
  }
)

const loadVehicles = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    vehicles.value = await getVehicles()
    await checkAvailability()
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>