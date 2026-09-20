-- เปลี่ยน helmet_delivery, helmet_return จาก boolean เป็น integer (จำนวนหมวก)
UPDATE delivery_return SET helmet_delivery = TRUE WHERE helmet_delivery = TRUE;
UPDATE delivery_return SET helmet_return = TRUE WHERE helmet_return = TRUE;

ALTER TABLE delivery_return
  ALTER COLUMN helmet_delivery DROP DEFAULT,
  ALTER COLUMN helmet_delivery TYPE integer USING CASE WHEN helmet_delivery THEN 1 ELSE 0 END,
  ALTER COLUMN helmet_delivery SET DEFAULT 0;

ALTER TABLE delivery_return
  ALTER COLUMN helmet_return DROP DEFAULT,
  ALTER COLUMN helmet_return TYPE integer USING CASE WHEN helmet_return THEN 1 ELSE 0 END,
  ALTER COLUMN helmet_return SET DEFAULT 0;
