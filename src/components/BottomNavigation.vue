<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-5 py-2.5 md:py-3 md:shadow-lg md:border-slate-100"
  >
    <div class="max-w-2xl mx-auto grid grid-cols-4 items-center">

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


      <!-- Bookings -->
      <button
        type="button"
        @click="goBookings"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'bookings'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'bookings'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-solid fa-calendar-check text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'bookings'
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


      <!-- Contact -->
      <button
        type="button"
        @click="goContact"
        :class="[
          'flex flex-col items-center gap-1 transition-colors',
          active === 'contact'
            ? 'text-[#051329]'
            : 'text-slate-400'
        ]"
      >
        <div
          :class="[
            'rounded-md px-3 py-1',
            active === 'contact'
              ? 'bg-[#dce5ff]'
              : ''
          ]"
        >
          <i class="fa-solid fa-phone text-sm"></i>
        </div>

        <span
          :class="[
            'text-[10px]',
            active === 'contact'
              ? 'font-medium'
              : ''
          ]"
        >
          Contact
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
  active: 'home' | 'bookings' | 'profile' | 'contact'
}>()


// ==============================
// Navigation
// ==============================

const goHome = () => {
  router.push('/home')
}

const goBookings = () => {
  router.push('/bookings')
}

const goProfile = () => {
  router.push('/profile')
}

const goContact = () => {
  router.push('/contact')
}

</script>