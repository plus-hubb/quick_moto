<template>
  <div class="bg-slate-100 min-h-screen font-kanit pb-24">

    <!-- Top Bar -->
    <div class="bg-[#051329] px-4 py-3 md:py-4 md:px-6 flex items-center gap-3">
      <button type="button" @click="goBack" class="text-white">
        <i class="fa-solid fa-arrow-left text-base"></i>
      </button>
      <span class="inline-block bg-white/10 text-white text-sm font-medium px-5 py-1.5 rounded-full border border-white/20">
        แก้ไขโปรไฟล์
      </span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
      กำลังโหลดข้อมูล...
    </div>

    <!-- Customer -->
    <div v-else-if="customer" class="w-full max-w-2xl mx-auto px-4 pt-6">

      <!-- Profile Image -->
      <div class="flex flex-col items-center pt-2 mb-6">
        <div class="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#051329] text-white flex items-center justify-center shadow-sm overflow-hidden">
          <span class="text-3xl sm:text-4xl font-bold">{{ customerInitial }}</span>
        </div>
      </div>

      <!-- Name -->
      <div class="mb-4">
        <label class="block text-xs text-slate-500 mb-1.5">ชื่อ-นามสกุล</label>
        <div class="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <i class="fa-regular fa-user text-slate-400 text-sm"></i>
          <div v-if="!isEditing" class="flex-1 text-sm text-slate-800">
            {{ customer.name || '-' }}
          </div>
          <input
            v-else
            v-model="editName"
            type="text"
            class="flex-1 text-sm text-slate-800 outline-none bg-transparent"
            placeholder="ชื่อ-นามสกุล"
          />
          <button
            v-if="!isEditing && !isChangingPassword"
            type="button"
            class="text-xs text-slate-600 flex items-center gap-1"
            @click="editProfile"
          >
            <i class="fa-solid fa-pen text-[10px]"></i>
            แก้ไข
          </button>
        </div>
      </div>

      <!-- Email -->
      <div class="mb-4">
        <label class="block text-xs text-slate-500 mb-1.5">อีเมล</label>
        <div class="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <i class="fa-regular fa-envelope text-slate-400 text-sm"></i>
          <span class="flex-1 text-sm text-slate-800 truncate">
            {{ customer.email || '-' }}
          </span>
        </div>
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="block text-xs text-slate-500 mb-1.5">เบอร์โทรศัพท์</label>
        <div class="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <i class="fa-solid fa-phone text-slate-400 text-sm"></i>
          <div v-if="!isEditing" class="flex-1 text-sm text-slate-800">
            {{ customer.phone || '-' }}
          </div>
          <input
            v-else
            :value="editPhone"
            @input="handlePhoneInput"
            type="tel"
            inputmode="numeric"
            maxlength="10"
            class="flex-1 text-sm text-slate-800 outline-none bg-transparent"
            placeholder="เบอร์โทรศัพท์"
          />
          <button
            v-if="!isEditing && !isChangingPassword"
            type="button"
            class="text-xs text-slate-600 flex items-center gap-1"
            @click="editProfile"
          >
            <i class="fa-solid fa-pen text-[10px]"></i>
            แก้ไข
          </button>
        </div>
      </div>

      <!-- Password -->
      <div class="mb-4">
        <label class="block text-xs text-slate-500 mb-1.5">รหัสผ่าน</label>

        <!-- Normal Password -->
        <div
          v-if="!isChangingPassword"
          class="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
        >
          <i class="fa-solid fa-lock text-slate-400 text-sm"></i>
          <span class="flex-1 text-sm text-slate-800 tracking-widest">••••••••••••</span>
          <button
            type="button"
            class="text-xs text-slate-600 flex items-center gap-1"
            @click="changePassword"
          >
            <i class="fa-solid fa-pen text-[10px]"></i>
            แก้ไข
          </button>
        </div>

        <!-- Change Password -->
        <div v-else class="bg-white border border-slate-100 rounded-2xl p-4 space-y-4 shadow-sm">

          <!-- Current Password -->
          <div>
            <label class="block text-xs text-slate-500 mb-1.5">รหัสผ่านเดิม</label>
            <div class="border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <i class="fa-solid fa-lock text-slate-400 text-sm"></i>
              <input
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="flex-1 text-sm outline-none bg-transparent"
                placeholder="กรอกรหัสผ่านเดิม"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="text-slate-400"
              >
                <i :class="showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-xs text-slate-500 mb-1.5">รหัสผ่านใหม่</label>
            <div class="border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <i class="fa-solid fa-lock text-slate-400 text-sm"></i>
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="flex-1 text-sm outline-none bg-transparent"
                placeholder="กรอกรหัสผ่านใหม่"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="text-slate-400"
              >
                <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs text-slate-500 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
            <div class="border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <i class="fa-solid fa-lock text-slate-400 text-sm"></i>
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="flex-1 text-sm outline-none bg-transparent"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autocomplete="new-password"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="text-slate-400"
              >
                <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Password Buttons -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              @click="cancelPasswordChange"
              :disabled="isChangingPasswordSaving"
              class="bg-slate-200 text-slate-700 font-medium py-3 rounded-xl disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              @click="savePassword"
              :disabled="isChangingPasswordSaving"
              class="bg-[#051329] text-white font-medium py-3 rounded-xl disabled:opacity-50"
            >
              <span v-if="!isChangingPasswordSaving">เปลี่ยนรหัสผ่าน</span>
              <span v-else>กำลังบันทึก...</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Profile Save / Cancel -->
      <div v-if="isEditing" class="grid grid-cols-2 gap-3 mt-6">
        <button
          type="button"
          @click="cancelEdit"
          :disabled="isSaving"
          class="w-full bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition active:scale-[0.99] disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          @click="saveProfile"
          :disabled="isSaving"
          class="w-full bg-[#051329] text-white font-medium py-3 rounded-xl shadow-lg transition active:scale-[0.99] disabled:opacity-50"
        >
          <span v-if="!isSaving">บันทึก</span>
          <span v-else>กำลังบันทึก...</span>
        </button>
      </div>

      <!-- Logout -->
      <button
        v-if="!isEditing && !isChangingPassword"
        type="button"
        @click="handleLogout"
        class="w-full mt-8 bg-[#051329] hover:bg-[#0a1f3d] text-white font-medium py-3 rounded-xl shadow-lg transition active:scale-[0.99]"
      >
        ออกจากระบบ
      </button>

    </div>

    <!-- No Customer -->
    <div v-else class="w-full max-w-2xl mx-auto px-4 pt-10">
      <div class="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
        <i class="fa-solid fa-circle-exclamation text-red-400 text-2xl mb-3"></i>
        <p class="text-red-500 font-medium">ไม่พบข้อมูลลูกค้า</p>
        <button
          type="button"
          @click="goSignin"
          class="mt-4 bg-[#051329] text-white px-5 py-2.5 rounded-xl text-sm"
        >
          กลับไปเข้าสู่ระบบ
        </button>
      </div>
    </div>

  </div>

  <BottomNavigation active="profile" />
</template>


<script setup lang="ts">

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNavigation from '../../components/BottomNavigation.vue'

import {
  getCurrentCustomer,
  logoutCustomer,
  updateCustomerProfile,
  updateCustomerPassword
} from '../../services/customerService'


const router = useRouter()


// ==============================
// Customer
// ==============================

interface Customer {
  customer_id: string | number
  auth_user_id?: string
  name: string
  email: string
  phone: string
}

const customer = ref<Customer | null>(null)
const isLoading = ref(true)

const customerInitial = computed(() => {
  return customer.value?.name?.charAt(0)?.toUpperCase() ?? '?'
})


// ==============================
// Edit Profile
// ==============================

const isEditing = ref(false)
const isSaving = ref(false)

const editName = ref('')
const editPhone = ref('')

const handlePhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const digitsOnly = target.value.replace(/\D/g, '').slice(0, 10)
  editPhone.value = digitsOnly
  target.value = digitsOnly
}


// ==============================
// Change Password
// ==============================

const isChangingPassword = ref(false)
const isChangingPasswordSaving = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)


// ==============================
// Load Customer
// ==============================

const loadCustomer = async () => {

  try {

    isLoading.value = true

    const currentCustomer =
      await getCurrentCustomer()

    if (!currentCustomer) {

      customer.value = null

      await router.push('/signin')

      return
    }

    customer.value =
      currentCustomer as Customer

  } catch (error) {

    console.error(
      'Load Customer Error:',
      error
    )

    customer.value = null

    await router.push('/signin')

  } finally {

    isLoading.value = false

  }

}


// ==============================
// Edit Profile
// ==============================

const editProfile = () => {

  if (!customer.value) {
    return
  }

  isChangingPassword.value = false

  editName.value =
    customer.value.name || ''

  editPhone.value =
    customer.value.phone || ''

  isEditing.value = true

}


// ==============================
// Save Profile
// ==============================

const saveProfile = async () => {

  if (!customer.value) {
    return
  }

  if (!editPhone.value.trim()) {
    alert('กรุณากรอกเบอร์โทรศัพท์')
    return
  }

  if (!/^\d{10}$/.test(editPhone.value.trim())) {
    alert('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก')
    return
  }

  try {

    isSaving.value = true

    /*
     * สำคัญ:
     * customerService.ts
     * updateCustomerProfile()
     * รับ argument แค่ object เดียว
     */

    const updatedCustomer =
      await updateCustomerProfile({
        name: editName.value,
        phone: editPhone.value
      })

    customer.value =
      updatedCustomer as Customer

    localStorage.setItem(
      'customer',
      JSON.stringify(updatedCustomer)
    )

    isEditing.value = false

    alert(
      'บันทึกข้อมูลเรียบร้อยแล้ว'
    )

  } catch (error) {

    console.error(
      'Save Profile Error:',
      error
    )

    if (error instanceof Error) {

      alert(
        error.message
      )

    } else {

      alert(
        'บันทึกข้อมูลไม่สำเร็จ'
      )

    }

  } finally {

    isSaving.value = false

  }

}


// ==============================
// Cancel Edit
// ==============================

const cancelEdit = () => {

  isEditing.value = false

  editName.value = ''
  editPhone.value = ''

}


// ==============================
// Change Password
// ==============================

const changePassword = () => {

  isEditing.value = false

  isChangingPassword.value = true

  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''

  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false

}


// ==============================
// Save Password
// ==============================

const savePassword = async () => {

  if (!currentPassword.value) {

    alert(
      'กรุณากรอกรหัสผ่านเดิม'
    )

    return
  }


  if (!newPassword.value) {

    alert(
      'กรุณากรอกรหัสผ่านใหม่'
    )

    return
  }


  if (!confirmPassword.value) {

    alert(
      'กรุณายืนยันรหัสผ่านใหม่'
    )

    return
  }


  if (newPassword.value.length < 8) {

    alert(
      'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'
    )

    return
  }


  if (
    newPassword.value !==
    confirmPassword.value
  ) {

    alert(
      'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
    )

    return
  }


  try {

    isChangingPasswordSaving.value = true

    await updateCustomerPassword(
      currentPassword.value,
      newPassword.value
    )

    alert(
      'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'
    )

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false

    isChangingPassword.value = false

  } catch (error) {

    console.error(
      'Change Password Error:',
      error
    )

    if (error instanceof Error) {

      alert(
        error.message
      )

    } else {

      alert(
        'เปลี่ยนรหัสผ่านไม่สำเร็จ'
      )

    }

  } finally {

    isChangingPasswordSaving.value = false

  }

}


// ==============================
// Cancel Password Change
// ==============================

const cancelPasswordChange = () => {

  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''

  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false

  isChangingPassword.value = false

}


// ==============================
// Logout
// ==============================

const handleLogout = async () => {

  try {

    await logoutCustomer()

    await router.push('/signin')

  } catch (error) {

    console.error(
      'Logout Error:',
      error
    )

    alert(
      'ออกจากระบบไม่สำเร็จ'
    )

  }

}


// ==============================
// Navigation
// ==============================

const goBack = () => {

  router.back()

}


const goSignin = () => {

  router.push('/signin')

}





// ==============================
// Mounted
// ==============================

onMounted(() => {

  loadCustomer()

})

</script>


<style>

@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}

</style>