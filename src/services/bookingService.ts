import { supabase } from '../lib/supabase'

export interface Customer {
  customer_id: number
  name: string
  email: string
  phone: string
  auth_user_id: string | null
}

export interface Booking {
  booking_id: number
  booking_code: string
  customer_id: number
  vehicle_id: number
  booking_date: string
  pickup_date: string
  return_date: string
  deposit_price: number
  rental_price: number
  status: string
}

export interface Payment {
  payment_id: number
  booking_id: number
  payment_datetime: string
  payment_slip: string | null
}

export interface BookedRange {
  pickup_date: string
  return_date: string
}

/**
 * ดึงข้อมูลลูกค้าที่ login อยู่ในขณะนี้ (ผูกกับ auth.users ผ่าน auth_user_id)
 */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData.user) {
    console.error('getCurrentCustomer auth error:', authError?.message)
    return null
  }

  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .single()

  if (error) {
    console.error('getCurrentCustomer error:', error.message)
    return null
  }

  return data
}

/**
 * นับจำนวนวันเช่า (อย่างน้อย 1 วัน)
 */
export function calcRentalDays(pickupDate: string, returnDate: string): number {
  const pickup = new Date(pickupDate)
  const ret = new Date(returnDate)
  const diffMs = ret.getTime() - pickup.getTime()
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return days > 0 ? days : 1
}

/**
 * สร้างเลขที่การจองแบบ unique อย่างง่าย
 */
function generateBookingCode(): string {
  const now = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `BK-${now}-${rand}`
}

/**
 * ดึงช่วงวันที่ถูกจองแล้วทั้งหมดของรถคันนี้ (ใช้เช็คก่อนอนุญาตให้จองซ้อน)
 */
export async function getBookedRanges(vehicleId: number): Promise<BookedRange[]> {
  const { data, error } = await supabase
    .from('booking')
    .select('pickup_date, return_date')
    .eq('vehicle_id', vehicleId)

  if (error) {
    console.error('getBookedRanges error:', error.message)
    return []
  }

  return data ?? []
}

/**
 * เช็คว่าช่วงวันที่ A ทับกับช่วงวันที่ B หรือไม่
 */
export function isRangeOverlapping(
  pickupA: string,
  returnA: string,
  pickupB: string,
  returnB: string
): boolean {
  return new Date(pickupA) <= new Date(returnB) && new Date(pickupB) <= new Date(returnA)
}

/**
 * เปลี่ยนสถานะรถ
 */
export async function setVehicleStatus(vehicleId: number, status: string): Promise<void> {
  const { error } = await supabase
    .from('vehicle')
    .update({ status })
    .eq('vehicle_id', vehicleId)

  if (error) {
    console.error('setVehicleStatus error:', error.message)
    throw error
  }
}

/**
 * STEP 1 — ตอนกด "จอง": ยังไม่บันทึกลงตาราง booking
 * แค่ hold รถไว้ก่อนโดยเปลี่ยนสถานะเป็น "unavailable" ชั่วคราว
 * (ยังไม่มีแถวในตาราง booking จนกว่าจะแนบสลิปสำเร็จ)
 */
export async function holdVehicle(vehicleId: number): Promise<void> {
  await setVehicleStatus(vehicleId, 'unavailable')
}

/**
 * ใช้ตอนหมดเวลา 5 นาทีแล้วลูกค้ายังไม่แนบสลิป
 * คืนสถานะรถกลับเป็น "available" (ไม่มีอะไรต้องลบ เพราะยังไม่เคย insert booking)
 */
export async function releaseVehicleHold(vehicleId: number): Promise<void> {
  await setVehicleStatus(vehicleId, 'available')
}

/**
 * STEP 2 — ตอนแนบสลิปสำเร็จ: บันทึกรายการจองจริงลงตาราง booking
 * (status = รออนุมัติ, มัดจำ 500 บาทตายตัว) — รถยังคง "unavailable" ต่อไปตลอด
 */
export async function confirmBooking(input: {
  customerId: number
  vehicleId: number
  pickupDate: string
  returnDate: string
  rentalPrice: number
}): Promise<Booking> {
  // เช็คซ้ำอีกครั้งก่อน insert จริง กันเคสที่มีคนอื่นจองแทรกระหว่างที่ผู้ใช้กรอกฟอร์ม/ชำระเงินอยู่
  const existingRanges = await getBookedRanges(input.vehicleId)
  const hasOverlap = existingRanges.some((r) =>
    isRangeOverlapping(input.pickupDate, input.returnDate, r.pickup_date, r.return_date)
  )

  if (hasOverlap) {
    throw new Error('ช่วงวันที่เลือกถูกจองไปแล้ว กรุณาเลือกวันที่อื่น')
  }

  const { data, error } = await supabase
    .from('booking')
    .insert({
      booking_code: generateBookingCode(),
      customer_id: input.customerId,
      vehicle_id: input.vehicleId,
      pickup_date: input.pickupDate,
      return_date: input.returnDate,
      deposit_price: 500,
      rental_price: input.rentalPrice,
      status: 'รออนุมัติ'
    })
    .select('*')
    .single()

  if (error) {
    // 23P01 = exclusion_violation จาก PostgreSQL exclusion constraint (booking_no_overlap)
    if ((error as { code?: string }).code === '23P01') {
      throw new Error('ช่วงวันที่เลือกถูกจองไปแล้ว กรุณาเลือกวันที่อื่น')
    }
    console.error('confirmBooking error:', error.message)
    throw error
  }

  return data
}

/**
 * บันทึกหลักฐานการชำระเงิน (สลิป) ลงตาราง payment
 */
export async function createPayment(input: {
  bookingId: number
  slipUrl: string
}): Promise<Payment> {
  const { data, error } = await supabase
    .from('payment')
    .insert({
      booking_id: input.bookingId,
      payment_slip: input.slipUrl
    })
    .select('*')
    .single()

  if (error) {
    console.error('createPayment error:', error.message)
    throw error
  }

  return data
}