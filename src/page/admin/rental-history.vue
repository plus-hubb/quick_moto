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
          <p class="text-sm font-medium text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-slate-400"></i>
            ประวัติการเช่า
          </p>
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
            <span class="text-slate-600 font-medium">ประวัติการเช่า</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายการเช่าที่เสร็จสิ้น</h1>
            <span v-if="filteredBookings.length > 0" class="text-xs text-slate-400">{{ filteredBookings.length }} รายการ</span>
          </div>

          <!-- Search -->
          <div class="relative mb-5">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="ค้นหาด้วยรหัสจอง ชื่อลูกค้า เบอร์โทร ทะเบียนรถ หรือรุ่นรถ..."
              class="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
            />
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center text-slate-400 text-sm py-16">
            กำลังโหลดข้อมูล...
          </div>

          <!-- Empty -->
          <div v-else-if="filteredBookings.length === 0" class="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            {{ searchKeyword ? 'ไม่พบรายการที่ค้นหา' : 'ไม่มีรายการเช่าที่เสร็จสิ้น' }}
          </div>

          <!-- Desktop Table -->
          <div v-if="filteredBookings.length > 0" class="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-xs">
                  <th class="text-left font-medium px-5 py-3">รหัสจอง</th>
                  <th class="text-left font-medium px-5 py-3">ลูกค้า</th>
                  <th class="text-left font-medium px-5 py-3">รถ</th>
                  <th class="text-left font-medium px-5 py-3">วันรับ-คืน</th>
                  <th class="text-left font-medium px-5 py-3">ค่าเช่า</th>
                  <th class="text-left font-medium px-5 py-3">ค่าปรับ</th>
                  <th class="text-right font-medium px-5 py-3">ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="b in filteredBookings"
                  :key="b.booking_id"
                  class="border-t border-slate-100 hover:bg-slate-50/60"
                >
                  <td class="px-5 py-3 font-medium text-slate-900">{{ b.booking_code }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.customer_name }}</td>
                  <td class="px-5 py-3 text-slate-600">{{ b.vehicle_brand }} {{ b.vehicle_model }}</td>
                  <td class="px-5 py-3 text-slate-600 text-xs">{{ b.pickup_date }} - {{ b.return_date }}</td>
                  <td class="px-5 py-3 text-slate-900 font-medium">฿{{ formatPrice(b.rental_price) }}</td>
                  <td class="px-5 py-3">
                    <span v-if="b.penalty && b.penalty.total_penalty > 0" class="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                      ฿{{ formatPrice(b.penalty.total_penalty) }}
                    </span>
                    <span v-else class="text-xs text-slate-400">-</span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <button
                      type="button"
                      @click="selectBooking(b)"
                      class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div v-if="!isLoading && filteredBookings.length > 0" class="md:hidden space-y-3">
            <div
              v-for="b in filteredBookings"
              :key="b.booking_id"
              class="bg-white rounded-2xl border border-slate-100 p-4"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="font-bold text-slate-900">{{ b.booking_code }}</p>
                  <p class="text-xs text-slate-400">{{ b.customer_name }}</p>
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  เสร็จสิ้น
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ b.vehicle_brand }} {{ b.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-1">{{ b.pickup_date }} - {{ b.return_date }}</p>
              <div class="flex items-center gap-3 mb-3">
                <p class="text-sm font-bold text-slate-900">฿{{ formatPrice(b.rental_price) }}</p>
                <span v-if="b.penalty && b.penalty.total_penalty > 0" class="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  ค่าปรับ ฿{{ formatPrice(b.penalty.total_penalty) }}
                </span>
              </div>
              <button
                type="button"
                @click="selectBooking(b)"
                class="w-full bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium py-2.5 rounded-xl transition-all"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>

        </template>

        <!-- ====== _DETAIL VIEW ====== -->
        <template v-else>

          <!-- Breadcrumb -->
          <p class="text-xs text-slate-400 mb-1">
            ประวัติการเช่า
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
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายละเอียดการเช่า</h1>
          </div>

          <!-- ข้อมูลการจอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-slate-900">ข้อมูลการจอง</h2>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                เสร็จสิ้น
              </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">รหัสจอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.booking_code }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.booking_date }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">รถที่จอง</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.vehicle_brand }} {{ selectedBooking.vehicle_model }}</p>
              </div>
              <div v-if="selectedBooking.license_plate">
                <p class="text-xs text-slate-400 mb-0.5">เลขทะเบียน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.license_plate }}</p>
              </div>
              <div v-if="selectedBooking.accommodation">
                <p class="text-xs text-slate-400 mb-0.5">ที่พัก</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.accommodation }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันรับรถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.pickup_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันคืนรถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.return_date }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ค่าเช่า</p>
                <p class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.rental_price) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">มัดจำ</p>
                <p class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.deposit_price) }}</p>
              </div>
            </div>
          </div>

          <!-- ข้อมูลผู้จอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลผู้จอง</h2>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ชื่อ-นามสกุล</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เบอร์โทรศัพท์</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.customer_phone }}</p>
              </div>
            </div>
          </div>

          <!-- สลิปการชำระเงิน -->
          <div v-if="selectedBooking.payment_slip" class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">สลิปการชำระเงิน</h2>
            <div class="rounded-xl overflow-hidden border border-slate-200">
              <img
                :src="selectedBooking.payment_slip"
                alt="สลิปการชำระเงิน"
                class="w-full object-contain max-h-96"
                @error="slipImageError = true"
              />
            </div>
            <p v-if="slipImageError" class="text-xs text-red-500 mt-2">ไม่สามารถโหลดรูปสลิปได้</p>
          </div>

          <!-- รายละเอียดการส่งมอบ -->
          <div v-if="selectedBooking.delivery_return" class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">รายละเอียดการส่งมอบ</h2>

            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่ส่งมอบ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.delivery_date ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เวลาที่ส่งมอบ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.delivery_time ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เลขไมล์ (km)</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.mileage_delivery ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">หมวกกันน็อค</p>
                <p class="font-medium text-slate-900">{{ (selectedBooking.delivery_return.helmet_delivery ?? 0) > 0 ? selectedBooking.delivery_return.helmet_delivery + ' ใบ' : 'ไม่ได้ให้หมวก' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">ส่งมอบโดย</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.delivery_by ?? '-' }}</p>
              </div>
              <div v-if="selectedBooking.delivery_return.receiver_name" class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">ผู้รับรถ</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.receiver_name }}</p>
                <p v-if="selectedBooking.delivery_return.receiver_phone" class="text-xs text-slate-400">{{ selectedBooking.delivery_return.receiver_phone }}</p>
              </div>
            </div>

            <p class="text-xs text-slate-400 mb-2">รูปถ่ายตอนส่งมอบ</p>
            <div class="grid grid-cols-5 gap-2">
              <div v-for="(img, idx) in deliveryImages" :key="idx" class="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img v-if="img" :src="img" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <i class="fa-solid fa-image text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- รายละเอียดการรับคืน -->
          <div v-if="selectedBooking.delivery_return" class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">รายละเอียดการรับคืน</h2>

            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p class="text-xs text-slate-400 mb-0.5">วันที่รับคืน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.return_date ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เวลาที่รับคืน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.return_time ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">เลขไมล์ (km)</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.mileage_return ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">หมวกกันน็อค</p>
                <p class="font-medium text-slate-900">{{ !(selectedBooking.delivery_return.helmet_delivery ?? 0) ? 'ไม่ได้ให้หมวก' : (selectedBooking.delivery_return.helmet_return ?? 0) + ' / ' + selectedBooking.delivery_return.helmet_delivery + ' ใบ' }}</p>
              </div>
              <div class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">รับคืนโดย</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.delivery_return.return_by ?? '-' }}</p>
              </div>
            </div>

            <p class="text-xs text-slate-400 mb-2">รูปถ่ายตอนรับคืน</p>
            <div class="grid grid-cols-5 gap-2">
              <div v-for="(img, idx) in returnImages" :key="idx" class="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img v-if="img" :src="img" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  <i class="fa-solid fa-image text-xl"></i>
                </div>
              </div>
            </div>

            <!-- ระยะทางที่ใช้ -->
            <div v-if="selectedBooking.delivery_return.mileage_delivery != null && selectedBooking.delivery_return.mileage_return != null" class="mt-4 bg-slate-50 rounded-xl p-3 flex items-center justify-between">
              <span class="text-sm text-slate-600">ระยะทางที่ใช้</span>
              <span class="text-sm font-bold text-slate-900">{{ selectedBooking.delivery_return.mileage_return - selectedBooking.delivery_return.mileage_delivery }} km</span>
            </div>
          </div>

          <!-- ค่าปรับ -->
          <div v-if="selectedBooking.penalty" class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ค่าปรับ</h2>

            <div class="space-y-3">
              <div v-if="selectedBooking.penalty.damage" class="text-sm">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    <span class="text-slate-700">มีความเสียหาย</span>
                  </div>
                  <span class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.penalty.damage_fee) }}</span>
                </div>
                <p v-if="selectedBooking.penalty.damage_note" class="text-xs text-slate-400 ml-4 mt-1">{{ selectedBooking.penalty.damage_note }}</p>
              </div>

              <div v-if="selectedBooking.penalty.late_return" class="text-sm">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span class="text-slate-700">คืนรถล่าช้า</span>
                  </div>
                  <span class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.penalty.late_fee) }}</span>
                </div>
                <p v-if="selectedBooking.penalty.late_note" class="text-xs text-slate-400 ml-4 mt-1">{{ selectedBooking.penalty.late_note }}</p>
              </div>

              <div v-if="selectedBooking.penalty.missing_item" class="text-sm">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-500 shrink-0"></span>
                    <span class="text-slate-700">อุปกรณ์หาย / ไม่ครบ</span>
                  </div>
                  <span class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.penalty.missing_item_fee) }}</span>
                </div>
                <p v-if="selectedBooking.penalty.missing_item_note" class="text-xs text-slate-400 ml-4 mt-1">{{ selectedBooking.penalty.missing_item_note }}</p>
              </div>

              <div class="bg-red-50 rounded-xl p-3 flex items-center justify-between">
                <span class="text-sm font-medium text-red-700">ยอดค่าปรับรวม</span>
                <span class="text-lg font-bold text-red-700">฿{{ formatPrice(selectedBooking.penalty.total_penalty) }}</span>
              </div>
            </div>
          </div>

          <!-- สรุปยอดเงิน -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 class="text-sm font-bold text-slate-900 mb-3">สรุปยอดเงิน</h2>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-600">ค่าเช่า</span>
                <span class="font-medium text-slate-900">฿{{ formatPrice(selectedBooking.rental_price) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600">มัดจำ (ได้คืน)</span>
                <span class="font-medium text-green-600">฿{{ formatPrice(selectedBooking.deposit_price) }}</span>
              </div>
              <div v-if="selectedBooking.penalty && selectedBooking.penalty.total_penalty > 0" class="flex items-center justify-between">
                <span class="text-slate-600">ค่าปรับ</span>
                <span class="font-medium text-red-600">฿{{ formatPrice(selectedBooking.penalty.total_penalty) }}</span>
              </div>
              <div class="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span class="text-sm font-bold text-slate-900">ลูกค้าจ่ายจริง</span>
                <span class="text-lg font-bold text-slate-900">฿{{ formatPrice(totalCharge) }}</span>
              </div>
            </div>
          </div>

        </template>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
import { getCompletedBookings } from '../../services/deliveryReturnService'
import type { CompletedBooking } from '../../services/deliveryReturnService'

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)

const bookings = ref<CompletedBooking[]>([])
const selectedBooking = ref<CompletedBooking | null>(null)
const slipImageError = ref(false)
const searchKeyword = ref('')

const filteredBookings = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return bookings.value
  return bookings.value.filter((b) => {
    const haystack = `${b.booking_code} ${b.customer_name} ${b.customer_phone} ${b.vehicle_brand} ${b.vehicle_model} ${b.license_plate ?? ''}`.toLowerCase()
    return haystack.includes(keyword)
  })
})

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const formatPrice = (price: number) => Number(price).toLocaleString('en-US')

const deliveryImages = computed(() => {
  if (!selectedBooking.value?.delivery_return) return []
  const dr = selectedBooking.value.delivery_return
  return [dr.image_delivery_1, dr.image_delivery_2, dr.image_delivery_3, dr.image_delivery_4, dr.image_delivery_5]
})

const returnImages = computed(() => {
  if (!selectedBooking.value?.delivery_return) return []
  const dr = selectedBooking.value.delivery_return
  return [dr.image_return_1, dr.image_return_2, dr.image_return_3, dr.image_return_4, dr.image_return_5]
})

const totalCharge = computed(() => {
  if (!selectedBooking.value) return 0
  const rental = selectedBooking.value.rental_price
  const penalty = selectedBooking.value.penalty?.total_penalty ?? 0
  return rental + penalty
})

const loadData = async () => {
  isLoading.value = true
  try {
    bookings.value = await getCompletedBookings()
  } catch (err) {
    console.error('Load completed bookings error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectBooking = (b: CompletedBooking) => {
  selectedBooking.value = b
  slipImageError.value = false
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
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
