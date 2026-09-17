import { describe, it, expect } from 'vitest'
import { calcRentalDays, isRangeOverlapping } from './bookingService'

// ==============================
// calcRentalDays
// ==============================
describe('calcRentalDays', () => {
  it('returns 1 when pickup and return are the day (same day = 1 day rental)', () => {
    expect(calcRentalDays('2025-01-10', '2025-01-10')).toBe(1)
  })

  it('calculates multi-day rental correctly', () => {
    expect(calcRentalDays('2025-01-10', '2025-01-13')).toBe(3)
  })


  it('handles month boundary', () => {
    expect(calcRentalDays('2025-01-30', '2025-02-02')).toBe(3)
  })

  it('handles year boundary', () => {
    expect(calcRentalDays('2025-12-30', '2026-01-02')).toBe(3)
  })
})

// ==============================
// isRangeOverlapping
// ==============================
describe('isRangeOverlapping', () => {
  it('returns true when ranges fully overlap', () => {
    expect(isRangeOverlapping('2025-01-10', '2025-01-15', '2025-01-12', '2025-01-18')).toBe(true) // ทับบางส่วน
  })

  it('returns true when range A contains range B', () => {
    expect(isRangeOverlapping('2025-01-10', '2025-01-20', '2025-01-12', '2025-01-15')).toBe(true) // bครอบa
  })

  it('returns true when range B contains range A', () => {
    expect(isRangeOverlapping('2025-01-12', '2025-01-15', '2025-01-10', '2025-01-20')).toBe(true) // aครอบb
  })

  it('returns true when A ends exactly when B starts', () => {
    expect(isRangeOverlapping('2025-01-10', '2025-01-15', '2025-01-15', '2025-01-20')).toBe(true) // วันคืนตรงกับวันจอง
  })

  it('returns true when A starts exactly when B ends', () => {
    expect(isRangeOverlapping('2025-01-15', '2025-01-20', '2025-01-10', '2025-01-15')).toBe(true)// วันคืนตรงกับวันจอง
  })

  it('returns false when A is entirely before B', () => {
    expect(isRangeOverlapping('2025-01-10', '2025-01-15', '2025-01-16', '2025-01-20')).toBe(false) // วันคืนไม่ตรงกับวันจอง
  })

  it('returns false when A is entirely after B', () => {
    expect(isRangeOverlapping('2025-01-16', '2025-01-20', '2025-01-10', '2025-01-15')).toBe(false) // วันคืนไม่ตรงกับวันจอง
  })

  it('returns true when ranges share one day (1-day overlap)', () => {
    expect(isRangeOverlapping('2025-01-10', '2025-01-11', '2025-01-11', '2025-01-12')).toBe(true) // วันคืนตรงกับวันจอง
  })
})
