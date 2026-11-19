# Shared backend plan (Supabase)

InstantDB was the first choice but it is shutting down and no longer creates new apps, so we use **Supabase**
(project: https://poyofvyolqsqfdjhjncv.supabase.co).

Goal: staff changes (menu, sold out, settings) show up on customers' phones, and customer orders show up live on the staff Orders screen.

## One-time setup (owner, in the Supabase dashboard)
1. SQL Editor → New query → paste all of `supabase/schema.sql` → Run.
2. Authentication → Users → Add user → create the shared **staff login** (email + password). Untick "auto confirm" only if you want email confirmation.
3. Project Settings → API → copy the **anon / publishable** key (safe to share; never share the `service_role` key).
4. Copy `.env.example` to `.env` and paste the key. `.env` is git-ignored.

## How it works (design)
- Customers (no sign-in) read the menu and settings, place orders with `place_order()`, and follow their order with `get_order()` (polled every few seconds). They cannot read the orders table.
- Staff sign in once with the staff email/password (Supabase Auth); the PIN pad is then just a quick unlock on that phone. Signed-in staff can edit menu/settings and see/update all orders, live via Realtime.
- PIN codes and the Sales passcode stay on the staff phone, not in the shared database.
- If the keys are missing the app runs in local demo mode (as today).

## Work for Claude after the key is available
Add `@supabase/supabase-js`, a `src/lib/backend.ts`, and switch `src/lib/store.tsx` menu/settings/orders to Supabase with Realtime; staff-login gets the one-time email sign-in; seed `menu_items` from `restaurant.config.ts`; test with two windows.
