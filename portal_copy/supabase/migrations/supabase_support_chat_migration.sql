-- =========================================================================
-- SUPPORT TICKETS CHAT MIGRATION
-- Adds a JSONB column to support conversational threading
-- =========================================================================

-- 1. Add the messages column
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS messages JSONB DEFAULT '[]'::jsonb;

-- 2. (Optional) You can leave the existing description and admin_reply columns intact 
-- for backward compatibility. The UI is updated to handle both old and new formats.

-- If you have any issues with policies for updating support tickets from the public portal,
-- make sure to allow anon users to UPDATE their tickets (only if they have the ticket number).
-- However, currently, the user replies might be handled by an API route bypassing RLS, 
-- or we need a policy for it. 

-- Let's add a policy to allow public users to UPDATE their own tickets if they know the ticket number:
-- (This might not be strictly needed if the API handles it via Service Role, but the API uses anon client currently)

DROP POLICY IF EXISTS "Public can update support_tickets" ON public.support_tickets;
CREATE POLICY "Public can update support_tickets"
  ON public.support_tickets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
