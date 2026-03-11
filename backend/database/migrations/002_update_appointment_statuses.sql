-- Migration: Update appointment statuses to match frontend expectations
-- SQL Server version
-- Run this after updating the code

-- Drop existing constraint if exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'appointments_status_check')
BEGIN
    ALTER TABLE appointments DROP CONSTRAINT appointments_status_check;
END

-- Add new CHECK constraint for appointments
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('PENDING', 'ARRIVED', 'VISITED', 'MISSED', 'COMPLETED', 'DONE', 'CANCELLED'));

-- Migrate existing data
UPDATE appointments SET status = 'PENDING' WHERE status = 'BOOKED';
UPDATE appointments SET status = 'MISSED' WHERE status = 'NOT_VISITED';

-- Update default value
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'PENDING';
