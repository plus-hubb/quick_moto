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

export interface BookingHold {
  hold_id: number
  vehicle_id: number
  customer_id: number
  pickup_date: string
  return_date: string
  expires_at: string
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
 * เช็คว่าช่วงวันที่ A ทับกับช่วงวันที่ B หรือไม่
 */
function isRangeOverlapping(
  pickupA: string,
  returnA: string,
  pickupB: string,
  returnB: string
): boolean {
  return new Date(pickupA) <= new Date(returnB) && new Date(pickupB) <= new Date(returnA)
}

/**
 * นับจำนวน booking ที่ยัง active อยู่ (ไม่เคยถูกลบ = ยังไม่ถูกยกเลิก) ของรถคันนี้
 * ที่ช่วงวันที่ทับกับช่วงวันที่ที่ระบุ — ใช้เทียบกับ quantity เพื่อดูว่ายังว่างไหม
 */
export async function getOverlappingBookingCount(
  vehicleId: number,
  pickupDate: string,
  returnDate: string
): Promise<number> {
  const { data, error } = await supabase
    .from('booking')
    .select('pickup_date, return_date')
    .eq('vehicle_id', vehicleId)

  if (error) {
    console.error('getOverlappingBookingCount error:', error.message)
    throw error
  }

  return (data ?? []).filter((b) =>
    isRangeOverlapping(pickupDate, returnDate, b.pickup_date, b.return_date)
  ).length
}

/**
 * นับจำนวน "การจองชั่วคราว" (hold) ที่ยังไม่หมดอายุ ของรถคันนี้ ที่ช่วงวันที่ทับกัน
 * excludeHoldId ใช้ตอน confirm booking เพื่อไม่นับ hold ของตัวเองซ้ำ
 */
export async function getActiveHoldCount(
  vehicleId: number,
  pickupDate: string,
  returnDate: string,
  excludeHoldId?: number
): Promise<number> {
  const { data, error } = await supabase
    .from('booking_hold')
    .select('hold_id, pickup_date, return_date, expires_at')
    .eq('vehicle_id', vehicleId)
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('getActiveHoldCount error:', error.message)
    throw error
  }

  return (data ?? []).filter(
    (h) =>
      h.hold_id !== excludeHoldId &&
      isRangeOverlapping(pickupDate, returnDate, h.pickup_date, h.return_date)
  ).length
}

/**
 * คำนวณจำนวนคันที่ยังว่างสำหรับช่วงวันที่ที่เลือก
 * = quantity ทั้งหมด - (booking จริงที่ทับช่วงนั้น) - (hold ชั่วคราวที่ยังไม่หมดอายุที่ทับช่วงนั้น)
 */
export async function getAvailableUnits(
  vehicleId: number,
  quantity: number,
  pickupDate: string,
  returnDate: string,
  excludeHoldId?: number
): Promise<number> {
  const [bookingCount, holdCount] = await Promise.all([
    getOverlappingBookingCount(vehicleId, pickupDate, returnDate),
    getActiveHoldCount(vehicleId, pickupDate, returnDate, excludeHoldId)
  ])
  return Math.max(0, quantity - bookingCount - holdCount)
}

/**
 * STEP 1 — ตอนกด "ไปที่ชำระเงิน": สร้าง hold ชั่วคราว (อายุ 5 นาที)
 * เพื่อหักจำนวนคงเหลือทันที โดยที่ "ยังไม่บันทึกลงตาราง booking"
 */
export async function createHold(input: {
  vehicleId: number
  customerId: number
  quantity: number
  pickupDate: string
  returnDate: string
}): Promise<BookingHold> {
  const availableUnits = await getAvailableUnits(
    input.vehicleId,
    input.quantity,
    input.pickupDate,
    input.returnDate
  )

  if (availableUnits <= 0) {
    throw new Error('ขออภัย รถไม่พร้อมสำหรับช่วงวันที่นี้แล้ว มีคนอื่นจองไปก่อน กรุณาเลือกวันที่อื่น')
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('booking_hold')
    .insert({
      vehicle_id: input.vehicleId,
      customer_id: input.customerId,
      pickup_date: input.pickupDate,
      return_date: input.returnDate,
      expires_at: expiresAt
    })
    .select('*')
    .single()

  if (error) {
    console.error('createHold error:', error.message)
    throw error
  }

  return data
}

/**
 * ใช้เมื่อหมดเวลา 5 นาที หรือลูกค้ากดย้อนกลับก่อนแนบสลิป
 * ลบ hold ทิ้ง ทำให้คันนี้ในช่วงวันที่นี้กลับมาว่างทันที
 */
export async function releaseHold(holdId: number): Promise<void> {
  const { error } = await supabase
    .from('booking_hold')
    .delete()
    .eq('hold_id', holdId)

  if (error) {
    console.error('releaseHold error:', error.message)
    throw error
  }
}

/**
 * STEP 2 — ตอนแนบสลิปสำเร็จ: แปลง hold ชั่วคราวให้กลายเป็นรายการจองจริงในตาราง booking
 * (status = "รออนุมัติ", มัดจำ 500 บาทตายตัว)
 */
export async function confirmBooking(input: {
  holdId: number
  customerId: number
  vehicleId: number
  quantity: number
  pickupDate: string
  returnDate: string
  rentalPrice: number
}): Promise<Booking> {
  // ลบ hold ของตัวเองออกก่อน แล้วเช็คว่างอีกครั้ง (ไม่นับ hold ตัวเองซ้ำ)
  await releaseHold(input.holdId)

  const availableUnits = await getAvailableUnits(
    input.vehicleId,
    input.quantity,
    input.pickupDate,
    input.returnDate
  )

  if (availableUnits <= 0) {
    throw new Error('ช่วงวันที่เลือกเต็มแล้ว กรุณาทำการจองใหม่อีกครั้ง')
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
    console.error('confirmBooking error:', error.message)
    throw error
  }

  return data
}

/**
 * ดึงข้อมูลลูกค้าทีละคน (ใช้แสดง "จองโดย" ในใบรับรองการจอง)
 */
export async function getCustomerById(customerId: number): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .eq('customer_id', customerId)
    .single()

  if (error) {
    console.error('getCustomerById error:', error.message)
    return null
  }

  return data
}

/**
 * ยกเลิกการจองที่ยืนยันแล้ว (เปลี่ยน status เป็น "ยกเลิก" ไม่ลบแถวทิ้ง เพื่อเก็บประวัติไว้)
 */
export async function cancelConfirmedBooking(bookingId: number): Promise<void> {
  const { error } = await supabase
    .from('booking')
    .update({ status: 'ยกเลิก' })
    .eq('booking_id', bookingId)

  if (error) {
    console.error('cancelConfirmedBooking error:', error.message)
    throw error
  }
}

/**
 * ดึงรายการจองทีละรายการ (ใช้ในหน้าชำระเงิน / หน้าใบรับรองการจอง)
 */
export async function getBookingById(bookingId: number): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('booking')
    .select('*')
    .eq('booking_id', bookingId)
    .single()

  if (error) {
    console.error('getBookingById error:', error.message)
    return null
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