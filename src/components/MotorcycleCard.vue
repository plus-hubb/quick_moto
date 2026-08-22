<template>
  <div
    class="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform"
    @click="goToDetail"
  >

    <!-- Image -->
    <div class="w-full h-40 sm:h-48 bg-slate-200 overflow-hidden">
      <img
        v-if="vehicle.image"
        :src="vehicle.image"
        :alt="`${vehicle.brand} ${vehicle.model}`"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
        <i class="fa-solid fa-motorcycle text-3xl"></i>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            {{ vehicle.brand }} {{ vehicle.model }}
          </h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            {{ vehicle.vehicle_type || '-' }}
          </p>
        </div>

        <div class="text-right shrink-0">
          <p class="text-base sm:text-lg font-bold text-slate-900">
            ฿{{ formattedPrice }}
          </p>
          <p class="text-xs text-slate-400 -mt-0.5">/ วัน</p>
        </div>
      </div>

      <!-- Specs -->
      <div class="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
        <div class="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm">
          <i class="fa-solid fa-gauge-high text-slate-400"></i>
          <span>{{ vehicle.engine_size ?? '-' }} CC</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-500 text-xs sm:text-sm">
          <i class="fa-solid fa-warehouse text-slate-400"></i>
          <span>มีในคลัง {{ vehicle.quantity }} คัน</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Vehicle } from '../services/customerService'

const props = defineProps<{
  vehicle: Vehicle
}>()

const router = useRouter()

// ใส่ comma คั่นหลักพันให้ราคาอ่านง่าย เช่น 1200 -> 1,200
const formattedPrice = computed(() => Number(props.vehicle.price).toLocaleString('en-US'))

// กดการ์ดแล้วไปหน้ารายละเอียดของรถคันนั้น
const goToDetail = () => {
  router.push(`/vehicle/${props.vehicle.vehicle_id}`)
}
</script>