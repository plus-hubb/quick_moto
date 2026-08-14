<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-5 py-2.5"
  >
    <div class="max-w-md mx-auto grid grid-cols-4 items-center">

      <!-- Home -->
      <button
        type="button"
        @click="goHome"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'home'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'home'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-solid fa-house text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'home'
              ? 'font-medium'
              : ''
          ]"
        >
          Home
        </span>
      </button>


      <!-- Search -->
      <button
        type="button"
        @click="goSearch"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'search'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'search'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-solid fa-magnifying-glass text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'search'
              ? 'font-medium'
              : ''
          ]"
        >
          Search
        </span>
      </button>


      <!-- Bookings -->
      <button
        type="button"
        @click="goBooking"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'booking'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'booking'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-solid fa-calendar-check text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'booking'
              ? 'font-medium'
              : ''
          ]"
        >
          Bookings
        </span>
      </button>


      <!-- Profile -->
      <button
        type="button"
        @click="goProfile"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'profile'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'profile'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-regular fa-user text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'profile'
              ? 'font-medium'
              : ''
          ]"
        >
          Profile
        </span>
      </button>

    </div>
  </nav>
</template>


<script setup lang="ts">

import { useRouter } from 'vue-router'

const router = useRouter()

// หน้าที่กำลังเปิดอยู่
const props = defineProps<{
  active: 'home' | 'search' | 'booking' | 'profile'
}>()


// ==============================
// Navigation
// ==============================

const goHome = () => {
  router.push('/home')
}

const goSearch = () => {
  router.push('/search')
}

const goBooking = () => {
  router.push('/booking')
}

const goProfile = () => {
  router.push('/profile')
}

</script>