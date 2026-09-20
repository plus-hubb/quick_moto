-- ============================================================
-- CLEAN SLATE: Drop ALL policies by role, then recreate
-- Run in Supabase SQL Editor
-- ============================================================

-- Helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==============================
-- DROP EVERYTHING — explicit role names required
-- ==============================

-- admin table
DROP POLICY IF EXISTS "Allow public read on admin" ON admin;
DROP POLICY IF EXISTS "admin_delete" ON admin;
DROP POLICY IF EXISTS "admin_delete" ON admin FOR anon;
DROP POLICY IF EXISTS "admin_insert" ON admin;
DROP POLICY IF EXISTS "admin_insert" ON admin FOR anon;
DROP POLICY IF EXISTS "admin_select" ON admin;
DROP POLICY IF EXISTS "admin_select" ON admin FOR anon;
DROP POLICY IF EXISTS "admin_select_own" ON admin;
DROP POLICY IF EXISTS "admin_update" ON admin;
DROP POLICY IF EXISTS "admin_update" ON admin FOR anon;

-- booking table
DROP POLICY IF EXISTS "authenticated can delete booking" ON booking;
DROP POLICY IF EXISTS "authenticated can delete booking" ON booking FOR authenticated;
DROP POLICY IF EXISTS "authenticated can insert booking" ON booking;
DROP POLICY IF EXISTS "authenticated can insert booking" ON booking FOR authenticated;
DROP POLICY IF EXISTS "authenticated can select booking" ON booking;
DROP POLICY IF EXISTS "authenticated can select booking" ON booking FOR authenticated;
DROP POLICY IF EXISTS "authenticated can update booking" ON booking;
DROP POLICY IF EXISTS "authenticated can update booking" ON booking FOR authenticated;
DROP POLICY IF EXISTS "booking_delete" ON booking;
DROP POLICY IF EXISTS "booking_delete" ON booking FOR anon;
DROP POLICY IF EXISTS "booking_insert" ON booking;
DROP POLICY IF EXISTS "booking_insert" ON booking FOR anon;
DROP POLICY IF EXISTS "booking_insert_admin" ON booking;
DROP POLICY IF EXISTS "booking_insert_own" ON booking;
DROP POLICY IF EXISTS "booking_select" ON booking;
DROP POLICY IF EXISTS "booking_select" ON booking FOR anon;
DROP POLICY IF EXISTS "booking_select_admin" ON booking;
DROP POLICY IF EXISTS "booking_select_own" ON booking;
DROP POLICY IF EXISTS "booking_update" ON booking;
DROP POLICY IF EXISTS "booking_update" ON booking FOR anon;
DROP POLICY IF EXISTS "booking_update_admin" ON booking;
DROP POLICY IF EXISTS "booking_update_own" ON booking;

-- customer table
DROP POLICY IF EXISTS "Allow customer read" ON customer;
DROP POLICY IF EXISTS "Allow customer read" ON customer FOR anon;
DROP POLICY IF EXISTS "Allow customer read" ON customer FOR authenticated;
DROP POLICY IF EXISTS "Allow public customer signup" ON customer;
DROP POLICY IF EXISTS "Allow public customer signup" ON customer FOR anon;
DROP POLICY IF EXISTS "Allow public customer signup" ON customer FOR authenticated;
DROP POLICY IF EXISTS "customer_delete" ON customer;
DROP POLICY IF EXISTS "customer_delete" ON customer FOR anon;
DROP POLICY IF EXISTS "customer_insert" ON customer;
DROP POLICY IF EXISTS "customer_insert" ON customer FOR anon;
DROP POLICY IF EXISTS "customer_insert_admin" ON customer;
DROP POLICY IF EXISTS "customer_insert_own" ON customer;
DROP POLICY IF EXISTS "customer_insert_policy" ON customer;
DROP POLICY IF EXISTS "customer_insert_policy" ON customer FOR anon;
DROP POLICY IF EXISTS "customer_insert_policy" ON customer FOR authenticated;
DROP POLICY IF EXISTS "customer_select" ON customer;
DROP POLICY IF EXISTS "customer_select" ON customer FOR anon;
DROP POLICY IF EXISTS "customer_select_admin" ON customer;
DROP POLICY IF EXISTS "customer_select_own" ON customer;
DROP POLICY IF EXISTS "customer_update" ON customer;
DROP POLICY IF EXISTS "customer_update" ON customer FOR anon;
DROP POLICY IF EXISTS "customer_update_own" ON customer;
DROP POLICY IF EXISTS "customer_update_own_data" ON customer;
DROP POLICY IF EXISTS "customer_update_own_data" ON customer FOR authenticated;

-- vehicle table
DROP POLICY IF EXISTS "Allow read access to all" ON vehicle;
DROP POLICY IF EXISTS "authenticated can delete vehicle" ON vehicle;
DROP POLICY IF EXISTS "authenticated can delete vehicle" ON vehicle FOR authenticated;
DROP POLICY IF EXISTS "authenticated can insert vehicle" ON vehicle;
DROP POLICY IF EXISTS "authenticated can insert vehicle" ON vehicle FOR authenticated;
DROP POLICY IF EXISTS "authenticated can update vehicle" ON vehicle;
DROP POLICY IF EXISTS "authenticated can update vehicle" ON vehicle FOR authenticated;
DROP POLICY IF EXISTS "authenticated can update vehicle status" ON vehicle;
DROP POLICY IF EXISTS "authenticated can update vehicle status" ON vehicle FOR authenticated;
DROP POLICY IF EXISTS "vehicle_delete" ON vehicle;
DROP POLICY IF EXISTS "vehicle_delete" ON vehicle FOR anon;
DROP POLICY IF EXISTS "vehicle_delete_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_insert" ON vehicle;
DROP POLICY IF EXISTS "vehicle_insert" ON vehicle FOR anon;
DROP POLICY IF EXISTS "vehicle_insert_admin" ON vehicle;
DROP POLICY IF EXISTS "vehicle_select_all" ON vehicle;
DROP POLICY IF EXISTS "vehicle_update" ON vehicle;
DROP POLICY IF EXISTS "vehicle_update" ON vehicle FOR anon;
DROP POLICY IF EXISTS "vehicle_update_admin" ON vehicle;

-- booking_hold table
DROP POLICY IF EXISTS "authenticated can delete booking_hold" ON booking_hold;
DROP POLICY IF EXISTS "authenticated can delete booking_hold" ON booking_hold FOR authenticated;
DROP POLICY IF EXISTS "authenticated can insert booking_hold" ON booking_hold;
DROP POLICY IF EXISTS "authenticated can insert booking_hold" ON booking_hold FOR authenticated;
DROP POLICY IF EXISTS "authenticated can select booking_hold" ON booking_hold;
DROP POLICY IF EXISTS "authenticated can select booking_hold" ON booking_hold FOR authenticated;
DROP POLICY IF EXISTS "booking_hold_delete_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_own" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_admin" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_own" ON booking_hold;

-- payment table
DROP POLICY IF EXISTS "Allow all read payment" ON payment;
DROP POLICY IF EXISTS "Allow all read payment" ON payment FOR public;
DROP POLICY IF EXISTS "Allow insert payment" ON payment;
DROP POLICY IF EXISTS "Allow insert payment" ON payment FOR public;
DROP POLICY IF EXISTS "authenticated can insert payment" ON payment;
DROP POLICY IF EXISTS "authenticated can insert payment" ON payment FOR authenticated;
DROP POLICY IF EXISTS "authenticated can select payment" ON payment;
DROP POLICY IF EXISTS "authenticated can select payment" ON payment FOR authenticated;
DROP POLICY IF EXISTS "payment_insert_own" ON payment;
DROP POLICY IF EXISTS "payment_select_admin" ON payment;
DROP POLICY IF EXISTS "payment_select_own" ON payment;
DROP POLICY IF EXISTS "payment_update_admin" ON payment;

-- delivery_return table
DROP POLICY IF EXISTS "Allow all read delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow all read delivery_return" ON delivery_return FOR public;
DROP POLICY IF EXISTS "Allow insert delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow insert delivery_return" ON delivery_return FOR public;
DROP POLICY IF EXISTS "Allow public insert on delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow public read on delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow public update on delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow update delivery_return" ON delivery_return;
DROP POLICY IF EXISTS "Allow update delivery_return" ON delivery_return FOR public;
DROP POLICY IF EXISTS "delivery_return_all_admin" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_delete" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_delete" ON delivery_return FOR anon;
DROP POLICY IF EXISTS "delivery_return_insert" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_insert" ON delivery_return FOR anon;
DROP POLICY IF EXISTS "delivery_return_select" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_select" ON delivery_return FOR anon;
DROP POLICY IF EXISTS "delivery_return_select_customer" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_update" ON delivery_return;
DROP POLICY IF EXISTS "delivery_return_update" ON delivery_return FOR anon;

-- penalty table
DROP POLICY IF EXISTS "Allow all read penalty" ON penalty;
DROP POLICY IF EXISTS "Allow all read penalty" ON penalty FOR public;
DROP POLICY IF EXISTS "Allow insert penalty" ON penalty;
DROP POLICY IF EXISTS "Allow insert penalty" ON penalty FOR public;
DROP POLICY IF EXISTS "penalty_all_admin" ON penalty;
DROP POLICY IF EXISTS "penalty_delete" ON penalty;
DROP POLICY IF EXISTS "penalty_delete" ON penalty FOR anon;
DROP POLICY IF EXISTS "penalty_insert" ON penalty;
DROP POLICY IF EXISTS "penalty_insert" ON penalty FOR anon;
DROP POLICY IF EXISTS "penalty_select" ON penalty;
DROP POLICY IF EXISTS "penalty_select" ON penalty FOR anon;
DROP POLICY IF EXISTS "penalty_select_customer" ON penalty;
DROP POLICY IF EXISTS "penalty_update" ON penalty;
DROP POLICY IF EXISTS "penalty_update" ON penalty FOR anon;

-- ==============================
-- VERIFY: This should return 0 rows
-- ==============================
-- Uncomment to check:
-- SELECT count(*) as remaining_policies FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN
-- ('admin','booking','customer','vehicle','booking_hold','payment','delivery_return','penalty');

-- ==============================
-- RECREATE: Clean policies
-- ==============================

-- customer
CREATE POLICY "customer_select_own" ON customer FOR SELECT
  USING (auth_user_id = auth.uid());
CREATE POLICY "customer_select_admin" ON customer FOR SELECT
  USING (public.is_admin());
CREATE POLICY "customer_update_own" ON customer FOR UPDATE
  USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "customer_insert_own" ON customer FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "customer_insert_admin" ON customer FOR INSERT
  WITH CHECK (public.is_admin());

-- vehicle
CREATE POLICY "vehicle_select_all" ON vehicle FOR SELECT USING (true);
CREATE POLICY "vehicle_insert_admin" ON vehicle FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "vehicle_update_admin" ON vehicle FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "vehicle_delete_admin" ON vehicle FOR DELETE
  USING (public.is_admin());

-- booking
CREATE POLICY "booking_select_own" ON booking FOR SELECT
  USING (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_select_admin" ON booking FOR SELECT
  USING (public.is_admin());
CREATE POLICY "booking_insert_own" ON booking FOR INSERT
  WITH CHECK (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_insert_admin" ON booking FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "booking_update_own" ON booking FOR UPDATE
  USING (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_update_admin" ON booking FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- booking_hold
CREATE POLICY "booking_hold_select_own" ON booking_hold FOR SELECT
  USING (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_hold_insert_own" ON booking_hold FOR INSERT
  WITH CHECK (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_hold_delete_own" ON booking_hold FOR DELETE
  USING (customer_id IN (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid()));
CREATE POLICY "booking_hold_select_admin" ON booking_hold FOR SELECT
  USING (public.is_admin());
CREATE POLICY "booking_hold_insert_admin" ON booking_hold FOR INSERT
  WITH CHECK (public.is_admin());
CREATE POLICY "booking_hold_delete_admin" ON booking_hold FOR DELETE
  USING (public.is_admin());

-- payment
CREATE POLICY "payment_select_own" ON payment FOR SELECT
  USING (booking_id IN (SELECT booking_id FROM booking WHERE customer_id IN
    (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid())));
CREATE POLICY "payment_select_admin" ON payment FOR SELECT
  USING (public.is_admin());
CREATE POLICY "payment_insert_own" ON payment FOR INSERT
  WITH CHECK (booking_id IN (SELECT booking_id FROM booking WHERE customer_id IN
    (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid())));
CREATE POLICY "payment_update_admin" ON payment FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- delivery_return
CREATE POLICY "delivery_return_all_admin" ON delivery_return FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "delivery_return_select_customer" ON delivery_return FOR SELECT
  USING (booking_id IN (SELECT booking_id FROM booking WHERE customer_id IN
    (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid())));

-- penalty
CREATE POLICY "penalty_all_admin" ON penalty FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "penalty_select_customer" ON penalty FOR SELECT
  USING (booking_id IN (SELECT booking_id FROM booking WHERE customer_id IN
    (SELECT customer_id FROM customer WHERE auth_user_id = auth.uid())));

-- admin
CREATE POLICY "admin_select_own" ON admin FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
