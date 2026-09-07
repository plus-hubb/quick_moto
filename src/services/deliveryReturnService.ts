import { supabase } from '../lib/supabase'

export interface DeliveryReturn {
  delivery_return_id: number
  booking_id: number
  admin_id: number
  image_delivery_1: string | null
  image_delivery_2: string | null
  image_delivery_3: string | null
  image_return_1: string | null
  image_return_2: string | null
  image_return_3: string | null
  delivery_date: string | null
  delivery_time: string | null
  return_date: string | null
  return_time: string | null
  helmet_delivery: boolean | null
  helmet_return: boolean | null
  mileage_delivery: number | null
  mileage_return: number | null
  delivery_by: string | null
  return_by: string | null
}

export interface BookingWithDetails {
  booking_id: number
  booking_code: string
  customer_id: number
  vehicle_id: number
  pickup_date: string
  return_date: string
  deposit_price: number
  rental_price: number
  status: string
  booking_date: string
  customer_name: string
  customer_phone: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_image: string | null
}

// ==============================
// รออนุมัติ
// ==============================

/**
 * ดึงรายการจองสถานะ "รออนุมัติ"
 */
export async function getPendingApprovals(): Promise<BookingWithDetails[]> {
  const { data: bookings, error } = await supabase
    .from('booking')
    .select('booking_id, booking_code, customer_id, vehicle_id, pickup_date, return_date, deposit_price, rental_price, status, booking_date')
    .eq('status', 'รออนุมัติ')
    .order('booking_date', { ascending: true })

  if (error) {
    console.error('getPendingApprovals error:', error.message)
    throw error
  }

  if (!bookings || bookings.length === 0) return []

  const customerIds = [...new Set(bookings.map(b => b.customer_id))]
  const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id))]

  const [customersRes, vehiclesRes] = await Promise.all([
    supabase.from('customer').select('customer_id, name, phone').in('customer_id', customerIds),
    supabase.from('vehicle').select('vehicle_id, brand, model, image').in('vehicle_id', vehicleIds)
  ])

  const customerMap = new Map((customersRes.data ?? []).map(c => [c.customer_id, c]))
  const vehicleMap = new Map((vehiclesRes.data ?? []).map(v => [v.vehicle_id, v]))

  return bookings.map(b => ({
    ...b,
    customer_name: customerMap.get(b.customer_id)?.name ?? '-',
    customer_phone: customerMap.get(b.customer_id)?.phone ?? '-',
    vehicle_brand: vehicleMap.get(b.vehicle_id)?.brand ?? '-',
    vehicle_model: vehicleMap.get(b.vehicle_id)?.model ?? '-',
    vehicle_image: vehicleMap.get(b.vehicle_id)?.image ?? null
  }))
}

/**
 * อนุมัติการจอง (เปลี่ยนสถานะเป็น "อนุมัติแล้ว")
 */
export async function approveBooking(bookingId: number): Promise<void> {
  const { error } = await supabase
    .from('booking')
    .update({ status: 'อนุมัติแล้ว' })
    .eq('booking_id', bookingId)
    .eq('status', 'รออนุมัติ')

  if (error) {
    console.error('approveBooking error:', error.message)
    throw error
  }
}

/**
 * ยกเลิกการจอง (เปลี่ยนสถานะเป็น "ยกเลิก")
 */
export async function rejectBooking(bookingId: number): Promise<void> {
  const { error } = await supabase
    .from('booking')
    .update({ status: 'ยกเลิก' })
    .eq('booking_id', bookingId)
    .eq('status', 'รออนุมัติ')

  if (error) {
    console.error('rejectBooking error:', error.message)
    throw error
  }
}

/**
 * ดึงรายการจองสถานะ "อนุมัติแล้ว" ที่ยังไม่มี delivery record (รอส่งมอบ)
 */
export async function getPendingDeliveries(): Promise<BookingWithDetails[]> {
  const { data: bookings, error } = await supabase
    .from('booking')
    .select('booking_id, booking_code, customer_id, vehicle_id, pickup_date, return_date, deposit_price, rental_price, status, booking_date')
    .eq('status', 'อนุมัติแล้ว')
    .order('pickup_date', { ascending: true })

  if (error) {
    console.error('getPendingDeliveries error:', error.message)
    throw error
  }

  if (!bookings || bookings.length === 0) return []

  // เช็คว่า booking ไหนยังไม่มี delivery record
  const { data: existingDR } = await supabase
    .from('delivery_return')
    .select('booking_id')

  const deliveredBookingIds = new Set((existingDR ?? []).map(dr => dr.booking_id))

  const undelivered = bookings.filter(b => !deliveredBookingIds.has(b.booking_id))

  if (undelivered.length === 0) return []

  // ดึงข้อมูล customer และ vehicle
  const customerIds = [...new Set(undelivered.map(b => b.customer_id))]
  const vehicleIds = [...new Set(undelivered.map(b => b.vehicle_id))]

  const [customersRes, vehiclesRes] = await Promise.all([
    supabase.from('customer').select('customer_id, name, phone').in('customer_id', customerIds),
    supabase.from('vehicle').select('vehicle_id, brand, model, image').in('vehicle_id', vehicleIds)
  ])

  const customerMap = new Map((customersRes.data ?? []).map(c => [c.customer_id, c]))
  const vehicleMap = new Map((vehiclesRes.data ?? []).map(v => [v.vehicle_id, v]))

  return undelivered.map(b => ({
    ...b,
    customer_name: customerMap.get(b.customer_id)?.name ?? '-',
    customer_phone: customerMap.get(b.customer_id)?.phone ?? '-',
    vehicle_brand: vehicleMap.get(b.vehicle_id)?.brand ?? '-',
    vehicle_model: vehicleMap.get(b.vehicle_id)?.model ?? '-',
    vehicle_image: vehicleMap.get(b.vehicle_id)?.image ?? null
  }))
}

/**
 * ดึงรายการที่ส่งมอบแล้วแต่ยังไม่ได้รับคืน (รอรับคืน)
 */
export async function getPendingReturns(): Promise<(BookingWithDetails & { delivery_return_id: number })[]> {
  const { data: dr, error } = await supabase
    .from('delivery_return')
    .select('delivery_return_id, booking_id')
    .is('return_date', null)

  if (error) {
    console.error('getPendingReturns error:', error.message)
    throw error
  }

  if (!dr || dr.length === 0) return []

  const bookingIds = dr.map(d => d.booking_id)
  const drMap = new Map(dr.map(d => [d.booking_id, d.delivery_return_id]))

  const { data: bookings, error: bookingError } = await supabase
    .from('booking')
    .select('booking_id, booking_code, customer_id, vehicle_id, pickup_date, return_date, deposit_price, rental_price, status, booking_date')
    .in('booking_id', bookingIds)
    .eq('status', 'กำลังเช่า')

  if (bookingError) {
    console.error('getPendingReturns bookings error:', bookingError.message)
    throw bookingError
  }

  if (!bookings || bookings.length === 0) return []

  const customerIds = [...new Set(bookings.map(b => b.customer_id))]
  const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id))]

  const [customersRes, vehiclesRes] = await Promise.all([
    supabase.from('customer').select('customer_id, name, phone').in('customer_id', customerIds),
    supabase.from('vehicle').select('vehicle_id, brand, model, image').in('vehicle_id', vehicleIds)
  ])

  const customerMap = new Map((customersRes.data ?? []).map(c => [c.customer_id, c]))
  const vehicleMap = new Map((vehiclesRes.data ?? []).map(v => [v.vehicle_id, v]))

  return bookings.map(b => ({
    ...b,
    delivery_return_id: drMap.get(b.booking_id)!,
    customer_name: customerMap.get(b.customer_id)?.name ?? '-',
    customer_phone: customerMap.get(b.customer_id)?.phone ?? '-',
    vehicle_brand: vehicleMap.get(b.vehicle_id)?.brand ?? '-',
    vehicle_model: vehicleMap.get(b.vehicle_id)?.model ?? '-',
    vehicle_image: vehicleMap.get(b.vehicle_id)?.image ?? null
  }))
}

/**
 * บันทึกการส่งมอบ (สร้าง delivery_return record ใหม่)
 */
export async function saveDelivery(input: {
  bookingId: number
  adminId: number
  image1: string | null
  image2: string | null
  image3: string | null
  mileage: number
  helmet: boolean
}): Promise<DeliveryReturn> {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0]

  const adminData = JSON.parse(localStorage.getItem('admin') ?? '{}')

  const { data, error } = await supabase
    .from('delivery_return')
    .insert({
      booking_id: input.bookingId,
      admin_id: input.adminId,
      image_delivery_1: input.image1,
      image_delivery_2: input.image2,
      image_delivery_3: input.image3,
      delivery_date: dateStr,
      delivery_time: timeStr,
      helmet_delivery: input.helmet,
      mileage_delivery: input.mileage,
      delivery_by: adminData.name ?? ''
    })
    .select('*')
    .single()

  if (error) {
    console.error('saveDelivery error:', error.message)
    throw error
  }

  // อัปเดตสถานะ booking เป็น "กำลังเช่า"
  const { error: statusError } = await supabase
    .from('booking')
    .update({ status: 'กำลังเช่า' })
    .eq('booking_id', input.bookingId)

  if (statusError) {
    console.error('saveDelivery status update error:', statusError.message)
    throw statusError
  }

  return data
}

/**
 * บันทึกการรับคืน (อัปเดต delivery_return record ที่มีอยู่)
 */
export async function saveReturn(input: {
  deliveryReturnId: number
  bookingId: number
  image1: string | null
  image2: string | null
  image3: string | null
  mileage: number
  helmet: boolean
}): Promise<DeliveryReturn> {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0]

  const adminData = JSON.parse(localStorage.getItem('admin') ?? '{}')

  const { data, error } = await supabase
    .from('delivery_return')
    .update({
      image_return_1: input.image1,
      image_return_2: input.image2,
      image_return_3: input.image3,
      return_date: dateStr,
      return_time: timeStr,
      helmet_return: input.helmet,
      mileage_return: input.mileage,
      return_by: adminData.name ?? ''
    })
    .eq('delivery_return_id', input.deliveryReturnId)
    .select('*')
    .single()

  if (error) {
    console.error('saveReturn error:', error.message)
    throw error
  }

  // อัปเดตสถานะ booking เป็น "เสร็จสิ้น"
  const { error: statusError } = await supabase
    .from('booking')
    .update({ status: 'เสร็จสิ้น' })
    .eq('booking_id', input.bookingId)

  if (statusError) {
    console.error('saveReturn status update error:', statusError.message)
    throw statusError
  }

  return data
}

/**
 * อัปโหลดรูปภาพไป Supabase Storage
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `delivery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from('qrick_moto_img')
    .upload(fileName, file, { contentType: file.type })

  if (error) {
    console.error('uploadImage error:', error.message)
    throw error
  }

  const { data: urlData } = supabase.storage
    .from('qrick_moto_img')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// ==============================
// คำขอยกเลิก
// ==============================

/**
 * ดึงรายการจองสถานะ "ยกเลิก"
 */
export async function getCancelledBookings(): Promise<(BookingWithDetails & { payment_slip: string | null })[]> {
  const { data: bookings, error } = await supabase
    .from('booking')
    .select('booking_id, booking_code, customer_id, vehicle_id, pickup_date, return_date, deposit_price, rental_price, status, booking_date')
    .eq('status', 'ยกเลิก')
    .order('booking_date', { ascending: false })

  if (error) {
    console.error('getCancelledBookings error:', error.message)
    throw error
  }

  if (!bookings || bookings.length === 0) return []

  const customerIds = [...new Set(bookings.map(b => b.customer_id))]
  const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id))]
  const bookingIds = bookings.map(b => b.booking_id)

  const [customersRes, vehiclesRes, paymentsRes] = await Promise.all([
    supabase.from('customer').select('customer_id, name, phone').in('customer_id', customerIds),
    supabase.from('vehicle').select('vehicle_id, brand, model, image').in('vehicle_id', vehicleIds),
    supabase.from('payment').select('booking_id, payment_slip').in('booking_id', bookingIds)
  ])

  const customerMap = new Map((customersRes.data ?? []).map(c => [c.customer_id, c]))
  const vehicleMap = new Map((vehiclesRes.data ?? []).map(v => [v.vehicle_id, v]))
  const paymentMap = new Map((paymentsRes.data ?? []).map(p => [p.booking_id, p.payment_slip]))

  return bookings.map(b => ({
    ...b,
    customer_name: customerMap.get(b.customer_id)?.name ?? '-',
    customer_phone: customerMap.get(b.customer_id)?.phone ?? '-',
    vehicle_brand: vehicleMap.get(b.vehicle_id)?.brand ?? '-',
    vehicle_model: vehicleMap.get(b.vehicle_id)?.model ?? '-',
    vehicle_image: vehicleMap.get(b.vehicle_id)?.image ?? null,
    payment_slip: paymentMap.get(b.booking_id) ?? null
  }))
}

// ==============================
// ดึงสลิปการชำระเงิน
// ==============================

/**
 * ดึงข้อมูลการชำระเงินของ booking
 */
export async function getPaymentByBookingId(bookingId: number): Promise<{ payment_slip: string | null } | null> {
  const { data, error } = await supabase
    .from('payment')
    .select('payment_slip')
    .eq('booking_id', bookingId)
    .maybeSingle()

  if (error) {
    console.error('getPaymentByBookingId error:', error.message)
    return null
  }

  return data
}
