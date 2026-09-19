-- เพิ่มคอลัม cancel_note ในตาราง booking สำหรับเก็บหมายเหตุตอนยกเลิก
ALTER TABLE booking
ADD COLUMN IF NOT EXISTS cancel_note text DEFAULT null;
