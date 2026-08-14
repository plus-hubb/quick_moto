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

    <!-- Content -->
    <div v-else-if="vehicle" class="w-full max-w-md mx-auto">

      <!-- Vehicle Image -->
      <div class="px-4 pt-5">
        <div class="w-full h-56 sm:h-64 bg-slate-200 rounded-2xl overflow-hidden">
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

      <div class="px-4 py-5">

        <!-- Name & Price -->
        <div class="flex items-start justify-between gap-2 mb-6">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
            {{ vehicle.brand }} {{ vehicle.model }}
          </h1>
          <div class="text-right shrink-0">
            <p class="text-lg sm:text-xl font-bold text-slate-900">฿{{ formattedPrice }}</p>
            <p class="text-xs text-slate-400 -mt-0.5">ต่อวัน</p>
          </div>
        </div>

        <!-- ข้อมูลทางเทคนิค -->
        <section class="mb-6">
          <h2 class="text-base font-bold text-slate-900 mb-3">ข้อมูลทางเทคนิค</h2>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white rounded-xl border border-slate-100 p-4 text-center">
              <i class="fa-solid fa-gauge-high text-slate-400 text-lg mb-1.5"></i>
              <p class="text-xs text-slate-400">เครื่องยนต์</p>
              <p class="text-sm font-bold text-slate-900">{{ vehicle.engine_size ?? '-' }}cc</p>
            </div>
            <div class="bg-white rounded-xl border border-slate-100 p-4 text-center">
              <i class="fa-solid fa-gears text-slate-400 text-lg mb-1.5"></i>
              <p class="text-xs text-slate-400">เกียร์</p>
              <p class="text-sm font-bold text-slate-900">{{ vehicle.vehicle_type || '-' }}</p>
            </div>
          </div>
        </section>

        <!-- คำอธิบาย -->
        <section>
          <h2 class="text-base font-bold text-slate-900 mb-3">คำอธิบาย</h2>
          <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {{ vehicle.explanation || 'ยังไม่มีคำอธิบายสำหรับรถคันนี้' }}
          </p>
        </section>

      </div>
    </div>

    <!-- Empty (ไม่พบข้อมูล) -->
    <div v-else class="text-center text-slate-400 text-sm py-16">
      ไม่พบข้อมูลรถคันนี้
    </div>

    <!-- Bottom Bar: ราคา + ปุ่มจอง -->
    <div
      v-if="vehicle"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-4"
    >
      <div class="w-full max-w-md mx-auto flex items-center justify-between gap-4">
        <div>
          <p class="text-xs text-slate-400">ราคาค่าเช่ารายวัน</p>
          <p class="text-lg font-bold text-slate-900">฿{{ formattedPrice }} <span class="text-xs font-normal text-slate-400">/ วัน</span></p>
        </div>
        <button
          @click="handleBookNow"
          class="bg-[#051329] hover:bg-[#0a1f3d] text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] shrink-0"
        >
          <span>จองตอนนี้</span>
          <i class="fa-solid fa-arrow-right text-sm"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVehicleById, type Vehicle } from '../../services/customerService'

const route = useRoute()
const router = useRouter()

const vehicle = ref<Vehicle | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const formattedPrice = computed(() =>
  vehicle.value ? Number(vehicle.value.price).toLocaleString('en-US') : '0'
)

const loadVehicle = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const vehicleId = Number(route.params.id)

  if (!vehicleId) {
    errorMessage.value = 'ไม่พบรหัสรถที่ต้องการ'
    isLoading.value = false
    return
  }

  try {
    vehicle.value = await getVehicleById(vehicleId)
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

const handleBookNow = () => {
  if (!vehicle.value) return
  // TODO: เชื่อมกับหน้าจองรถ / ตาราง booking จริง
  router.push(`/booking/${vehicle.value.vehicle_id}`)
}

onMounted(() => {
  loadVehicle()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>