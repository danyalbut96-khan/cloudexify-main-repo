-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  intern_id uuid REFERENCES public.interns(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  batch_name text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policy for public read (only approved)
CREATE POLICY "Allow public read access for approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (status = 'approved');

-- Create policy for admin read all
CREATE POLICY "Allow admin full access to testimonials"
  ON public.testimonials
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE admin_id = auth.uid()
  ));

-- Note: Inserting is done via API using Service Role Key, so no insert policy is needed for anon/authenticated unless we want direct client inserts.
