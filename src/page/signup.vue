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
                @click.prevent="showTerms = true"
                class="underline font-medium hover:text-slate-900"
              >
                เงื่อนไขการให้บริการ
              </a>
              และ
              <a
                href="#"
                @click.prevent="showPrivacyPolicy = true"
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

    <!-- Terms of Service Modal -->
    <Teleport to="body">
      <div v-if="showTerms" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showTerms = false">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col z-10">
          <div class="flex items-center justify-between p-5 border-b border-slate-200">
            <h3 class="text-lg font-bold text-slate-900">เงื่อนไขการให้บริการ</h3>
            <button @click="showTerms = false" class="text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div class="p-5 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
            <p class="text-xs text-slate-400">กรุณาอ่านและทำความเข้าใจเงื่อนไขการให้บริการก่อนทำการจองรถจักรยานยนต์ผ่านระบบ Quick Moto</p>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">1. การจองรถ</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>ผู้เช่าสามารถเลือกวันที่รับรถ วันที่คืนรถ และรถที่ต้องการเช่าผ่านระบบ</li>
                <li>ผู้เช่าต้องกรอกข้อมูลสำหรับการจอง ได้แก่ ชื่อผู้เช่าและเบอร์โทรศัพท์</li>
                <li>การจองจะต้องชำระค่ามัดจำจำนวน 500 บาท เพื่อยืนยันการจอง</li>
                <li>การจองจะมีผลเมื่อร้านตรวจสอบข้อมูลและอนุมัติการจองเรียบร้อยแล้ว</li>
                <li>หากเกิดกรณีรถที่จองไว้ไม่สามารถให้บริการได้ ร้านสามารถเปลี่ยนเป็นรถรุ่นเดียวกันให้ หรือหากไม่มีรถรุ่นเดียวกัน สามารถเปลี่ยนเป็นรถที่ดีกว่าโดยคิดราคาเท่าเดิม</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">2. การชำระเงิน</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>ผู้เช่าต้องชำระค่ามัดจำการจองจำนวน 500 บาทตามที่ระบบกำหนด</li>
                <li>ผู้เช่าต้องแนบหลักฐานการชำระเงินผ่านระบบ</li>
                <li>ค่าเช่ารถส่วนที่เหลือชำระที่ร้านในขั้นตอนการทำสัญญาเช่า</li>
                <li>ผู้เช่าควรตรวจสอบจำนวนเงินและรายละเอียดการจองก่อนยืนยันการชำระเงิน</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">3. การรับรถ</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>ผู้เช่าต้องมารับรถภายในวันที่กำหนดและภายในเวลาทำการของร้าน</li>
                <li>ผู้เช่าต้องเตรียมบัตรประชาชน ใบขับขี่ สำหรับการเช่า</li>
                <li>ก่อนส่งมอบรถ จะมีการตรวจสอบและบันทึกสภาพรถ ได้แก่ รอยขีดข่วน ระดับน้ำมัน และเลขไมล์</li>
                <li>ผู้เช่าควรตรวจสอบสภาพรถก่อนนำรถออกจากร้าน หากพบความผิดปกติควรแจ้งให้ร้านทราบทันที</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">4. การคืนรถ</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>ผู้เช่าต้องคืนรถตามวันที่และเวลาที่กำหนดในการจอง</li>
                <li>เมื่อคืนรถ ทางร้านจะตรวจสอบระดับน้ำมัน ความเสียหาย และเลขไมล์</li>
                <li>หากคืนรถล่าช้า จะมีค่าปรับในอัตรา 50 บาทต่อชั่วโมง</li>
                <li>กรณีพบความเสียหายของรถ ทางร้านจะดำเนินการตามเงื่อนไขและความรับผิดชอบที่กำหนด</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">5. การยกเลิกการจอง</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>ผู้เช่าสามารถยกเลิกการจองได้ตามเงื่อนไขของระบบ</li>
                <li>กรณียกเลิกการจอง ทางร้านไม่มีนโยบายคืนเงินค่ามัดจำการจอง</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">6. ความเสียหายของรถ</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>กรณีรถเกิดความเสียหายบริเวณยาง ผู้เช่าต้องรับผิดชอบค่าใช้จ่ายที่เกิดขึ้น</li>
                <li>หากรถเกิดความเสียหายในกรณีอื่น ร้านจะพิจารณาดำเนินการเปลี่ยนรถให้ตามเงื่อนไขของร้าน</li>
                <li>ผู้เช่าต้องแจ้งร้านทันทีเมื่อเกิดความเสียหายหรือเหตุผิดปกติกับรถ</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">7. กรณีเกิดอุบัติเหตุ</h4>
              <ul class="list-disc pl-4 space-y-0.5">
                <li>หากเกิดอุบัติเหตุระหว่างการเช่า ผู้เช่าต้องแจ้งให้ทางร้านทราบ</li>
                <li>ผู้เช่าต้องรับผิดชอบค่าเสียหายตามเงื่อนไขของร้าน</li>
                <li>กรณีที่สามารถใช้สิทธิ์ประกันจาก พ.ร.บ. รถได้ สามารถดำเนินการเบิกประกันตามกรณี</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">8. การยอมรับเงื่อนไข</h4>
              <p>การทำรายการจองผ่านระบบ Quick Moto ถือว่าผู้เช่าได้อ่าน ทำความเข้าใจ และยอมรับเงื่อนไขการให้บริการที่กำหนดไว้ทั้งหมดแล้ว</p>
            </div>
          </div>
          <div class="p-5 border-t border-slate-200">
            <button @click="showTerms = false" class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white font-medium py-2.5 px-4 rounded-xl transition-all">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Privacy Policy Modal -->
    <Teleport to="body">
      <div v-if="showPrivacyPolicy" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showPrivacyPolicy = false">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col z-10">
          <div class="flex items-center justify-between p-5 border-b border-slate-200">
            <h3 class="text-lg font-bold text-slate-900">นโยบายความเป็นส่วนตัว</h3>
            <button @click="showPrivacyPolicy = false" class="text-slate-400 hover:text-slate-600 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div class="p-5 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
            <div>
              <h4 class="font-bold text-slate-900 mb-1">1. การเก็บรวบรวมข้อมูล</h4>
              <p>เราเก็บรวบรวมข้อมูลส่วนบุคคลของท่าน ได้แก่ ชื่อ-นามสกุล อีเมล เบอร์โทรศัพท์ หมายเลขบัตรประชาชน และใบอนุญาตขับขี่ เมื่อท่านสมัครสมาชิกหรือทำรายการเช่ารถผ่านระบบ</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">2. การใช้ข้อมูล</h4>
              <p>ข้อมูลของท่านจะถูกนำไปใช้เพื่อวัตถุประสงค์ในการยืนยันตัวตน ดำเนินการเช่ารถ ติดต่อสื่อสาร และอำนวยความสะดวกในการให้บริการของร้าน</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">3. การเปิดเผยข้อมูล</h4>
              <p>เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลภายนอก เว้นแต่กรณีที่กฎหมายกำหนด หรือได้รับความยินยอมจากท่าน</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">4. การรักษาความปลอดภัยของข้อมูล</h4>
              <p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันการเข้าถึง ใช้ แก้ไข หรือเปิดเผยข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">5. สิทธิของเจ้าของข้อมูล</h4>
              <p>ท่านมีสิทธิ์ขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา โดยติดต่อร้านโดยตรง</p>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 mb-1">6. การติดต่อ</h4>
              <p>หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อร้าน Quick Moto ผ่านช่องทางที่ระบุในหน้าติดต่อร้าน</p>
            </div>
          </div>
          <div class="p-5 border-t border-slate-200">
            <button @click="showPrivacyPolicy = false" class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white font-medium py-2.5 px-4 rounded-xl transition-all">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
const showPrivacyPolicy = ref(false)
const showTerms = ref(false)

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

  if (!/^\d{10}$/.test(form.phone.trim())) {
    alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก')
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