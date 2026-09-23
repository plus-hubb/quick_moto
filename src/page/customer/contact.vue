<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3 md:py-4 md:px-6 flex items-center gap-3">
      <button type="button" @click="goBack" class="text-white">
        <i class="fa-solid fa-arrow-left text-base"></i>
      </button>
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        ติดต่อเรา
      </span>
    </div>

    <div class="w-full max-w-2xl mx-auto px-4 pt-6">

      <!-- Contact Cards -->
      <div class="space-y-4">

        <!-- Phone -->
        <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#dce5ff] flex items-center justify-center">
              <i class="fa-solid fa-phone text-[#051329] text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900">โทรศัพท์</h3>
              <p class="text-sm text-slate-500">02-123-4567</p>
              <p class="text-xs text-slate-400 mt-1">จันทร์ - เสาร์ 08:00 - 17:00 น.</p>
            </div>
          </div>
        </div>

        <!-- Line -->
        <a href="https://line.me/ti/p/5SAu79wft_" target="_blank" rel="noopener noreferrer" class="bg-white rounded-2xl p-5 shadow-md border border-slate-100 block hover:shadow-lg transition-shadow">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#dce5ff] flex items-center justify-center">
              <i class="fa-brands fa-line text-[#051329] text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900">Line Official</h3>
              <p class="text-sm text-slate-500">@quickmoto</p>
              <p class="text-xs text-slate-400 mt-1">แชทได้ตลอด 24 ชม. กดเพื่อเพิ่มเพื่อน</p>
            </div>
          </div>
        </a>

        <!-- Email -->
        <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#dce5ff] flex items-center justify-center">
              <i class="fa-solid fa-envelope text-[#051329] text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900">อีเมล</h3>
              <p class="text-sm text-slate-500">support@quickmoto.com</p>
              <p class="text-xs text-slate-400 mt-1">ตอบกลับภายใน 24 ชม.</p>
            </div>
          </div>
        </div>

        <!-- Facebook -->
        <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#dce5ff] flex items-center justify-center">
              <i class="fa-brands fa-facebook text-[#051329] text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900">Facebook</h3>
              <p class="text-sm text-slate-500">Quick Moto Thailand</p>
              <p class="text-xs text-slate-400 mt-1">ติดตามข่าวสารและโปรโมชั่น</p>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="bg-white rounded-2xl p-5 shadow-md border border-slate-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#dce5ff] flex items-center justify-center">
              <i class="fa-solid fa-location-dot text-[#051329] text-lg"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900">ที่อยู่</h3>
              <p class="text-sm text-slate-500">123 ถนนสุขุมวิท แขวงคลองเตย</p>
              <p class="text-xs text-slate-400 mt-1">เขตคลองเตย กรุงเทพฯ 10110</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>

  <BottomNavigation active="contact" />
</template>


<script setup lang="ts">

import { useRouter } from 'vue-router'
import BottomNavigation from '../../components/BottomNavigation.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}

</script>


<style>

@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}

</style>
