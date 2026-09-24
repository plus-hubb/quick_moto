import { supabaseAdmin } from '../lib/supabase'

export interface Refund {
  refund_id: number
  booking_id: number
  amount: number
  refund_slip: string | null
  note: string | null
  admin_id: number | null
  refund_date: string
}

export interface RefundedBooking {
  booking_id: number
  booking_code: string
  customer_id: number
  vehicle_id: number
  pickup_date: string
  return_date: string
  deposit_price: number
  rental_price: number
  booking_date: string
  cancel_reason: string | null
  cancel_note: string | null
  customer_name: string
  customer_phone: string
  vehicle_brand: string
  vehicle_model: string
  vehicle_image: string | null
  refund: Refund | null
}

/**
 * ดึงข้อมูลการคืนเงินล่าสุดของ booking (ถ้ามี)
 */
export async function getRefundByBookingId(bookingId: number): Promise<Refund | null> {
  const { data, error } = await supabaseAdmin
    .from('refund')
    .select('*')
    .eq('booking_id', bookingId)
    .order('refund_id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('getRefundByBookingId error:', error.message)
    return null
  }

  return data
}

/**
 * ดึงข้อมูลการคืนเงินของหลาย booking พร้อมกัน — คืน Map<booking_id, Refund> (ล่าสุด)
 */
export async function getRefundsByBookingIds(bookingIds: number[]): Promise<Map<number, Refund>> {
  const map = new Map<number, Refund>()
  if (bookingIds.length === 0) return map

  const { data, error } = await supabaseAdmin
    .from('refund')
    .select('*')
    .in('booking_id', bookingIds)
    .order('refund_id', { ascending: false })

  if (error) {
    console.error('getRefundsByBookingIds error:', error.message)
    return map
  }

  for (const r of data ?? []) {
    if (!map.has(r.booking_id)) map.set(r.booking_id, r)
  }

  return map
}

/**
 * บันทึกการคืนเงิน
 */
export async function recordRefund(input: {
  bookingId: number
  amount: number
  refundSlip: string | null
  note?: string
}): Promise<Refund> {
  const adminData = JSON.parse(localStorage.getItem('admin') ?? '{}')

  const { data, error } = await supabaseAdmin
    .from('refund')
    .insert({
      booking_id: input.bookingId,
      amount: input.amount,
      refund_slip: input.refundSlip ?? null,
      note: input.note ?? null,
      admin_id: adminData.admin_id ?? null
    })
    .select('*')
    .single()

  if (error) {
    console.error('recordRefund error:', error.message)
    throw error
  }

  return data
}

/**
 * ดึงรายการที่คืนเงินแล้ว (สำหรับหน้า คืนเงินแล้ว)
 */
export async function getRefundedBookings(): Promise<RefundedBooking[]> {
  const { data: refunds, error } = await supabaseAdmin
    .from('refund')
    .select('*')
    .order('refund_date', { ascending: false })

  if (error) {
    console.error('getRefundedBookings error:', error.message)
    throw error
  }

  if (!refunds || refunds.length === 0) return []

  const bookingIds = refunds.map(r => r.booking_id)

  const { data: bookings, error: bookingError } = await supabaseAdmin
    .from('booking')
    .select('booking_id, booking_code, customer_id, vehicle_id, pickup_date, return_date, deposit_price, rental_price, status, booking_date, cancel_reason, cancel_note, license_plate, accommodation')
    .in('booking_id', bookingIds)

  if (bookingError) {
    console.error('getRefundedBookings bookings error:', bookingError.message)
    throw bookingError
  }

  if (!bookings || bookings.length === 0) return []

  const customerIds = [...new Set(bookings.map(b => b.customer_id))]
  const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id))]

  const [customersRes, vehiclesRes] = await Promise.all([
    supabaseAdmin.from('customer').select('customer_id, name, phone').in('customer_id', customerIds),
    supabaseAdmin.from('vehicle').select('vehicle_id, brand, model, image').in('vehicle_id', vehicleIds)
  ])

  const customerMap = new Map((customersRes.data ?? []).map(c => [c.customer_id, c]))
  const vehicleMap = new Map((vehiclesRes.data ?? []).map(v => [v.vehicle_id, v]))

  const refundMap = new Map<number, Refund>()
  for (const r of refunds) {
    if (!refundMap.has(r.booking_id)) refundMap.set(r.booking_id, r)
  }

  return bookings.map(b => ({
    ...b,
    customer_name: customerMap.get(b.customer_id)?.name ?? '-',
    customer_phone: customerMap.get(b.customer_id)?.phone ?? '-',
    vehicle_brand: vehicleMap.get(b.vehicle_id)?.brand ?? '-',
    vehicle_model: vehicleMap.get(b.vehicle_id)?.model ?? '-',
    vehicle_image: vehicleMap.get(b.vehicle_id)?.image ?? null,
    refund: refundMap.get(b.booking_id) ?? null
  }))
}