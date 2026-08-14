<template>
  <div
    class="bg-slate-100 min-h-screen flex flex-col justify-center relative overflow-x-hidden font-kanit"
  >
    <!-- Main Container -->
    <div
      class="w-full max-w-md mx-auto px-4 py-10 flex-grow flex flex-col justify-center"
    >
      <!-- Header -->
      <header class="mb-8 flex flex-col items-center text-center">
        <!-- Logo Image from Supabase Bucket -->
        <div
          class="bg-[#051329] p-0 rounded-2xl shadow-md flex items-center justify-center w-20 h-20 mb-4 overflow-hidden"
        >
          <img 
            src="https://knwkthqbuldtilzldnzs.supabase.co/storage/v1/object/public/qrick_moto_img/3F3F8400-DD57-4DB7-A8F0-366DC25005B5.png" 
            alt="Quick Moto Logo"
            class="w-full h-full object-contain"
          />
        </div>

        <!-- Brand -->
        <span
          class="text-2xl font-bold text-slate-900 tracking-tight mb-1"
        >
          Quick Moto
        </span>

        <!-- Tagline -->
        <p class="text-sm text-slate-500 font-normal">
          อิสระแห่งการเดินทางที่เหนือระดับ
        </p>
      </header>

      <!-- Login Card -->
      <main
        class="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100"
      >
        <h1
          class="text-xl sm:text-2xl font-bold text-slate-900 mb-6"
        >
          เข้าสู่ระบบ
        </h1>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
        >
          <!-- Email -->
          <div>
            <label
              class="block text-sm font-medium text-slate-700 mb-1.5"
            >
              อีเมล
            </label>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
              >
                <i class="fa-regular fa-envelope text-lg"></i>
              </span>

              <input
                v-model="form.email"
                type="email"
                placeholder="example@email.com"
                autocomplete="email"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label
              class="block text-sm font-medium text-slate-700 mb-1.5"
            >
              รหัสผ่าน
            </label>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
              >
                <i class="fa-solid fa-lock text-base"></i>
              </span>

              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่านของคุณ"
                autocomplete="current-password"
                required
                class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              />

              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                aria-label="แสดงหรือซ่อนรหัสผ่าน"
              >
                <i
                  :class="
                    showPassword
                      ? 'fa-regular fa-eye-slash'
                      : 'fa-regular fa-eye'
                  "
                  class="text-base"
                ></i>
              </button>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 bg-[#051329] hover:bg-[#0a1f3d] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <template v-if="isLoading">
              <i class="fa-solid fa-spinner fa-spin text-sm"></i>
              <span>กำลังเข้าสู่ระบบ...</span>
            </template>

            <template v-else>
              <span>เข้าสู่ระบบ</span>
              <i class="fa-solid fa-arrow-right text-sm"></i>
            </template>
          </button>
        </form>

        <!-- Forgot Password -->
        <div class="text-center mt-5">
          <button
            type="button"
            @click="handleForgotPassword"
            class="text-sm text-slate-500 hover:text-slate-900 hover:underline transition-colors"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>
      </main>

      <!-- Signup -->
      <div class="text-center pt-6 text-sm text-slate-600">
        ยังไม่มีบัญชี?

        <RouterLink
          to="/"
          class="font-bold text-slate-900 hover:underline ml-1"
        >
          สมัครสมาชิก
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

import {
  loginCustomer,
  resetCustomerPassword
} from '../services/customerService'

const router = useRouter()

// ==============================
// Form
// ==============================

const form = reactive({
  email: '',
  password: ''
})

// ==============================
// UI State
// ==============================

const showPassword = ref(false)
const isLoading = ref(false)

// ==============================
// Login
// ==============================

const handleSubmit = async () => {

  if (isLoading.value) return

  // ตรวจสอบ Email
  if (!form.email.trim()) {
    alert('กรุณากรอกอีเมล')
    return
  }

  // ตรวจสอบ Password
  if (!form.password) {
    alert('กรุณากรอกรหัสผ่าน')
    return
  }

  isLoading.value = true

  try {

    // เรียก Service
    await loginCustomer(
      form.email,
      form.password
    )

    console.log('Login Success')

    alert('เข้าสู่ระบบสำเร็จ!')

    // ไปหน้า Home
    await router.push('/home')

  } catch (error) {

    console.error(
      'LOGIN ERROR:',
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    const lowerMessage =
      message.toLowerCase()

    if (
      lowerMessage.includes(
        'invalid login credentials'
      )
    ) {

      alert(
        'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      )

    } else if (
      lowerMessage.includes(
        'email not confirmed'
      )
    ) {

      alert(
        'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
      )

    } else {

      alert(
        `เข้าสู่ระบบไม่สำเร็จ\n\n${message}`
      )
    }

  } finally {

    isLoading.value = false

  }
}

// ==============================
// Forgot Password
// ==============================

const handleForgotPassword = async () => {

  if (!form.email.trim()) {
    alert('กรุณากรอกอีเมลก่อน')
    return
  }

  try {

    await resetCustomerPassword(
      form.email
    )

    alert(
      'ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมลแล้ว'
    )

  } catch (error) {

    console.error(
      'RESET PASSWORD ERROR:',
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    alert(
      `ไม่สามารถส่งอีเมลได้\n\n${message}`
    )
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>