<template>
  <div
    class="bg-slate-100 min-h-screen flex flex-col justify-center relative overflow-x-hidden font-kanit"
  >
    <!-- Main Container -->
    <div
      class="w-full max-w-md mx-auto px-4 py-10 flex-grow flex flex-col justify-center"
    >
      <!-- Header -->
      <!-- Header -->
<!-- Header -->
<header class="mb-8 flex flex-col items-center text-center">
  <!-- Logo Box -->
  <div
    class="bg-[#051329] p-0 rounded-2xl shadow-md flex items-center justify-center w-20 h-20 mb-4 overflow-hidden relative"
  >
    <!-- วาง URL ใหม่ที่คัดลอกมาตรง src ด้านล่างนี้ครับ -->
    <img 
      v-if="!imageError"
      src="https://knwkthqbuldtilzldnzs.supabase.co/storage/v1/object/public/qrick_moto_img/3F3F8400-DD57-4DB7-A8F0-366DC25005B5.png" 
      alt="Quick Moto Logo"
      class="w-full h-full object-contain"
      @error="imageError = true"
    />
    <i v-else class="fa-solid fa-motorcycle text-3xl text-white"></i>
  </div>

  <!-- Brand -->
  <span class="text-2xl font-bold text-slate-900 tracking-tight mb-1">
    Quick Moto
  </span>

  <!-- Tagline -->
  <p class="text-sm text-slate-500 font-normal">
    อิสระแห่งการเดินทางที่เหนือระดับ
  </p>
</header>

      <!-- Signup Card -->
      <main
        class="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-100"
      >
        <h1
          class="text-xl sm:text-2xl font-bold text-slate-900 mb-6"
        >
          สมัครสมาชิก
        </h1>

        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
        >
          <!-- Full Name -->
          <div>
            <label
              class="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ชื่อ-นามสกุล
            </label>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
              >
                <i class="fa-regular fa-user text-lg"></i>
              </span>

              <input
                v-model="form.fullName"
                type="text"
                placeholder="กรอกชื่อ-นามสกุล"
                autocomplete="name"
                required
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              />
            </div>
          </div>

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

          <!-- Phone -->
          <div>
            <label
              class="block text-sm font-medium text-slate-700 mb-1.5"
            >
              เบอร์โทรศัพท์
            </label>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
              >
                <i class="fa-solid fa-phone text-base"></i>
              </span>

              <input
                :value="form.phone"
                 @input="handlePhoneInput"
                type="tel"
                inputmode="numeric"
                maxlength="10"
                placeholder="08X-XXX-XXXX"
                autocomplete="tel"
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
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autocomplete="new-password"
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

          <!-- Confirm Password -->
          <div>
            <label
              class="block text-sm font-medium text-slate-700 mb-1.5"
            >
              ยืนยันรหัสผ่าน
            </label>

            <div class="relative">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none"
              >
                <i class="fa-solid fa-lock text-base"></i>
              </span>

              <input
                v-model="form.confirmPassword"
                :type="
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                "
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autocomplete="new-password"
                required
                class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
              />

              <button
                type="button"
                @click="
                  showConfirmPassword =
                    !showConfirmPassword
                "
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                aria-label="แสดงหรือซ่อนรหัสผ่าน"
              >
                <i
                  :class="
                    showConfirmPassword
                      ? 'fa-regular fa-eye-slash'
                      : 'fa-regular fa-eye'
                  "
                  class="text-base"
                ></i>
              </button>
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start gap-2 pt-1">
            <input
              id="terms"
              v-model="form.acceptTerms"
              type="checkbox"
              required
              class="mt-1 w-4 h-4 shrink-0 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
            />

            <label
              for="terms"
              class="text-xs text-slate-600 leading-relaxed cursor-pointer"
            >
              ฉันยอมรับ
              <a
                href="#"
                @click.prevent
                class="underline font-medium hover:text-slate-900"
              >
                เงื่อนไขการให้บริการ
              </a>
              และ
              <a
                href="#"
                @click.prevent
                class="underline font-bold text-slate-900"
              >
                นโยบายความเป็นส่วนตัว
              </a>
            </label>
          </div>

          <!-- Signup Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 bg-[#051329] hover:bg-[#0a1f3d] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <template v-if="isLoading">
              <i
                class="fa-solid fa-spinner fa-spin text-sm"
              ></i>
              <span>กำลังสมัครสมาชิก...</span>
            </template>

            <template v-else>
              <span>สมัครสมาชิก</span>
              <i
                class="fa-solid fa-arrow-right text-sm"
              ></i>
            </template>
          </button>
        </form>
      </main>

      <!-- Signin -->
      <div
        class="text-center pt-6 text-sm text-slate-600"
      >
        มีบัญชีอยู่แล้ว?

        <RouterLink
          to="/signin"
          class="font-bold text-slate-900 hover:underline ml-1"
        >
          เข้าสู่ระบบ
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { signupCustomer } from '../services/customerService'

const router = useRouter()

// ==============================
// Form
// ==============================

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

// ==============================
// UI State
// ==============================

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const imageError = ref(false)

// ==============================
// Signup
// ==============================

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const digitsOnly = target.value.replace(/\D/g, '').slice(0, 10)
  form.phone = digitsOnly
  target.value = digitsOnly
}

const handleSubmit = async () => {
  if (isLoading.value) return

  // ตรวจสอบชื่อ
  if (!form.fullName.trim()) {
    alert('กรุณากรอกชื่อ-นามสกุล')
    return
  }

  // ตรวจสอบ Email
  if (!form.email.trim()) {
    alert('กรุณากรอกอีเมล')
    return
  }

  // ตรวจสอบเบอร์โทร
  if (!form.phone.trim()) {
    alert('กรุณากรอกเบอร์โทรศัพท์')
    return
  }

  // ตรวจสอบ Password
  if (form.password.length < 8) {
    alert('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    return
  }

  // ตรวจสอบ Password ซ้ำ
  if (form.password !== form.confirmPassword) {
    alert('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน')
    return
  }

  // ตรวจสอบ Terms
  if (!form.acceptTerms) {
    alert('กรุณายอมรับเงื่อนไขการให้บริการ')
    return
  }

  isLoading.value = true

  try {
    await signupCustomer({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password
    })

    console.log('Signup Success')
    alert('สมัครสมาชิกสำเร็จ!')

    // ไปหน้า Login
    await router.push('/signin')

  } catch (error) {
    console.error('SIGNUP ERROR:', error)

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    const lowerMessage = message.toLowerCase()

    // Email ซ้ำ
    if (
      lowerMessage.includes('already registered') ||
      lowerMessage.includes('already been registered') ||
      lowerMessage.includes('user already exists')
    ) {
      alert('อีเมลนี้ถูกสมัครสมาชิกแล้ว')
      return
    }

    // Email ไม่ถูกต้อง
    if (
      lowerMessage.includes('invalid email')
    ) {
      alert('รูปแบบอีเมลไม่ถูกต้อง')
      return
    }

    // Password ไม่ผ่าน
    if (
      lowerMessage.includes('password')
    ) {
      alert(`รหัสผ่านไม่ถูกต้อง\n\n${message}`)
      return
    }

    // Database Error
    if (
      lowerMessage.includes('customer') ||
      lowerMessage.includes('database') ||
      lowerMessage.includes('row-level security') ||
      lowerMessage.includes('permission')
    ) {
      alert(
        `สมัคร Auth สำเร็จ แต่บันทึกข้อมูล customer ไม่สำเร็จ\n\n${message}`
      )
      return
    }

    alert(
      `สมัครสมาชิกไม่สำเร็จ\n\n${message}`
    )

  } finally {
    isLoading.value = false
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>