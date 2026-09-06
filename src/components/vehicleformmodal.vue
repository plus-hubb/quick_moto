<template>
  <div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
        <h2 class="text-lg font-bold text-slate-900">
          {{ mode === 'create' ? 'เพิ่มรถใหม่' : 'แก้ไขข้อมูลรถ' }}
        </h2>
        <button type="button" @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">ยี่ห้อ</label>
            <input
              v-model="form.brand"
              type="text"
              required
              placeholder="Honda"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">รุ่น</label>
            <input
              v-model="form.model"
              type="text"
              required
              placeholder="Wave 110 i"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">ราคา/วัน (บาท)</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">จำนวนคันในคลัง</label>
            <input
              v-model.number="form.quantity"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">ขนาดเครื่องยนต์ (cc)</label>
            <input
              v-model.number="form.engine_size"
              type="number"
              min="0"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">ระบบเกียร์</label>
            <select
              v-model="form.vehicle_type"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">ลิงก์รูปภาพ</label>
          <input
            v-model="form.image"
            type="text"
            placeholder="https://..."
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all"
          >
          <div v-if="form.image" class="w-full h-32 mt-2 rounded-xl overflow-hidden bg-slate-100">
            <img :src="form.image" class="w-full h-full object-cover" @error="imageError = true">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">คำอธิบาย / สเปครถ</label>
          <textarea
            v-model="form.explanation"
            rows="4"
            placeholder="รายละเอียดเครื่องยนต์ ระบบเกียร์ ถังน้ำมัน ฯลฯ"
            class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white transition-all resize-none"
          ></textarea>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium transition-all active:scale-[0.98]"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 py-2.5 rounded-xl bg-[#051329] hover:bg-[#0a1f3d] disabled:opacity-50 text-white text-sm font-medium transition-all active:scale-[0.98]"
          >
            {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createVehicle, updateVehicle, type VehicleFormData } from '../services/adminvehicleservice'
import type { Vehicle } from '../services/customerService'

const props = defineProps<{
  mode: 'create' | 'edit'
  vehicle?: Vehicle | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const isSubmitting = ref(false)
const errorMessage = ref('')
const imageError = ref(false)

const form = reactive<VehicleFormData>({
  brand: props.vehicle?.brand ?? '',
  model: props.vehicle?.model ?? '',
  price: props.vehicle?.price ?? 0,
  engine_size: props.vehicle?.engine_size ?? null,
  vehicle_type: props.vehicle?.vehicle_type ?? 'Automatic',
  image: props.vehicle?.image ?? '',
  explanation: props.vehicle?.explanation ?? '',
  quantity: props.vehicle?.quantity ?? 1
})

const handleSubmit = async () => {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    if (props.mode === 'create') {
      await createVehicle(form)
    } else if (props.vehicle) {
      await updateVehicle(props.vehicle.vehicle_id, form)
    }
    emit('saved')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}
</script>