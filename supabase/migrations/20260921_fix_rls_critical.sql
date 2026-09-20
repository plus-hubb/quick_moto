-- ============================================================
-- แก้ bug RLS + เพิ่ม policies ที่ขาด + สร้าง RPC functions
-- รัน migration นี้ใน Supabase SQL Editor
-- ============================================================

-- ==============================
-- RPC: นับ booking ที่ทับช่วง (bypass RLS — ต้องนับของทุกคน)
-- ==============================
CREATE OR REPLACE FUNCTION public.count_overlapping_bookings(
  p_vehicle_id integer,
  p_pickup_date date,
  p_return_date date
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT count(*)::integer
  FROM public.booking
  WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('ยกเลิก')
    AND pickup_date <= p_return_date
    AND return_date >= p_pickup_date;
$$;

-- ==============================
-- RPC: นับ booking_hold ที่ทับช่วง (bypass RLS)
-- ==============================
CREATE OR REPLACE FUNCTION public.count_active_holds(
  p_vehicle_id integer,
  p_pickup_date date,
  p_return_date date,
  p_exclude_hold_id integer DEFAULT NULL
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT count(*)::integer
  FROM public.booking_hold
  WHERE vehicle_id = p_vehicle_id
    AND expires_at > now()
    AND (p_exclude_hold_id IS NULL OR hold_id != p_exclude_hold_id)
    AND pickup_date <= p_return_date
    AND return_date >= p_pickup_date;
$$;

-- ==============================
-- RPC: คำนวณราคาค่าเช่าจาก vehicle price (server-side)
-- ==============================
CREATE OR REPLACE FUNCTION public.calc_rental_price(
  p_vehicle_id integer,
  p_pickup_date date,
  p_return_date date
)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(v.price, 0) * GREATEST(1, (p_return_date - p_pickup_date))
  FROM public.vehicle v
  WHERE v.vehicle_id = p_vehicle_id;
$$;

-- ==============================
-- เพิ่ม RLS policies ที่ขาด
-- ==============================

-- booking_hold: admin สร้าง hold ได้ (walk-in)
DROP POLICY IF EXISTS "booking_hold_insert_admin" ON booking_hold;
CREATE POLICY "booking_hold_insert_admin"
  ON booking_hold FOR INSERT
  WITH CHECK (public.is_admin());

-- payment: admin อ่าน/แก้ไข ได้ทุกคน
DROP POLICY IF EXISTS "payment_update_admin" ON payment;
CREATE POLICY "payment_update_admin"
  ON payment FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- delivery_return: customer อ่านได้เฉพาะของตัวเอง (ใบรับรอง)
DROP POLICY IF EXISTS "delivery_return_select_customer" ON delivery_return;
CREATE POLICY "delivery_return_select_customer"
  ON delivery_return FOR SELECT
  USING (
    booking_id IN (
      SELECT booking_id FROM booking
      WHERE customer_id IN (
        SELECT customer_id FROM customer
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- penalty: customer อ่านได้เฉพาะของตัวเอง (ใบรับรอง)
DROP POLICY IF EXISTS "penalty_select_customer" ON penalty;
CREATE POLICY "penalty_select_customer"
  ON penalty FOR SELECT
  USING (
    booking_id IN (
      SELECT booking_id FROM booking
      WHERE customer_id IN (
        SELECT customer_id FROM customer
        WHERE auth_user_id = auth.uid()
      )
    )
  );
