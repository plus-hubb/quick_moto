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

        <div class="flex-1 relative max-w-md">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <i class="fa-solid fa-magnifying-glass text-sm"></i>
          </span>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="ค้นหารถด้วยยี่ห้อ รุ่น หรือรหัส..."
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
          >
        </div>

        <div class="flex items-center gap-3 ml-auto shrink-0">
          <button type="button" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-gear"></i>
          </button>
          <div class="flex items-center gap-2">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-medium text-slate-900 leading-tight">ผู้ดูแลระบบ</p>
              <p class="text-[10px] text-slate-400 leading-tight">ผู้จัดการกองรถ</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#051329] text-white flex items-center justify-center text-xs font-bold shrink-0">
              A
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-4 sm:p-6">

        <!-- Breadcrumb -->
        <p class="text-xs text-slate-400 mb-1">
          กองรถ <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
          <span class="text-slate-600 font-medium">จัดการข้อมูลรถ</span>
        </p>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-slate-900">จัดการข้อมูลรถ</h1>
          <button
            type="button"
            @click="openCreateModal"
            class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-sm font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <i class="fa-solid fa-plus"></i>
            เพิ่มรถใหม่
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
          กำลังโหลดข้อมูล...
        </div>

        <!-- Error -->
        <div v-else-if="errorMessage" class="text-center text-red-400 text-sm py-16">
          {{ errorMessage }}
        </div>

        <!-- Empty -->
        <div v-else-if="filteredVehicles.length === 0" class="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
          ยังไม่มีข้อมูลรถ ลองเพิ่มรถคันแรกได้เลย
        </div>

        <!-- Desktop Table -->
        <div v-else class="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs">
                <th class="text-left font-medium px-5 py-3">รถ</th>
                <th class="text-left font-medium px-5 py-3">เครื่องยนต์</th>
                <th class="text-left font-medium px-5 py-3">เกียร์</th>
                <th class="text-left font-medium px-5 py-3">ราคา/วัน</th>
                <th class="text-left font-medium px-5 py-3">คงเหลือ</th>
                <th class="text-right font-medium px-5 py-3">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="vehicle in filteredVehicles"
                :key="vehicle.vehicle_id"
                class="border-t border-slate-100 hover:bg-slate-50/60"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      <img v-if="vehicle.image" :src="vehicle.image" class="w-full h-full object-cover">
                      <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                        <i class="fa-solid fa-motorcycle text-sm"></i>
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-slate-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
                      <p class="text-xs text-slate-400">รหัส #{{ vehicle.vehicle_id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3 text-slate-600">{{ vehicle.engine_size ?? '-' }} cc</td>
                <td class="px-5 py-3 text-slate-600">{{ vehicle.vehicle_type || '-' }}</td>
                <td class="px-5 py-3 text-slate-900 font-medium">฿{{ formatPrice(vehicle.price) }}</td>
                <td class="px-5 py-3">
                  <span
                    class="text-xs font-medium px-2.5 py-1 rounded-full"
                    :class="vehicle.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
                  >
                    {{ vehicle.quantity }} คัน
                  </span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      @click="openEditModal(vehicle)"
                      class="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      @click="handleDelete(vehicle)"
                      class="w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div v-if="!isLoading && !errorMessage" class="md:hidden space-y-3">
          <div
            v-for="vehicle in filteredVehicles"
            :key="vehicle.vehicle_id"
            class="bg-white rounded-2xl border border-slate-100 p-4"
          >
            <div class="flex gap-3 mb-3">
              <div class="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                <img v-if="vehicle.image" :src="vehicle.image" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <i class="fa-solid fa-motorcycle"></i>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
                <p class="text-xs text-slate-400">รหัส #{{ vehicle.vehicle_id }} • {{ vehicle.engine_size ?? '-' }}cc • {{ vehicle.vehicle_type || '-' }}</p>
                <p class="text-sm font-bold text-slate-900 mt-1">฿{{ formatPrice(vehicle.price) }} <span class="text-xs font-normal text-slate-400">/วัน</span></p>
              </div>
              <span
                class="text-xs font-medium px-2.5 py-1 rounded-full h-fit shrink-0"
                :class="vehicle.quantity > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
              >
                {{ vehicle.quantity }} คัน
              </span>
            </div>
            <div class="flex gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                @click="openEditModal(vehicle)"
                class="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium"
              >
                <i class="fa-solid fa-pen mr-1"></i> แก้ไข
              </button>
              <button
                type="button"
                @click="handleDelete(vehicle)"
                class="flex-1 py-2 rounded-lg border border-red-200 text-red-500 text-xs font-medium"
              >
                <i class="fa-solid fa-trash mr-1"></i> ลบ
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- Modal -->
    <VehicleFormModal
      v-if="showModal"
      :mode="modalMode"
      :vehicle="selectedVehicle"
      @close="showModal = false"
      @saved="handleSaved"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import VehicleFormModal from '../../components/vehicleformmodal.vue'
import { getAllVehiclesAdmin, deleteVehicle } from '../../services/adminvehicleservice'
import { logoutAdmin } from '../../services/customerService'
import type { Vehicle } from '../../services/customerService'

const router = useRouter()

const isSidebarOpen = ref(false)
const vehicles = ref<Vehicle[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchKeyword = ref('')

const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedVehicle = ref<Vehicle | null>(null)

const filteredVehicles = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return vehicles.value

  return vehicles.value.filter((v) => {
    const haystack = `${v.brand} ${v.model} ${v.vehicle_id}`.toLowerCase()
    return haystack.includes(keyword)
  })
})

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const loadVehicles = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    vehicles.value = await getAllVehiclesAdmin()
  } catch (err) {
    errorMessage.value = 'โหลดข้อมูลรถไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  selectedVehicle.value = null
  showModal.value = true
}

const openEditModal = (vehicle: Vehicle) => {
  modalMode.value = 'edit'
  selectedVehicle.value = vehicle
  showModal.value = true
}

const handleSaved = () => {
  showModal.value = false
  loadVehicles()
}

const handleDelete = async (vehicle: Vehicle) => {
  const confirmed = window.confirm(`ยืนยันลบ "${vehicle.brand} ${vehicle.model}" ออกจากระบบ?`)
  if (!confirmed) return

  try {
    await deleteVehicle(vehicle.vehicle_id)
    await loadVehicles()
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'ลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
    alert(
      message.includes('foreign key')
        ? 'ลบไม่ได้ เพราะรถคันนี้เคยมีประวัติการจองอยู่ในระบบ — แนะนำให้แก้จำนวนคันเป็น 0 แทนการลบ'
        : message
    )
  }
}

const handleLogout = async () => {
  await logoutAdmin()
  router.push('/signin')
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