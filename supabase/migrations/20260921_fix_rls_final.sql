-- ============================================================
-- ลบ RLS policies เก่าทั้งหมด แล้วสร้างใหม่ให้ถูกต้อง
-- รันใน Supabase SQL Editor
-- ============================================================

-- ==============================
-- Helper: is_admin()
-- ==============================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================
-- ลบ POLICY เก่าทุกตัวจาก query ที่เห็น
-- ==============================

-- admin
DROP POLICY IF EXISTS "Allow public read on admin" ON admin;
DROP POLICY IF EXISTS "admin_delete" ON admin;
DROP POLICY IF EXISTS "admin_insert" ON admin;
DROP POLICY IF EXISTS "admin_select" ON admin;
DROP POLICY IF EXISTS "admin_update" ON admin;
DROP POLICY IF EXISTS "admin_select_own" ON admin;

-- booking
DROP POLICY IF EXISTS "authenticated can delete booking" ON booking;
DROP POLICY IF EXISTS "authenticated can insert booking" ON booking;
DROP POLICY IF EXISTS "authenticated can select booking" ON booking;
DROP POLICY IF EXISTS "authenticated can update booking" ON booking;
DROP POLICY IF EXISTS "booking_delete" ON booking;
DROP POLICY IF EXISTS "booking_insert" ON booking;
DROP POLICY IF EXISTS "booking_insert_admin" ON booking;
DROP POLICY IF EXISTS "booking_insert_own" ON booking;
DROP POLICY IF EXISTS "booking_select_admin" ON booking;
DROP POLICY IF EXISTS "booking_select_own" ON booking;
DROP POLICY IF EXISTS "booking_update_admin" ON booking;
DROP POLICY IF EXISTS "booking_update_own" ON booking;

-- customer
DROP POLICY IF EXISTS "customer_select_own" ON customer;
DROP POLICY IF EXISTS "customer_select_admin" ON customer;
DROP POLICY IF EXISTS "customer_update_own" ON customer;
DROP POLICY IF EXISTS "customer_insert_own" ON customer;
DROP POLICY IF EXISTS "customer_insert_admin" ON customer;

-- vehicle
DROP POLICY IF EXISTS "vehicle_select_all" ON vehicle;
DROP POLICY IF EXISTS "vehicle_insert_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_update_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_delete_admin" ON vehicle;

-- booking_hold
DROP POLICY IF EXISTS "booking_hold_insert_auth" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_anon" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_all" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_all" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_admin" ON booking_hold;

-- payment
DROP POLICY IF EXISTS "payment_select_own" ON payment;
DROP POLICY IF EXISTS "payment_select_admin" ON payment;
DROP POLICY IF EXISTS "payment_insert_own" ON payment;
DROP POLICY IF EXISTS "payment_update_admin" ON payment;

-- delivery_return
DROP POLICY IF EXISTS "delivery_return_all_admin" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_select_customer" ON delivery_return;

-- penalty
DROP POLICY IF EXISTS "penalty_all_admin" ON penalty;
DROP POLICY IF EXISTS "penalty_select_customer" ON penalty;

-- ==============================
-- เช็คว่า DROP หมดจริง (should return 0 rows)
-- ==============================
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('admin', 'booking', 'customer', 'vehicle', 'booking_hold', 'payment', 'delivery_return', 'penalty')
ORDER BY tablename, policyname;

-- ==============================
-- สร้าง Policies ใหม่ทั้งหมด
-- ==============================

-- ===== customer =====
CREATE POLICY "customer_select_own" ON customer FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "customer_select_admin" ON customer FOR SELECT
  USING (public.is_admin());

CREATE POLICY "customer_update_own" ON customer FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customer_insert_own" ON customer FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "customer_insert_admin" ON customer FOR INSERT
  WITH CHECK (public.is_admin());

-- ===== vehicle =====
CREATE POLICY "vehicle_select_all" ON vehicle FOR SELECT
  USING (true);

CREATE POLICY "vehicle_insert_admin" ON vehicle FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "vehicle_update_admin" ON vehicle FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "vehicle_delete_admin" ON vehicle FOR DELETE
  USING (public.is_admin());

-- ===== booking =====
CREATE POLICY "booking_select_own" ON booking FOR SELECT
  USING (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_select_admin" ON booking FOR SELECT
  USING (public.is_admin());

CREATE POLICY "booking_insert_own" ON booking FOR INSERT
  WITH CHECK (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_insert_admin" ON booking FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "booking_update_own" ON booking FOR UPDATE
  USING (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_update_admin" ON booking FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== booking_hold =====
CREATE POLICY "booking_hold_select_own" ON booking_hold FOR SELECT
  USING (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_hold_insert_own" ON booking_hold FOR INSERT
  WITH CHECK (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_hold_delete_own" ON booking_hold FOR DELETE
  USING (customer_id IN (
    SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "booking_hold_select_admin" ON booking_hold FOR SELECT
  USING (public.is_admin());

CREATE POLICY "booking_hold_insert_admin" ON booking_hold FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "booking_hold_delete_admin" ON booking_hold FOR DELETE
  USING (public.is_admin());

-- ===== payment =====
CREATE POLICY "payment_select_own" ON payment FOR SELECT
  USING (booking_id IN (
    SELECT booking_id FROM booking WHERE customer_id IN (
      SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "payment_select_admin" ON payment FOR SELECT
  USING (public.is_admin());

CREATE POLICY "payment_insert_own" ON payment FOR INSERT
  WITH CHECK (booking_id IN (
    SELECT booking_id FROM booking WHERE customer_id IN (
      SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "payment_update_admin" ON payment FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===== delivery_return =====
CREATE POLICY "delivery_return_all_admin" ON delivery_return FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "delivery_return_select_customer" ON delivery_return FOR SELECT
  USING (booking_id IN (
    SELECT booking_id FROM booking WHERE customer_id IN (
      SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
    )
  ));

-- ===== penalty =====
CREATE POLICY "penalty_all_admin" ON penalty FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "penalty_select_customer" ON penalty FOR SELECT
  USING (booking_id IN (
    SELECT booking_id FROM booking WHERE customer_id IN (
      SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()
    )
  ));

-- ===== admin =====
CREATE POLICY "admin_select_own" ON admin FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
