-- HoodDo MVP – Supabase Schema
-- Run this in the Supabase SQL Editor

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  time_option      TEXT NOT NULL CHECK (time_option IN ('עכשיו', 'היום', 'מחר')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 5 AND duration_minutes <= 120),
  reward_ils       INTEGER NOT NULL DEFAULT 0,
  display_name     TEXT NOT NULL,
  phone            TEXT NOT NULL,
  location_source  TEXT NOT NULL DEFAULT 'manual' CHECK (location_source IN ('gps', 'manual')),
  address_text     TEXT,
  lat              NUMERIC,
  lng              NUMERIC,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for feed ordering
CREATE INDEX IF NOT EXISTS tasks_created_at_desc ON public.tasks (created_at DESC);

-- Index for active tasks
CREATE INDEX IF NOT EXISTS tasks_is_active ON public.tasks (is_active);

-- Enable public read/write for MVP (no auth)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active tasks
CREATE POLICY "read active tasks"
  ON public.tasks FOR SELECT
  USING (true);

-- Allow anyone to insert tasks
CREATE POLICY "insert tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update tasks (needed for close task)
CREATE POLICY "update tasks"
  ON public.tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- ============================================================
-- SEED DATA – example tasks near Rabin Square (for testing)
-- ============================================================

INSERT INTO public.tasks (title, time_option, duration_minutes, reward_ils, display_name, phone, location_source, address_text, lat, lng) VALUES
(
  'טיול קצר עם הכלב בגן דובנוב',
  'היום', 30, 20, 'מיכל',
  '972501234567',
  'manual', 'גן דובנוב, תל אביב',
  32.0808, 34.7802
),
(
  'השקיית עציצים על המרפסת – יוצא לשבוע',
  'עכשיו', 15, 10, 'יובל',
  '972521234568',
  'manual', 'שדרות שאול המלך 18',
  32.0815, 34.7810
),
(
  'עזרה בהגדרת אייפון חדש',
  'היום', 45, 40, 'רחל',
  '972531234569',
  'manual', 'כיכר רבין, תל אביב',
  32.0809, 34.7806
),
(
  'קיפול וסידור כביסה לאחר כביסה',
  'מחר', 30, 20, 'אורן',
  '972541234570',
  'manual', 'רחוב פין 5, תל אביב',
  32.0820, 34.7795
),
(
  'תליית מדף קטן בחדר ילדים',
  'מחר', 60, 40, 'שירי',
  '972551234571',
  'manual', 'שדרות נורדאו 22, תל אביב',
  32.0800, 34.7812
);
