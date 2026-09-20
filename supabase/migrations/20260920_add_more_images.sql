-- เพิ่มคอลัมน์รูปภาพเพิ่มเติม (รูปที่ 4-5)
ALTER TABLE delivery_return
  ADD COLUMN IF NOT EXISTS image_delivery_4 text,
  ADD COLUMN IF NOT EXISTS image_delivery_5 text,
  ADD COLUMN IF NOT EXISTS image_return_4 text,
  ADD COLUMN IF NOT EXISTS image_return_5 text;
