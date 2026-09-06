import { supabase } from '../lib/supabase'
import type { Vehicle } from './customerService'

export interface VehicleFormData {
  brand: string
  model: string
  price: number
  engine_size: number | null
  vehicle_type: string | null
  image: string | null
  explanation: string | null
  quantity: number
}

/**
 * ดึงรถทั้งหมด (รวมคันที่ quantity = 0 ด้วย เพราะแอดมินต้องเห็นทุกคัน)
 */
export async function getAllVehiclesAdmin(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicle')
    .select('*')
    .order('vehicle_id', { ascending: false })

  if (error) {
    console.error('getAllVehiclesAdmin error:', error.message)
    throw error
  }

  return data ?? []
}

/**
 * เพิ่มรถใหม่
 */
export async function createVehicle(form: VehicleFormData): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicle')
    .insert(form)
    .select('*')
    .single()

  if (error) {
    console.error('createVehicle error:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * แก้ไขข้อมูลรถ
 */
export async function updateVehicle(vehicleId: number, form: VehicleFormData): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicle')
    .update(form)
    .eq('vehicle_id', vehicleId)
    .select('*')
    .single()

  if (error) {
    console.error('updateVehicle error:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * ลบรถออกจากระบบ
 * หมายเหตุ: ถ้ารถคันนี้เคยมีประวัติการจองอยู่ในตาราง booking การลบจะ error
 * เพราะติด foreign key constraint (fk_booking_vehicle) — เป็นพฤติกรรมที่ถูกต้องแล้ว
 * เพื่อป้องกันประวัติการจองเสียหาย แนะนำให้ตั้ง quantity = 0 แทนการลบถ้ารถเคยถูกจอง
 */
export async function deleteVehicle(vehicleId: number): Promise<void> {
  const { error } = await supabase
    .from('vehicle')
    .delete()
    .eq('vehicle_id', vehicleId)

  if (error) {
    console.error('deleteVehicle error:', error.message)
    throw new Error(error.message)
  }
}