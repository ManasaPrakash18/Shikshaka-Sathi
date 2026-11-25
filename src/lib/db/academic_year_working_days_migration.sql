-- Store annual school working-day totals without overwriting previous years.
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS working_days_by_year JSONB NOT NULL DEFAULT '{}'::jsonb;
