-- Fix RLS policies for booking_hold table
-- Admin walk-in uses localStorage auth, not Supabase auth, so requests are anonymous
-- We need to allow both authenticated and anon roles to INSERT/SELECT/DELETE

-- Enable RLS (idempotent)
ALTER TABLE booking_hold ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "booking_hold_insert_auth" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_insert_anon" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_select_all" ON booking_hold;
DROP POLICY IF EXISTS "booking_hold_delete_all" ON booking_hold;

-- Allow authenticated users to insert (customer booking flow)
CREATE POLICY "booking_hold_insert_auth"
  ON booking_hold
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anon to insert (admin walk-in flow - uses localStorage auth)
CREATE POLICY "booking_hold_insert_anon"
  ON booking_hold
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow everyone to read booking_hold (needed to check availability and read back holds)
CREATE POLICY "booking_hold_select_all"
  ON booking_hold
  FOR SELECT
  USING (true);

-- Allow everyone to delete booking_hold (needed for releaseHold)
CREATE POLICY "booking_hold_delete_all"
  ON booking_hold
  FOR DELETE
  USING (true);
