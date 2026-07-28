-- =========================================================================
-- SUPERCHARGE NOTIFICATIONS: Enable Realtime and flexible types
-- =========================================================================

-- 1. Remove the strict type constraint to allow various notification types
ALTER TABLE public.admin_notifications DROP CONSTRAINT IF EXISTS admin_notifications_type_check;

-- 2. Add the table to the Supabase Realtime publication
-- This allows the dashboard client to subscribe to inserts instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
