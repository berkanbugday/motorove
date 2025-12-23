# Supabase Layout Changes

Track manual changes made to the Supabase dashboard configuration here (Storage buckets, Auth settings, Edge Functions, etc).

## [Initial Setup]

### Authentication
- Enabled Email/Password provider
- Disable "Confirm email" for development if desired

### Storage
- Created bucket: `motorove` (Public)
- Policy: `Select` allowed for `public` role (Enable read access)
- Policy: `Insert` allowed for authenticated users only

### Database
- Extensions enabled:
    - `postgis` (for location features)
    - `pg_cron` (for scheduled jobs if needed)
