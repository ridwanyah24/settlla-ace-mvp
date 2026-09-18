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
| Confirm email | If enabled, signup asks for a **6-digit code** from the email — not a link |

Redirect after login uses the **role stored on `profiles`**.

### Confirmation email code (required)

Signup no longer uses `emailRedirectTo`, so confirmation does not depend on the dashboard **Site URL**. Users type the OTP in the app.

In **Supabase → Authentication → Email Templates → Confirm signup**, the body **must include** `{{ .Token }}`. Example:

```html
<h2>Confirm your Settlla account</h2>
<p>Your verification code is:</p>
<p style="font-size:24px;letter-spacing:4px;font-weight:700">{{ .Token }}</p>
<p>Enter this code in Settlla. You can ignore any confirmation link.</p>
```

Also keep **Confirm email** turned on under Authentication → Providers → Email.

Leave **Redirect URLs** in place only for old emails that still contain a link. `/auth/callback` still exchanges those. New signups use the in-app code.

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
