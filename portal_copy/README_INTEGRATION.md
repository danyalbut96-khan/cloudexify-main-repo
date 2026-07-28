# CloudExify Student Portal Migration Guide

This folder (`portal_copy`) contains all the necessary files to migrate the Student Portal to the new `internship.cloudexify.site` repository.

## Steps to Integrate:

1. **Copy Files to New Repository:**
   Copy the `src` folder from this directory and merge it with the `src` folder in your new Next.js repository.
   - `src/app/portal` -> Goes into `src/app/portal`
   - `src/app/api/portal` -> Goes into `src/app/api/portal`
   - `src/components` -> Merge with your new `src/components`
   - `src/lib` -> Merge with your new `src/lib`

2. **Environment Variables:**
   Make sure the following variables are present in your `.env.local` file in the new repository. They must match the ones used in the admin panel.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=fallback_secret_cloudexify_12345
   ```

3. **Install Missing Dependencies:**
   Ensure your new repository has the following packages installed (if they aren't already):
   ```bash
   npm install @supabase/supabase-js @supabase/ssr jose lucide-react react-hot-toast clsx tailwind-merge framer-motion
   ```

4. **Integration with Existing Pages:**
   - Link to the Student Portal from your new site's Navbar or Hero section: `<Link href="/portal/login">Student Login</Link>`
   - You can link the "Apply Now" buttons to: `<Link href="/portal/register">Apply Now</Link>`

Once tested and confirmed working on the new domain, you can safely delete `src/app/portal` and `src/app/api/portal` from the Admin Repository!

5. **Configuration Files:**
   I have included important root configuration files in this `portal_copy` folder so you can see the dependencies and build configurations required for the portal to work flawlessly:
   - `package.json`: Contains all the dependencies (copy the required ones to your new project).
   - `vercel.json`: Vercel configuration (for cron jobs or deployment settings).
   - `tailwind.config.ts` & `postcss.config.mjs`: Styling configuration.
   - `.env.local`: Has the environment variables used here. (Make sure you add these to your new repo's environment settings).

6. **Additional Required Files (Just Added):**
   - `public/`: Contains logo.png which is used in the portal layouts.
   - `src/hooks/`: Custom hooks used across the app.
   - `src/app/globals.css` & `src/app/layout.tsx`: These contain the root styling and the Toaster component which makes the toast notifications work in the portal.
   - `src/app/api/batches` & `src/app/api/support`: These APIs are also called by the student portal frontend, so they have been included.
