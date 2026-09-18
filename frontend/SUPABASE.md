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
| Confirm email | If enabled, signup sends a **confirmation link**. After they click it, in-progress checkout/booking is restored. |

Redirect after login uses the **role stored on `profiles`**, unless a saved checkout/booking is waiting.

### Confirmation email links

Signup sets `emailRedirectTo` to `{current site origin}/auth/callback`, so the link matches the site the user signed up on (not the dashboard Site URL).

In **Supabase → Authentication → URL Configuration**:

1. Set **Site URL** to the live site (`https://www.your-domain.com`), not localhost.
2. Add these **Redirect URLs**:
   - `https://www.your-domain.com/auth/callback`
   - `https://www.your-domain.com/**`
   - `http://localhost:3000/auth/callback` (local testing)

Keep **Confirm email** on under Authentication → Providers → Email.

If someone starts checkout or a tour booking and then confirms from email, Settlla reopens payment (or the tenant dashboard for a tour) so they can finish.

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
