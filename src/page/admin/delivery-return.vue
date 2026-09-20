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
            <i :class="isDeliveryMode ? 'fa-solid fa-truck-ramp-box' : 'fa-solid fa-box-open'" class="text-slate-400"></i>
            {{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}
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
            {{ isDeliveryMode ? 'ส่งมอบรถ' : 'รับคืนรถ' }}
            <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i>
            <span class="text-slate-600 font-medium">รายการ</span>
          </p>

          <!-- Header -->
          <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">
              {{ isDeliveryMode ? 'รอส่งมอบ' : 'รอรับคืน' }}
            </h1>
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
            {{ searchKeyword ? 'ไม่พบรายการที่ค้นหา' : (isDeliveryMode ? 'ไม่มีรายการรอส่งมอบ' : 'ไม่มีรายการรอรับคืน') }}
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
                  <th class="text-right font-medium px-5 py-3">ดำเนินการ</th>
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
                  <td class="px-5 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        v-if="isDeliveryMode && isPastPickupDate(b.return_date)"
                        type="button"
                        @click="handleCancelNoShow(b)"
                        :disabled="isCancelling"
                        class="bg-white border border-red-300 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-red-50 disabled:opacity-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        @click="selectBooking(b)"
                        class="bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      >
                        {{ isDeliveryMode ? 'ส่งมอบ' : 'รับคืน' }}
                      </button>
                    </div>
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
              </div>
              <p class="text-sm text-slate-600 mb-1">{{ b.vehicle_brand }} {{ b.vehicle_model }}</p>
              <p class="text-xs text-slate-400 mb-3">{{ b.pickup_date }} - {{ b.return_date }}</p>
              <div class="flex gap-2">
                <button
                  v-if="isDeliveryMode && isPastPickupDate(b.return_date)"
                  type="button"
                  @click="handleCancelNoShow(b)"
                  :disabled="isCancelling"
                  class="flex-shrink-0 bg-white border border-red-300 text-red-600 text-xs font-medium px-3 py-2.5 rounded-xl transition-all hover:bg-red-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  @click="selectBooking(b)"
                  class="flex-1 bg-[#051329] hover:bg-[#0a1f3d] text-white text-xs font-medium py-2.5 rounded-xl transition-all"
                >
                  {{ isDeliveryMode ? 'ส่งมอบ' : 'รับคืน' }}
                </button>
              </div>
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
              <div v-if="selectedBooking.license_plate">
                <p class="text-xs text-slate-400">เลขทะเบียน</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.license_plate }}</p>
              </div>
              <div v-if="selectedBooking.accommodation">
                <p class="text-xs text-slate-400">ที่พัก</p>
                <p class="font-medium text-slate-900">{{ selectedBooking.accommodation }}</p>
              </div>
            </div>
          </div>

          <!-- รูปถ่ายตอนส่งมอบ (แสดงเฉพาะตอนรับคืน) -->
          <template v-if="!isDeliveryMode && deliveryImages.length > 0">
            <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
              <h2 class="text-sm font-bold text-slate-900 mb-3">
                <i class="fa-solid fa-image text-slate-400 mr-1"></i>
                รูปถ่ายตอนส่งมอบ
              </h2>
              <div class="grid grid-cols-3 gap-3">
                <div v-for="(img, idx) in deliveryImages" :key="'delivery-' + idx">
                  <div class="aspect-square rounded-xl border border-slate-200 overflow-hidden">
                    <img v-if="img" :src="img" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <i class="fa-solid fa-image-slash text-xl"></i>
                      <span class="text-[10px] mt-1">ไม่มีรูป</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ฟอร์มถ่ายรูป -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">
              {{ isDeliveryMode ? 'รูปถ่ายตอนส่งมอบ' : 'รูปถ่ายตอนรับคืน' }}
            </h2>
            <div class="grid grid-cols-3 gap-3">
              <div v-for="(img, idx) in photos" :key="idx" class="relative">
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
                <button
                  v-if="img"
                  type="button"
                  @click.prevent="removePhoto(idx)"
                  class="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                >
                  <i class="fa-solid fa-xmark text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- ฟอร์มกรอกข้อมูล -->
          <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <h2 class="text-sm font-bold text-slate-900 mb-3">ข้อมูลเพิ่มเติม</h2>

            <div class="space-y-4">
              <!-- เลขทะเบียน (เฉพาะตอนส่งมอบ) -->
              <div v-if="isDeliveryMode">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  เลขทะเบียนรถ
                </label>
                <input
                  v-model="licensePlate"
                  type="text"
                  placeholder="กรอกเลขทะเบียนรถ"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                />
              </div>

              <!-- ที่พัก (เฉพาะตอนส่งมอบ) -->
              <div v-if="isDeliveryMode">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  ที่พักของผู้เช่า
                </label>
                <input
                  v-model="accommodation"
                  type="text"
                  placeholder="กรอกที่พักของผู้เช่า"
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                />
              </div>

              <!-- เลขไมล์ -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  เลขไมล์ (km)
                </label>
                <p v-if="!isDeliveryMode && selectedBooking?.mileage_delivery != null" class="text-xs text-slate-400 mb-1">
                  เลขไมล์ตอนส่งมอบ: <span class="font-medium text-slate-600">{{ selectedBooking.mileage_delivery.toLocaleString() }} km</span>
                </p>
                <input
                  v-model.number="mileage"
                  type="number"
                  min="0"
                  placeholder="กรอกเลขไมล์ปัจจุบัน"
                  class="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                  :class="isMileageInvalid ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-800'"
                />
                <p v-if="isMileageInvalid" class="text-xs text-red-500 mt-1">
                  เลขไมล์ต้องไม่น้อยกว่าตอนส่งมอบ ({{ selectedBooking?.mileage_delivery?.toLocaleString() }} km)
                </p>
              </div>

              <!-- หมวกกันน็อค (เฉพาะตอนส่งมอบ หรือตอนรับคืนที่ตอนส่งให้หมวก) -->
              <template v-if="isDeliveryMode || selectedBooking?.helmet_delivery">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">
                    {{ isDeliveryMode ? 'จำนวนหมวกกันน็อคที่ให้ (ใบ)' : 'จำนวนหมวกกันน็อคที่ได้คืน (ใบ)' }}
                  </label>
                  <p v-if="!isDeliveryMode && selectedBooking?.helmet_delivery" class="text-xs text-slate-400 mb-1">
                    ส่งมอบให้: <span class="font-medium text-slate-600">{{ selectedBooking.helmet_delivery }} ใบ</span>
                  </p>
                  <input
                    v-model.number="helmet"
                    type="number"
                    min="0"
                    :placeholder="isDeliveryMode ? 'กรอกจำนวนหมวกที่ให้ลูกค้า' : 'กรอกจำนวนหมวกที่ได้คืน'"
                    class="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    :class="isHelmetInvalid ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-800'"
                  />
                  <p v-if="isHelmetInvalid" class="text-xs text-red-500 mt-1">
                    จำนวนหมวกรับคืนต้องไม่มากกว่าตอนส่งมอบ ({{ selectedBooking?.helmet_delivery }} ใบ)
                  </p>
                </div>
              </template>
              <template v-else-if="!isDeliveryMode">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-slate-400 italic">ไม่ได้ให้หมวกกันน็อคตอนส่งมอบ ไม่ต้องเช็ค</span>
                </div>
              </template>
            </div>
          </div>

          <!-- ค่าปรับ (เฉพาะหน้ารับคืน) -->
          <template v-if="!isDeliveryMode">
            <div class="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
              <h2 class="text-sm font-bold text-slate-900 mb-3">ค่าปรับ</h2>

              <div class="space-y-4">
                <!-- ความเสียหาย -->
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      @click="damage = !damage; if (!damage) damageFee = 0"
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0"
                      :class="damage ? 'bg-[#051329] border-[#051329]' : 'border-slate-300 bg-white'"
                    >
                      <i v-if="damage" class="fa-solid fa-check text-white text-[10px]"></i>
                    </button>
                    <span class="text-sm text-slate-700">มีความเสียหาย</span>
                  </div>
                  <div v-if="damage" class="ml-8">
                    <label class="block text-xs text-slate-400 mb-1">ค่าเสียหาย (บาท)</label>
                    <input
                      v-model.number="damageFee"
                      type="number"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                    <label class="block text-xs text-slate-400 mb-1 mt-2">หมายเหตุ <span class="text-slate-300">(ไม่บังคับ)</span></label>
                    <input
                      v-model="damageNote"
                      type="text"
                      placeholder="เช่น รอยขีดข่วนที่แฟริ่ง..."
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                  </div>
                </div>

                <!-- คืนรถlate -->
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      @click="lateReturn = !lateReturn; if (!lateReturn) lateFee = 0"
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0"
                      :class="lateReturn ? 'bg-[#051329] border-[#051329]' : 'border-slate-300 bg-white'"
                    >
                      <i v-if="lateReturn" class="fa-solid fa-check text-white text-[10px]"></i>
                    </button>
                    <span class="text-sm text-slate-700">คืนรถล่าช้า</span>
                  </div>
                  <div v-if="lateReturn" class="ml-8">
                    <label class="block text-xs text-slate-400 mb-1">ค่าปรับล่าช้า (บาท)</label>
                    <input
                      v-model.number="lateFee"
                      type="number"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                    <label class="block text-xs text-slate-400 mb-1 mt-2">หมายเหตุ <span class="text-slate-300">(ไม่บังคับ)</span></label>
                    <input
                      v-model="lateNote"
                      type="text"
                      placeholder="เช่น คืนช้า 2 วัน..."
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                  </div>
                </div>

                <!-- อุปกรณ์หาย -->
                <div>
                  <div class="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      @click="missingItem = !missingItem; if (!missingItem) missingItemFee = 0"
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0"
                      :class="missingItem ? 'bg-[#051329] border-[#051329]' : 'border-slate-300 bg-white'"
                    >
                      <i v-if="missingItem" class="fa-solid fa-check text-white text-[10px]"></i>
                    </button>
                    <span class="text-sm text-slate-700">อุปกรณ์หาย / ไม่ครบ</span>
                  </div>
                  <div v-if="missingItem" class="ml-8">
                    <label class="block text-xs text-slate-400 mb-1">ค่าอุปกรณ์ (บาท)</label>
                    <input
                      v-model.number="missingItemFee"
                      type="number"
                      min="0"
                      placeholder="0.00"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                    <label class="block text-xs text-slate-400 mb-1 mt-2">หมายเหตุ <span class="text-slate-300">(ไม่บังคับ)</span></label>
                    <input
                      v-model="missingItemNote"
                      type="text"
                      placeholder="เช่น หมวกหาย 1 ใบ..."
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
                    />
                  </div>
                </div>

                <!-- ยอดรวม -->
                <div v-if="totalPenalty > 0" class="bg-red-50 rounded-xl p-3 flex items-center justify-between">
                  <span class="text-sm font-medium text-red-700">ยอดค่าปรับรวม</span>
                  <span class="text-lg font-bold text-red-700">{{ totalPenalty.toLocaleString() }} บาท</span>
                </div>
              </div>
            </div>
          </template>

          <!-- ปุ่มส่ง -->
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSubmitting || !mileage || isMileageInvalid || isHelmetInvalid || (isDeliveryMode && !licensePlate.trim())"
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

    <!-- Cancel Note Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-1">ยืนยันยกเลิก (ไม่มารับรถ)</h3>
        <p class="text-sm text-slate-500 mb-1">รหัส: {{ cancelTarget?.booking_code }}</p>
        <p class="text-xs text-red-500 mb-4">ลูกค้าไม่มารับรถภายในวันที่เช่า — ไม่มีการคืนเงิน</p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">หมายเหตุ <span class="text-xs text-slate-400">(ไม่บังคับ)</span></label>
          <textarea
            v-model="cancelNote"
            rows="3"
            placeholder="เช่น ติดต่อลูกค้าไม่ได้, ลูกค้ายืนยันไม่มา..."
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all resize-none"
          ></textarea>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            @click="showCancelModal = false; cancelNote = ''"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all active:scale-[0.98]"
          >
            กลับ
          </button>
          <button
            type="button"
            @click="confirmCancelNoShow"
            :disabled="isCancelling"
            class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition-all active:scale-[0.98]"
          >
            {{ isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก' }}
          </button>
        </div>
      </div>
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
  savePenalty,
  uploadImage,
  cancelNoShowBooking
} from '../../services/deliveryReturnService'
import type { BookingWithDetails } from '../../services/deliveryReturnService'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)
const admin = ref<{ admin_id: number; name: string; email: string } | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)

const bookings = ref<BookingWithDetails[]>([])
const selectedBooking = ref<BookingWithDetails & { delivery_return_id?: number; helmet_delivery?: number; mileage_delivery?: number | null; image_delivery_1?: string | null; image_delivery_2?: string | null; image_delivery_3?: string | null } | null>(null)

const photos = ref<(string | null)[]>([null, null, null])
const photoFiles = ref<(File | null)>(null)
const mileage = ref<number | null>(null)
const helmet = ref(0)
const licensePlate = ref('')
const accommodation = ref('')

const damage = ref(false)
const damageFee = ref<number>(0)
const damageNote = ref('')
const lateReturn = ref(false)
const lateFee = ref<number>(0)
const lateNote = ref('')
const missingItem = ref(false)
const missingItemFee = ref<number>(0)
const missingItemNote = ref('')

const totalPenalty = computed(() => damageFee.value + lateFee.value + missingItemFee.value)

const isMileageInvalid = computed(() => {
  if (isDeliveryMode.value) return false
  if (!mileage.value || !selectedBooking.value?.mileage_delivery) return false
  return mileage.value < selectedBooking.value.mileage_delivery
})

const isDeliveryMode = computed(() => route.path === '/admin/delivery')

const isHelmetInvalid = computed(() => {
  if (isDeliveryMode.value) return false
  if (!selectedBooking.value?.helmet_delivery) return false
  return helmet.value > selectedBooking.value.helmet_delivery
})

const searchKeyword = ref('')

const filteredBookings = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return bookings.value
  return bookings.value.filter((b) => {
    const haystack = `${b.booking_code} ${b.customer_name} ${b.customer_phone} ${b.vehicle_brand} ${b.vehicle_model} ${b.license_plate ?? ''}`.toLowerCase()
    return haystack.includes(keyword)
  })
})

const isPastPickupDate = (pickupDate: string): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pickup = new Date(pickupDate)
  pickup.setHours(0, 0, 0, 0)
  return pickup < today
}

const isCancelling = ref(false)
const showCancelModal = ref(false)
const cancelTarget = ref<BookingWithDetails | null>(null)
const cancelNote = ref('')

const handleCancelNoShow = async (booking: BookingWithDetails) => {
  if (isCancelling.value) return
  cancelTarget.value = booking
  cancelNote.value = ''
  showCancelModal.value = true
}

const confirmCancelNoShow = async () => {
  if (!cancelTarget.value || isCancelling.value) return

  isCancelling.value = true
  try {
    await cancelNoShowBooking(cancelTarget.value.booking_id, cancelNote.value || undefined)
    alert('ยกเลิกการจองสำเร็จ')
    showCancelModal.value = false
    cancelNote.value = ''
    cancelTarget.value = null
    await loadData()
  } catch (err) {
    console.error('Cancel no-show error:', err)
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด'
    alert(`ยกเลิกไม่สำเร็จ: ${message}`)
  } finally {
    isCancelling.value = false
  }
}

const adminInitial = computed(() => {
  return admin.value?.name?.charAt(0)?.toUpperCase() ?? 'A'
})

const deliveryImages = computed(() => {
  if (!selectedBooking.value) return []
  return [
    selectedBooking.value.image_delivery_1,
    selectedBooking.value.image_delivery_2,
    selectedBooking.value.image_delivery_3
  ].filter((img): img is string => !!img)
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

const selectBooking = (b: BookingWithDetails & { delivery_return_id?: number; helmet_delivery?: number }) => {
  selectedBooking.value = b
  photos.value = [null, null, null]
  mileage.value = null
  helmet.value = 0
  licensePlate.value = ''
  accommodation.value = ''
  damage.value = false
  damageFee.value = 0
  damageNote.value = ''
  lateReturn.value = false
  lateFee.value = 0
  lateNote.value = ''
  missingItem.value = false
  missingItemFee.value = 0
  missingItemNote.value = ''
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

const removePhoto = (index: number) => {
  photos.value[index] = null
  
  // รีเซ็ต file input
  const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>
  if (fileInputs[index]) {
    fileInputs[index].value = ''
  }
}

const handleSubmit = async () => {
  if (!selectedBooking.value || !mileage.value || isSubmitting.value) return
  if (isMileageInvalid.value) return
  if (isHelmetInvalid.value) return

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
        helmet: helmet.value,
        licensePlate: licensePlate.value,
        accommodation: accommodation.value
      })
      alert('บันทึกการส่งมอบสำเร็จ!')
    } else {
      const helmetReturn = selectedBooking.value.helmet_delivery ? helmet.value : 0
      await saveReturn({
        deliveryReturnId: selectedBooking.value.delivery_return_id!,
        bookingId: selectedBooking.value.booking_id,
        image1: imageUrls[0],
        image2: imageUrls[1],
        image3: imageUrls[2],
        mileage: mileage.value,
        helmet: helmetReturn
      })

      if (damage.value || lateReturn.value || missingItem.value) {
        await savePenalty({
          bookingId: selectedBooking.value.booking_id,
          damage: damage.value,
          damageFee: damageFee.value,
          damageNote: damageNote.value,
          lateReturn: lateReturn.value,
          lateFee: lateFee.value,
          lateNote: lateNote.value,
          missingItem: missingItem.value,
          missingItemFee: missingItemFee.value,
          missingItemNote: missingItemNote.value
        })
      }

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
  searchKeyword.value = ''
  loadData()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>
