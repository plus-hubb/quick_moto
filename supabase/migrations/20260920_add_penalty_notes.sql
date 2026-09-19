-- เพิ่มคอลัมน์หมายเหตุสำหรับค่าปรับแต่ละประเภท
ALTER TABLE penalty
  ADD COLUMN damage_note TEXT,
  ADD COLUMN late_note TEXT,
  ADD COLUMN missing_item_note TEXT;
