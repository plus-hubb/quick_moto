-- เพิ่มข้อมูลผู้โอนและธนาคารในตาราง payment
ALTER TABLE payment
  ADD COLUMN IF NOT EXISTS transfer_name text,
  ADD COLUMN IF NOT EXISTS bank_name text;