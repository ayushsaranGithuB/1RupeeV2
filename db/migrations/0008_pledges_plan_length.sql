-- Add plan_length_months and updated_at to pledges table
ALTER TABLE pledges ADD COLUMN plan_length_months INTEGER NOT NULL DEFAULT 1;
ALTER TABLE pledges ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
