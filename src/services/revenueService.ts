import { supabase } from '../lib/supabase'
import { normalizeStatus } from './bookingService'

export interface RevenueRecord {
  booking_id: number
  booking_code: string
  booking_date: string
  pickup_date: string
  return_date: string
  deposit_price: number
  rental_price: number
  status: string
  cancel_reason: string | null
  penalty_total: number
  month: string // YYYY-MM
}

export interface MonthlyRevenue {
  month: string // YYYY-MM
  label: string // "กันยายน 2026"
  deposit: number
  rental: number
  penalty: number
  total: number
  count: number
}

export interface RevenueSummary {
  totalDeposit: number
  totalRental: number
  totalPenalty: number
  totalRevenue: number
  monthly: MonthlyRevenue[]
}

/**
 * คำนวณรายได้จาก booking 1 รายการ
 *
 * กฎ:
 * - customer_cancel  → เอาค่ามัดจำ
 * - admin_reject     → ไม่เอาอะไร
 * - no_show          → เอาค่ามัดจำ (ลูกค้าไม่มารับรถ)
 * - auto_expire      → ไม่เอาอะไร (แอดมินไม่อนุมัติ ไม่นับค่ามัดจำ)
 * - เสร็จสิ้น        → เอาค่าเช่า + ค่าปรับ (ไม่นับค่ามัดจำ)
 * - อนุมัติแล้ว/กำลังเช่า/รออนุมัติ → ยังไม่นับ
 */
function calcBookingRevenue(b: {
  status: string
  cancel_reason: string | null
  deposit_price: number
  rental_price: number
  penalty_total: number
}): { deposit: number; rental: number; penalty: number } {
  const status = normalizeStatus(b.status)

  if (status === 'ยกเลิก') {
    const reason = b.cancel_reason
    // admin_reject, auto_expire → ไม่นับ
    if (reason === 'admin_reject' || reason === 'auto_expire') {
      return { deposit: 0, rental: 0, penalty: 0 }
    }
    // customer_cancel, no_show → เอาค่ามัดจำ
    return { deposit: b.deposit_price, rental: 0, penalty: 0 }
  }

  if (status === 'เสร็จสิ้น') {
    // เอาค่าเช่า + ค่าปรับ ไม่นับค่ามัดจำ
    return { deposit: 0, rental: b.rental_price, penalty: b.penalty_total }
  }

  // รออนุมัติ, อนุมัติแล้ว, กำลังเช่า → ยังไม่นับ
  return { deposit: 0, rental: 0, penalty: 0 }
}

/**
 * ดึงข้อมูลรายได้ทั้งหมด
 */
export async function getRevenueData(): Promise<RevenueSummary> {
  // ดึง booking ทั้งหมดที่ status ไม่ใช่ รออนุมัติ (เพราะยังไม่มีรายได้)
  const { data: bookings, error } = await supabase
    .from('booking')
    .select('booking_id, booking_code, booking_date, pickup_date, return_date, deposit_price, rental_price, status, cancel_reason')

  if (error) {
    console.error('getRevenueData error:', error.message)
    throw error
  }

  // ดึงค่าปรับทั้งหมด
  const { data: penalties } = await supabase
    .from('penalty')
    .select('booking_id, total_penalty')

  const penaltyMap = new Map((penalties ?? []).map(p => [p.booking_id, p.total_penalty]))

  // คำนวณรายได้แต่ละ booking
  const records: RevenueRecord[] = (bookings ?? []).map(b => {
    const rev = calcBookingRevenue({
      status: b.status,
      cancel_reason: b.cancel_reason,
      deposit_price: b.deposit_price,
      rental_price: b.rental_price,
      penalty_total: penaltyMap.get(b.booking_id) ?? 0
    })

    const bookingDate = new Date(b.booking_date)
    const month = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`

    return {
      booking_id: b.booking_id,
      booking_code: b.booking_code,
      booking_date: b.booking_date,
      pickup_date: b.pickup_date,
      return_date: b.return_date,
      deposit_price: b.deposit_price,
      rental_price: b.rental_price,
      status: b.status,
      cancel_reason: b.cancel_reason,
      penalty_total: penaltyMap.get(b.booking_id) ?? 0,
      month
    }
  })

  // จัดกลุ่มตามเดือน
  const monthMap = new Map<string, { deposit: number; rental: number; penalty: number; count: number }>()

  let totalDeposit = 0
  let totalRental = 0
  let totalPenalty = 0

  for (const r of records) {
    const rev = calcBookingRevenue({
      status: r.status,
      cancel_reason: r.cancel_reason,
      deposit_price: r.deposit_price,
      rental_price: r.rental_price,
      penalty_total: r.penalty_total
    })

    totalDeposit += rev.deposit
    totalRental += rev.rental
    totalPenalty += rev.penalty

    const existing = monthMap.get(r.month) ?? { deposit: 0, rental: 0, penalty: 0, count: 0 }
    existing.deposit += rev.deposit
    existing.rental += rev.rental
    existing.penalty += rev.penalty
    existing.count += 1
    monthMap.set(r.month, existing)
  }

  // แปลงเป็น array เรียงเดือนล่าสุดขึ้นบน
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

  const monthly: MonthlyRevenue[] = Array.from(monthMap.entries())
    .map(([month, data]) => {
      const [year, m] = month.split('-')
      const monthIdx = parseInt(m) - 1
      return {
        month,
        label: `${thaiMonths[monthIdx]} ${parseInt(year) + 543}`,
        deposit: data.deposit,
        rental: data.rental,
        penalty: data.penalty,
        total: data.deposit + data.rental + data.penalty,
        count: data.count
      }
    })
    .sort((a, b) => b.month.localeCompare(a.month))

  return {
    totalDeposit,
    totalRental,
    totalPenalty,
    totalRevenue: totalDeposit + totalRental + totalPenalty,
    monthly
  }
}
