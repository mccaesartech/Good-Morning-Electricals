-- Add rejected status for enrolment applications
ALTER TYPE enrolment_status ADD VALUE IF NOT EXISTS 'rejected';
