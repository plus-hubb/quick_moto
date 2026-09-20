-- ============================================================
-- ลบ policy เก่าทั้งหมด แล้วสร้างใหม่
-- รัน migration นี้ใน Supabase SQL Editor
-- ============================================================

-- ==============================
-- Helper: เช็คว่า user ปัจจุบันเป็นแอดมินหรือไม่
-- ==============================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================
-- 1. customer — ลบเก่า + สร้างใหม่
-- ==============================
DROP POLICY IF EXISTS "customer_select_own" ON customer;
DROP POLICY IF EXISTS "customer_select_admin" ON customer;
DROP POLICY IF EXISTS "customer_update_own" ON customer;
DROP POLICY IF EXISTS "customer_insert_own" ON customer;
DROP POLICY IF EXISTS "customer_insert_admin" ON customer;

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_select_own"
  ON customer FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "customer_select_admin"
  ON customer FOR SELECT
  USING (public.is_admin());

CREATE POLICY "customer_update_own"
  ON customer FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customer_insert_own"
  ON customer FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customer_insert_admin"
  ON customer FOR INSERT
  WITH CHECK (public.is_admin());

-- ==============================
-- 2. vehicle — ลบเก่า + สร้างใหม่
-- ==============================
DROP POLICY IF EXISTS "vehicle_select_all" ON vehicle;
DROP POLICY IF EXISTS "vehicle_insert_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_update_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_delete_admin" ON vehicle;

ALTER TABLE vehicle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicle_select_all"
  ON vehicle FOR SELECT
  USING (true);

CREATE POLICY "vehicle_insert_admin"
  ON vehicle FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "vehicle_update_admin"
  ON vehicle FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "vehicle_delete_admin"
  ON vehicle FOR DELETE
  USING (public.is_admin());

-- ==============================
-- 3. booking — ลบเก่า + สร้างใหม่
-- ==============================
DROP POLICY IF EXISTS "booking_select_own" ON booking;
DROP POLICY IF EXISTS "booking_select_admin" ON booking;
DROP POLICY IF EXISTS "booking_insert_own" ON booking;
DROP POLICY IF EXISTS "booking_insert_admin" ON booking;
DROP POLICY IF EXISTS "booking_update_own" ON booking;
DROP POLICY IF EXISTS "booking_update_admin" ON booking;

ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_select_own"
  ON booking FOR SELECT
  USING (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_select_admin"
  ON booking FOR SELECT
  USING (public.is_admin());

CREATE POLICY "booking_insert_own"
  ON booking FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_insert_admin"
  ON booking FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "booking_update_own"
  ON booking FOR UPDATE
  USING (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_update_admin"
  ON booking FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================
-- 4. booking_hold — ลบเก่า + สร้างใหม่
-- ==============================
DROP POLICY IF EXISTS "booking_hold_insert_auth" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_anon" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_all" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_all" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_admin" ON booking_hold;

ALTER TABLE booking_hold ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_hold_select_own"
  ON booking_hold FOR SELECT
  USING (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_hold_insert_own"
  ON booking_hold FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_hold_delete_own"
  ON booking_hold FOR DELETE
  USING (
    customer_id IN (
      SELECT customer_id FROM customer
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "booking_hold_select_admin"
  ON booking_hold FOR SELECT
  USING (public.is_admin());

CREATE POLICY "booking_hold_delete_admin"
  ON booking_hold FOR DELETE
  USING (public.is_admin());

-- ==============================
-- 5. payment — ลบเก่า + สร้างใหม่
-- ==============================
DROP POLICY IF EXISTS "payment_select_own" ON payment;
DROP POLICY IF EXISTS "payment_select_admin" ON payment;
DROP POLICY IF EXISTS "payment_insert_own" ON payment;

ALTER TABLE payment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_select_own"
  ON payment FOR SELECT
  USING (
    booking_id IN (
      SELECT booking_id FROM booking
      WHERE customer_id IN (
        SELECT customer_id FROM customer
        WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "payment_select_admin"
  ON payment FOR SELECT
  USING (public.is_admin());

CREATE POLICY "payment_insert_own"
  ON payment FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT booking_id FROM booking
      WHERE customer_id IN (
        SELECT customer_id FROM customer
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- ==============================
-- 6. delivery_return — Admin เท่านั้น
-- ==============================
DROP POLICY IF EXISTS "delivery_return_all_admin" ON delivery_return;

ALTER TABLE delivery_return ENABLE ROW LEVEL SECURITY;

CREATE POLICY "delivery_return_all_admin"
  ON delivery_return FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================
-- 7. penalty — Admin เท่านั้น
-- ==============================
DROP POLICY IF EXISTS "penalty_all_admin" ON penalty;

ALTER TABLE penalty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "penalty_all_admin"
  ON penalty FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================
-- 8. admin — Lock down
-- ==============================
DROP POLICY IF EXISTS "admin_select_own" ON admin;

ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_own"
  ON admin FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
