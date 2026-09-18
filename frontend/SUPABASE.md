# Supabase setup (Settlla frontend)

1. Create a project at [supabase.com](https://supabase.com).
2. Put credentials in `frontend/.env` or `frontend/.env.local`. Newer dashboards show a **publishable** key (`sb_publishable_…`); older ones show a JWT **anon** key. Either works:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
# or:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

Restart `npm run dev` after changing env files.

3. In the Supabase SQL editor, run **both** migrations in order:

- `supabase/migrations/001_settlla_schema.sql`
- `supabase/migrations/002_agent_access_and_seed.sql`

`002` adds agent read access, listing seed RPC, and booking cancel policy. Without it the homepage cannot bootstrap listings.

## Auth (email + password)

| Setting | Notes |
|---------|--------|
| Password minimum | **6 characters** |
| Confirm email | If enabled, signup shows “check your email” before login |

Redirect after login uses the **role stored on `profiles`**.

### Confirmation email links

Signup passes `emailRedirectTo` as `{NEXT_PUBLIC_SITE_URL or current origin}/auth/callback`. If that env var is missing, Supabase falls back to the dashboard **Site URL**, which defaults to `http://localhost:3000`.

In **Supabase → Authentication → URL Configuration**:

1. Set **Site URL** to the live site (`https://www.your-domain.com`), not localhost.
2. Add these **Redirect URLs**:
   - `https://www.your-domain.com/auth/callback`
   - `https://www.your-domain.com/**`
   - `http://localhost:3000/auth/callback` (local testing)

In **Vercel** (or `frontend/.env`), set:

```env
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com
```

Restart the app after changing env vars. Existing emails already sent still contain the old localhost link; sign up again to get a new one.

## What connects to Supabase

| Feature | Table(s) |
|---------|----------|
| Auth (login/signup) | `auth.users` + `profiles` |
| Listings feed | `listings` (seeded once via `seed_listings_if_empty`) |
| Tenancy agreements | `agreements` |
| E-signatures | `agreements.document` |
| Walkthrough bookings | `bookings` |
| Tenant / agent dashboards | `tenant_rentals`, `bookings`, `agreements` |
| Checkout record (gateway still simulated) | `payment_transactions` + `tenant_rentals` |

**Payment UI is still simulated** (no Paystack/Monnify charge). A successful checkout still writes the transaction and rental snapshot to Supabase.

Without env vars, the app uses seed listings and localStorage demo auth only.
