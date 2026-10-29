# Admin Panel Security Remediation Notes

## Scope and safety
- Changes in this branch are limited to `admin_panel/`.
- No production database, Storage, Auth, or deployment changes were applied.
- The SQL file under `supabase/migrations/` is a proposed migration only. Review it on a disposable/staging Supabase project and take a verified backup before any production use.
- This remediation is not a guarantee that the application is completely secure; the remaining items below must be completed and verified.

## Code changes in this branch
- Added `src/lib/supabase/authorization.ts`: server-side session verification and allowlisting against `admin_profiles`; supports Super Admin-only routes.
- Applied the authorization helper to privileged management APIs, including batch, intern, employee, payment, interview, document, project, invoice, proposal, support, settings, feedback, testimonial, waitlist, audit-log, task, analysis, and dashboard routes.
- Hardened document storage endpoints so they verify an administrator before service-role reads/writes and derive the audit/signature identity from the verified session rather than the submitted `adminEmail`.
- Made admin signup fail closed when settings are missing/unavailable and made signup-status report closed on errors.
- Disabled the unauthenticated debug data endpoint.
- Restricted the settings upload endpoint to administrator-only PNG/JPEG/WebP uploads, bounded to 2 MiB, with signature checks and a fixed public-asset bucket.
- Removed the release workflow that tried to run a missing test script and publish the private app to npm; added lint/build/dependency-audit CI.
- Removed tracked candidate CSV exports and added ignore rules. **Deleting files in this branch does not erase copies from earlier Git commits.** Review repository access and consider history rewriting/credential rotation if exposure requires it.
- Changed the Supabase diagnostic script so it does not print secrets or enumerate production auth users.

## Proposed database migration
`supabase/migrations/20261029_security_hardening.sql`:
- Restricts profile updates so browser roles cannot update `is_super_admin`.
- Replaces broad policies on support tickets and document verifications with constrained public ticket insertion and administrator-only access to private records.
- Removes direct browser access to intern-project submissions and adds administrator-only policies.
- Sets fixed search paths and narrows execution grants for existing SECURITY DEFINER functions.

**Important compatibility gate:** the migration deliberately warns that it must not be applied until the Internship Portal's project submission flow is moved behind a server-side endpoint. Direct public project inserts will be blocked. Storage buckets are not made private in this migration because other apps currently consume stored document URLs; those consumers must be migrated to short-lived signed URLs first. Enable Supabase Auth leaked-password protection in the Supabase project settings.

## Verification status
- Changes were committed to `gpt-6/working`, not `main`.
- This environment did not run `npm ci`, lint, build, automated authorization tests, or a staging migration. The added GitHub Actions workflow is intended to run lint/build/audit when the PR is opened.
- Review CI output before merge. Add regression tests for anonymous, normal authenticated, admin, and Super Admin callers before considering the work complete.
- The repository's earlier commits still contain the removed CSV files; a normal PR deletion is not a history purge.
