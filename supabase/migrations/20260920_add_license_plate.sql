-- เพิ่มคอลัมน์เลขทะเบียนรถ
ALTER TABLE booking
  ADD COLUMN license_plate TEXT;
