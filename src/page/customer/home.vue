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
                placeholder="เกียร์อัตโนมัติ,125cc"
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

      <!-- รถแนะนำ -->
      <section>
        <h2 class="text-base font-bold text-slate-900 mb-3">รถแนะนำสำหรับคุณ</h2>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center text-slate-400 text-sm py-10">
          กำลังโหลดข้อมูล...
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
          />
        </div>
      </section>

    </div>
  </div>

  <BottomNavigation active="home" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import MotorcycleCard from '../../components/MotorcycleCard.vue'
import BottomNavigation from '../../components/BottomNavigation.vue'
import { getVehicles, type Vehicle } from '../../services/customerService'

// ฟอร์มค้นหา
const searchForm = reactive({
  keyword: '',
  pickupDate: '',
  returnDate: ''
})

// คำค้นหาที่ยืนยันแล้ว (อัปเดตตอนกดปุ่มค้นหาเท่านั้น)
const appliedKeyword = ref('')

// ตัวกรองระบบเกียร์ที่เลือก
const selectedTransmission = ref<'Automatic' | 'Manual'>('Automatic')

// State สำหรับข้อมูลรถจาก Supabase
const vehicles = ref<Vehicle[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

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

// กรองตามระบบเกียร์ (vehicle_type) + คำค้นหา
const filteredVehicles = computed(() => {
  return vehicles.value.filter((v) => {
    const matchesTransmission =
      (v.vehicle_type ?? '').toLowerCase().startsWith(selectedTransmission.value.toLowerCase().slice(0, 4))

    const keyword = appliedKeyword.value.trim().toLowerCase()
    const matchesKeyword =
      !keyword ||
      v.brand.toLowerCase().includes(keyword) ||
      v.model.toLowerCase().includes(keyword) ||
      (v.vehicle_type ?? '').toLowerCase().includes(keyword)

    return matchesTransmission && matchesKeyword
  })
})

const handleSearch = () => {
  appliedKeyword.value = searchForm.keyword
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