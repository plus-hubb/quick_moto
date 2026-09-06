<template>
  <!-- Overlay สำหรับมือถือ (คลิกเพื่อปิด sidebar) -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/40 z-40 lg:hidden"
    @click="$emit('close')"
  ></div>

  <aside
    class="fixed top-0 left-0 h-full w-64 bg-[#051329] text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo -->
    <div class="px-5 py-6 border-b border-white/10">
      <h1 class="text-lg font-bold">Azure Motion</h1>
      <p class="text-xs text-white/50 mt-0.5">การจัดการรถเช่า</p>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
        :class="isActive(item.path)
          ? 'bg-white text-[#051329] font-medium'
          : 'text-white/70 hover:bg-white/10 hover:text-white'"
      >
        <i :class="item.icon" class="w-4 text-center"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Logout -->
    <div class="px-3 py-4 border-t border-white/10">
      <button
        type="button"
        @click="$emit('logout')"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
      >
        <i class="fa-solid fa-right-from-bracket w-4 text-center"></i>
        <span>ออกจากระบบ</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
  logout: []
}>()

const route = useRoute()

const navItems = [
  { path: '/admin/dashboard', label: 'แดชบอร์ด', icon: 'fa-solid fa-grid-2' },
  { path: '/admin/vehicles', label: 'จัดการข้อมูลรถ', icon: 'fa-solid fa-motorcycle' },
  { path: '/admin/bookings', label: 'จัดการการจอง', icon: 'fa-regular fa-bookmark' },
  { path: '/admin/cancellations', label: 'คำขอยกเลิก', icon: 'fa-regular fa-calendar-xmark' },
  { path: '/admin/rental-history', label: 'ประวัติการเช่า', icon: 'fa-solid fa-clock-rotate-left' },
  { path: '/admin/revenue', label: 'รายงานรายได้', icon: 'fa-solid fa-chart-line' }
]

const isActive = (path: string) => route.path.startsWith(path)
</script>