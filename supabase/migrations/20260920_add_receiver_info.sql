-- เพิ่มคอลัมน์ข้อมูลผู้รับรถ (กรณีคนมารับรถไม่ใช่คนจอง)
ALTER TABLE delivery_return
  ADD COLUMN IF NOT EXISTS receiver_name text,
  ADD COLUMN IF NOT EXISTS receiver_phone text;
