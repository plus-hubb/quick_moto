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
            <i class="fa-regular fa-calendar-xmark text-slate-400"></i>
            คำขอยกเลิก
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
            <span class="text-slate-600 font-medium">คำขอยกเลิก</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายการที่ยกเลิก</h1>
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
            {{ searchKeyword ? 'ไม่พบรายการที่ค้นหา' : 'ไม่มีรายการที่ยกเลิก' }}
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
                  <th class="text-left font-medium px-5 py-3">สลิป</th>
                  <th class="text-right font-medium px-5 py-3">คืนเงิน</th>
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
                  <td class="px-5 py-3">
                    <span v-if="b.payment_slip" class="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      มีสลิป
                    </span>
                    <span v-else class="text-xs text-slate-400">-</span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span
                      v-if="b.refunded"
                      class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700"
                    >
                      <i class="fa-solid fa-check"></i> คืนเงินแล้ว
                    </span>
                    <button
                      v-else-if="canRefund(b)"
                      type="button"
                      @click="openRefundModal(b)"
                      class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                    >
                      คืนเงิน
                    </button>
                    <span v-else class="text-xs text-slate-300">-</span>
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
                <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                  {{ getCancelLabel(b.cancel_reason) }}
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ b.vehicle_brand }} {{ b.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-1">{{ b.pickup_date }} - {{ b.return_date }}</p>
              <p v-if="b.payment_slip" class="text-xs text-blue-600 mb-2">
                <i class="fa-solid fa-image mr-1"></i>มีสลิปการชำระเงิน
              </p>

              <div v-if="canRefund(b) || b.refunded" class="mb-2">
                <button
                  v-if="canRefund(b)"
                  type="button"
                  @click="openRefundModal(b)"
                  class="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium py-2.5 rounded-xl transition-all"
                >
                  <i class="fa-solid fa-money-bill-transfer mr-1"></i> คืนเงิน
                </button>
                <div
                  v-else-if="b.refunded"
                  class="w-full text-center text-xs font-medium px-2.5 py-2 rounded-xl bg-emerald-100 text-emerald-700"
                >
                  <i class="fa-solid fa-check mr-1"></i>คืนเงินแล้ว
                </div>
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
            คำขอยกเลิก
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
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">รายละเอียดการจอง</h1>
          </div>

          <!-- รายละเอียดการจอง -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-slate-900">ข้อมูลการจอง</h2>
              <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                {{ cancelReasonLabel }}
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
              <div>
                <p class="text-xs text-slate-400 mb-0.5">สถานะ</p>
                <p class="font-medium text-red-600">{{ cancelReasonLabel }}</p>
              </div>
              <div v-if="selectedBooking.cancel_note" class="col-span-2">
                <p class="text-xs text-slate-400 mb-0.5">หมายเหตุ</p>
                <p class="font-medium text-slate-900 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">{{ selectedBooking.cancel_note }}</p>
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
          <div v-if="selectedBooking.payment_slip" class="bg-white rounded-2xl border border-slate-100 p-5">
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
            <div
              v-if="selectedBooking.transfer_name || selectedBooking.bank_name"
              class="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-100"
            >
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ชื่อบัญชีผู้โอน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.transfer_name ?? '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 mb-0.5">ธนาคาร</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.bank_name ?? '-' }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedBooking && !selectedBooking.payment_slip" class="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 class="text-sm font-bold text-slate-900 mb-3">สลิปการชำระเงิน</h2>
            <p class="text-sm text-slate-400">ไม่มีสลิปการชำระเงิน</p>
          </div>

        </template>

        <!-- ====== _REFUND MODAL ====== -->
        <div v-if="refundBooking" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 my-auto">
            <h3 class="text-lg font-bold text-slate-900 mb-1">คืนเงิน</h3>
            <p class="text-xs text-slate-400 mb-4">
              รหัสจอง: {{ refundBooking.booking_code }} — {{ refundBooking.customer_name }} ({{ refundBooking.vehicle_brand }} {{ refundBooking.vehicle_model }})
            </p>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">จำนวนเงิน (บาท)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
                <input
                  v-model.number="refundAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  class="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <p v-if="refundBooking" class="text-xs text-slate-400 mt-1">เงินมัดจำ: ฿{{ formatPrice(refundBooking.deposit_price) }}</p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">สลิปการคืนเงิน <span class="text-xs text-slate-400">(แนบรูป)</span></label>
              <label
                class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all"
                :class="{ '!border-emerald-400 !bg-emerald-50/40': refundSlipPreview }"
              >
                <i class="fa-solid fa-cloud-arrow-up text-xl text-slate-300 mb-2" :class="{ '!text-emerald-500': refundSlipPreview }"></i>
                <span v-if="!refundSlipPreview" class="text-xs text-slate-400">แตะเพื่อเลือกไฟล์สลิป</span>
                <span v-else class="text-xs text-emerald-600 font-medium">มีรูปสลิปแล้ว</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onRefundSlipFileChange"
                />
              </label>
              <img
                v-if="refundSlipPreview"
                :src="refundSlipPreview"
                alt="สลิปการคืนเงิน"
                class="mt-2 w-full object-contain max-h-44 rounded-xl border border-slate-200"
              />
            </div>

            <p v-if="refundError" class="text-xs text-red-500 mb-3">{{ refundError }}</p>

            <div class="flex gap-3">
              <button
                type="button"
                @click="closeRefundModal"
                class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all active:scale-[0.98]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                @click="submitRefund"
                :disabled="isSubmittingRefund"
                class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-medium transition-all active:scale-[0.98]"
              >
                {{ isSubmittingRefund ? 'กำลังบันทึก...' : 'ยืนยันคืนเงิน' }}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/adminsidebar.vue'
import { getCurrentAdmin, logoutAdmin } from '../../services/customerService'
import { getCancelledBookings, uploadImage } from '../../services/deliveryReturnService'
import { recordRefund, type Refund } from '../../services/refundService'
import type { BookingWithDetails } from '../../services/deliveryReturnService'

type CancelledBooking = BookingWithDetails & {
  payment_slip: string | null
  transfer_name: string | null
  bank_name: string | null
  refunded: boolean
  refund: Refund | null
}

const router = useRouter()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)

const bookings = ref<CancelledBooking[]>([])
const selectedBooking = ref<CancelledBooking | null>(null)
const slipImageError = ref(false)
const searchKeyword = ref('')

const refundBooking = ref<CancelledBooking | null>(null)
const refundAmount = ref<number | null>(null)
const refundSlipFile = ref<File | null>(null)
const refundSlipPreview = ref('')
const isSubmittingRefund = ref(false)
const refundError = ref('')

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

const cancelReasonLabel = computed(() => {
  switch (selectedBooking.value?.cancel_reason) {
    case 'customer_cancel': return 'ยกเลิกโดยลูกค้า'
    case 'admin_reject': return 'ยกเลิกโดย Admin'
    case 'no_show': return 'ไม่มารับรถ (Admin ยกเลิก)'
    case 'auto_expire': return 'หมดอายุอัตโนมัติ'
    default: return 'ไม่ทราบสาเหตุ'
  }
})

const getCancelLabel = (reason: string | null) => {
  switch (reason) {
    case 'customer_cancel': return 'ลูกค้ายกเลิก'
    case 'admin_reject': return 'Admin ยกเลิก'
    case 'no_show': return 'ไม่มารับรถ'
    case 'auto_expire': return 'หมดอายุ'
    default: return 'ยกเลิก'
  }
}

// ==============================
// คืนเงิน
// ==============================

const canRefund = (b: CancelledBooking) =>
  (b.cancel_reason === 'admin_reject' || b.cancel_reason === 'auto_expire') && !b.refunded

const openRefundModal = (b: CancelledBooking) => {
  refundBooking.value = b
  refundAmount.value = b.deposit_price ?? 0
  refundSlipFile.value = null
  refundSlipPreview.value = ''
  refundError.value = ''
}

const closeRefundModal = () => {
  if (isSubmittingRefund.value) return
  refundBooking.value = null
  refundAmount.value = null
  refundSlipFile.value = null
  refundSlipPreview.value = ''
  refundError.value = ''
}

const onRefundSlipFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  refundSlipFile.value = file
  refundSlipPreview.value = URL.createObjectURL(file)
  refundError.value = ''
}

const submitRefund = async () => {
  if (!refundBooking.value) return

  if (refundAmount.value === null || refundAmount.value === undefined || Number(refundAmount.value) <= 0) {
    refundError.value = 'กรุณากรอกจำนวนเงินที่จะคืน'
    return
  }

  if (!refundSlipFile.value) {
    refundError.value = 'กรุณาแนบสลิปการคืนเงิน'
    return
  }

  isSubmittingRefund.value = true
  refundError.value = ''

  try {
    let slipUrl: string | null = null
    if (refundSlipFile.value) {
      slipUrl = await uploadImage(refundSlipFile.value)
    }

    await recordRefund({
      bookingId: refundBooking.value.booking_id,
      amount: Number(refundAmount.value),
      refundSlip: slipUrl
    })

    refundBooking.value = null
    refundAmount.value = null
    refundSlipFile.value = null
    refundSlipPreview.value = ''
    refundError.value = ''
    loadData()
  } catch (err) {
    console.error('Submit refund error:', err)
    refundError.value = err instanceof Error ? `คืนเงินไม่สำเร็จ: ${err.message}` : 'คืนเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmittingRefund.value = false
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    bookings.value = await getCancelledBookings()
  } catch (err) {
    console.error('Load cancellations error:', err)
  } finally {
    isLoading.value = false
  }
}

const selectBooking = (b: CancelledBooking) => {
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
