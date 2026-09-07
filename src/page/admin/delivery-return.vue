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

        <div class="flex-1">
          <p class="text-sm font-medium text-slate-900">{{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}</p>
        </div>

        <div class="flex items-center gap-3 ml-auto shrink-0">
          <div class="flex items-center gap-2">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-medium text-slate-900 leading-tight">{{ admin?.name }}</p>
              <p class="text-[10px] text-slate-400 leading-tight">ผู้ดูแลระบบ</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-[#051329] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {{ adminInitial }}
            </div>
          </div>
        </div>
      </header>

      <main class="p-4 sm:p-6">

        <!-- ====== _LIST VIEW ====== -->
        <template v-if="!selectedBooking">

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            {{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}
            <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
            <span class="text-slate-600 font-medium">รายการ</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              {{ isDeliveryMode ? 'รอส่งมอบ' : 'รอรับคืน' }}
            </h1>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
            กำลังโหลดข้อมูล...
          </div>

          <!-- Empty -->
          <div v-else-if="bookings.length === 0" class="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            {{ isDeliveryMode ? 'ไม่มีรายการรอส่งมอบ' : 'ไม่มีรายการรอรับคืน' }}
          </div>

          <!-- Desktop Table -->
          <div v-else class="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs">
                  <th class="text-left font-medium px-5 py-3">รหัสจอง</th>
                  <th class="text-left font-medium px-5 py-3">ลูกค้า</th>
                  <th class="text-left font-medium px-5 py-3">รถ</th>
                  <th class="text-left font-medium px-5 py-3">วันรับ-คืน</th>
                  <th class="text-right font-medium px-5 py-3">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="b in bookings"
                  :key="b.booking_id"
                  class="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td class="px-5 py-3 font-medium text-slate-900">{{ b.booking_code }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.customer_name }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.vehicle_brand }} {{ b.vehicle_model }}</td>
                  <td class="px-5 py-3 text-slate-600 text-xs">{{ b.pickup_date }} - {{ b.return_date }}</td>
                  <td class="px-5 py-3 text-right">
                    <button
                      type="button"
                      @click="selectBooking(b)"
                      class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      {{ isDeliveryMode ? 'ส่งมอบ' : 'รับคืน' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="!isLoading && bookings.length > 0" class="md:hidden space-y-3">
            <div
              v-for="b in bookings"
              :key="b.booking_id"
              class="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-bold text-slate-900">{{ b.booking_code }}</p>
                  <p class="text-xs text-slate-400">{{ b.customer_name }}</p>
                </div>
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ b.vehicle_brand }} {{ b.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-3">{{ b.pickup_date }} - {{ b.return_date }}</p>
              <button
                type="button"
                @click="selectBooking(b)"
                class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium py-2.5 rounded-xl transition-all"
              >
                {{ isDeliveryMode ? 'ส่งมอบ' : 'รับคืน' }}
              </button>
            </div>
          </div>

        </template>

        <!-- ====== _FORM VIEW ====== -->
        <template v-else>

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            {{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}
            <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
            <span class="text-slate-600 font-medium">{{ selectedBooking.booking_code }}</span>
          </p>

          <!-- Back + Header -->
          <div class="flex items-center gap-3 mb-6">
            <button
              type="button"
              @click="selectedBooking = null"
              class="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors shrink-0"
            >
              <i class="fa-solid fa-arrow-left text-sm"></i>
            </button>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              {{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}
            </h1>
          </div>

          <!-- รายละเอียดการจอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">รายละเอียดการจอง</h2>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs text-slate-400">รหัสจอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.booking_code }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">สถานะ</p>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {{ selectedBooking.status }}
                </span>
              </div>
              <div>
                <p class="text-xs text-slate-400">ชื่อผู้จอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">เบอร์โทร</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_phone }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400">รถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.vehicle_brand }} {{ selectedBooking.vehicle_model }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">วันรับ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.pickup_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">วันคืน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.return_date }}</p>
              </div>
            </div>
          </div>

          <!-- ฟอร์มถ่ายรูป -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">
              {{ isDeliveryMode ? 'รูปถ่ายตอนส่งมอบ' : 'รูปถ่ายตอนรับคืน' }}
            </h2>
            <div class="grid grid-cols-3 gap-3">
              <div v-for="(img, idx) in photos" :key="idx">
                <label
                  class="block aspect-square rounded-xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-colors relative"
                >
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="hidden"
                    @change="(e) => onPhotoCapture(e, idx)"
                  />
                  <img v-if="img" :src="img" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <i class="fa-solid fa-camera text-2xl mb-1"></i>
                    <span class="text-[10px]">ถ่ายรูปที่ {{ idx + 1 }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- ฟอร์มกรอกข้อมูล -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลเพิ่มเติม</h2>

            <div class="space-y-4">
              <!-- เลขไมล์ -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  เลขไมล์ (km)
                </label>
                <input
                  v-model.number="mileage"
                  type="number"
                  min="0"
                  placeholder="กรอกเลขไมล์ปัจจุบัน"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                />
              </div>

              <!-- หมวกกันน็อค -->
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="helmet = !helmet"
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0"
                  :class="helmet ? 'bg-[#051329] border-[#051329]' : 'border-slate-300 bg-white'"
                >
                  <i v-if="helmet" class="fa-solid fa-check text-white text-[10px]"></i>
                </button>
                <span class="text-sm text-slate-700">
                  {{ isDeliveryMode ? 'ลูกค้ารับหมวกกันน็อค' : 'ได้หมวกกันน็อคคืน' }}
                </span>
              </div>
            </div>
          </div>

          <!-- ปุ่มส่ง -->
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || !mileage"
            class="w-full bg-[#051329] hover:bg-[#0a1f3d] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <template v-if="isSubmitting">
              <i class="fa-solid fa-spinner fa-spin text-sm"></i>
              <span>กำลังบันทึก...</span>
            </template>
            <template v-else>
              <i class="fa-solid fa-check text-sm"></i>
              <span>{{ isDeliveryMode ? 'ยืนยันส่งมอบ' : 'ยืนยันรับคืน' }}</span>
            </template>
          </button>

        </template>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
import {
  getPendingDeliveries,
  getPendingReturns,
  saveDelivery,
  saveReturn,
  uploadImage
} from '../../services/deliveryReturnService'
import type { BookingWithDetails } from '../../services/deliveryReturnService'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)

const bookings = ref<BookingWithDetails[]>([])
const selectedBooking = ref<BookingWithDetails & { delivery_return_id?: number } | null>(null)

const photos = ref<(string | null)[]>([null, null, null])
const photoFiles = ref<(File | null)>(null)
const mileage = ref<number | null>(null)
const helmet = ref(false)

const isDeliveryMode = computed(() => route.path === '/admin/delivery')

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const loadData = async () => {
  isLoading.value = true
  try {
    if (isDeliveryMode.value) {
      bookings.value = await getPendingDeliveries()
    } else {
      const returns = await getPendingReturns()
      bookings.value = returns
    }
  } catch (err) {
    console.error('Load data error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectBooking = (b: BookingWithDetails) => {
  selectedBooking.value = b
  photos.value = [null, null, null]
  mileage.value = null
  helmet.value = false
}

const onPhotoCapture = (event: Event, index: number) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    photos.value[index] = reader.result as string
  }
  reader.readAsDataURL(file)

  // เก็บ file ไว้อัปโหลด
  if (!photoFiles.value) {
    photoFiles.value = file
  }
}

const handleSubmit = async () => {
  if (!selectedBooking.value || !mileage.value || isSubmitting.value) return

  const confirmed = window.confirm(
    isDeliveryMode.value
      ? 'ยืนยันส่งมอบรถคันนี้?'
      : 'ยืนยันรับคืนรถคันนี้?'
  )
  if (!confirmed) return

  isSubmitting.value = true

  try {
    // อัปโหลดรูปทั้ง 3 รูป
    const imageUrls: (string | null)[] = [null, null, null]

    // ใช้ hidden input เพื่อเก็บ file references
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>

    for (let i = 0; i < 3; i++) {
      const file = fileInputs[i]?.files?.[0]
      if (file) {
        imageUrls[i] = await uploadImage(file)
      }
    }

    if (isDeliveryMode.value) {
      await saveDelivery({
        bookingId: selectedBooking.value.booking_id,
        adminId: admin.value!.admin_id,
        image1: imageUrls[0],
        image2: imageUrls[1],
        image3: imageUrls[2],
        mileage: mileage.value,
        helmet: helmet.value
      })
      alert('บันทึกการส่งมอบสำเร็จ!')
    } else {
      await saveReturn({
        deliveryReturnId: selectedBooking.value.delivery_return_id!,
        bookingId: selectedBooking.value.booking_id,
        image1: imageUrls[0],
        image2: imageUrls[1],
        image3: imageUrls[2],
        mileage: mileage.value,
        helmet: helmet.value
      })
      alert('บันทึกการรับคืนสำเร็จ!')
    }

    selectedBooking.value = null
    await loadData()

  } catch (err) {
    console.error('Submit error:', err)
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
    alert(`บันทึกไม่สำเร็จ: ${message}`)
  } finally {
    isSubmitting.value = false
  }
}

const handleLogout = async () => {
  await logoutAdmin()
  router.push('/signin')
}

onMounted(async () => {
  admin.value = await getCurrentAdmin()
  if (!admin.value) {
    router.push('/signin')
    return
  }
  loadData()
})

// โหลดข้อมูลใหม่เมื่อสลับหน้า รอส่งมอบ <-> รอรับคืน
watch(() => route.path, () => {
  selectedBooking.value = null
  loadData()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
