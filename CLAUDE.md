# Project notes for Claude

**Owner is not a programmer.** Explain every step in plain language and say exactly what to click, copy or install. Build fully, then let them review and ask for edits.

Also read `AGENTS.md` (Expo rules: use `npx expo install`, check docs for the installed SDK, run `npx tsc --noEmit` before finishing).

## What this is
A React Native + Expo (SDK 58, Expo Router) app for iPhone and Android.
- **Front page = the iuic.dc Store** (`src/app/index.tsx`), built from https://iuicdc.company.site/products. Data lives in `store.config.ts` (6 sections, products, shopping bag). Purchases are completed on the website (payment stays there).
- **Sweet Savor Cafe** (the DC Kitchen) is a pickup-only ordering area reached from the "Sweet Savor Cafe" tile (`src/app/kitchen.tsx`, then `(tabs)` menu/cart/rewards/account, checkout, order status).
- **Staff area** (PIN `1234`, set in `restaurant.config.ts`): Orders, Menu Manager, Settings, Sales (`src/app/(staff)/`). The **Sales** tab has its own passcode `5678` (`salesPin`), asked every time it opens (`PinPad` component). Design notes and what was added beyond the original plan: `docs/DESIGN.md`.
- Payments: PayPal or cash at pickup only. No credit cards. No delivery, no scheduled pickup times.

## One settings file per area
- `restaurant.config.ts` — kitchen name, logo letters, hours, address, tax, rewards, colors, hero text, full menu.
- `store.config.ts` — store name, sections, products, images.
Do not hard-code restaurant details elsewhere.

## Look and feel (follow the user's reference image)
Black background (`#0A0A0A`), bright orange accent (`#FF9F1C`), warm white text, brick-red (`#C2362B`) for sale tags and "Unpaid". Anton for headlines, Inter for body. Rounded pill buttons, orange-outlined cards, **round plate photos with an orange ring and glow** (`PlateHero`), orange stat bar (`StatBar`), small outlined nav pills (`NavPill`). Shared pieces are in `src/components/ui.tsx`; colors come from `useColors()` (never hard-code).

## State and shared database (Supabase)
- Project: https://poyofvyolqsqfdjhjncv.supabase.co. URL + publishable key are in `restaurant.config.ts` (`backend`) — public by design; never commit a `service_role`/secret key. Empty values = local demo mode.
- Local state (cart, bag, favorites, account, PINs) is in `src/lib/store.tsx`, saved on the phone. Shared data (menu, settings, orders) syncs through `src/lib/sync.ts` + `src/lib/backend.ts`.
- Database setup and security rules: `supabase/schema.sql` (re-runnable). Customers read menu/settings and place orders through functions (`place_order`, `get_order`, `mark_alert_seen`); they cannot read the orders table. Only emails in `staff_emails` (checked by `is_staff()`) can edit menu/settings or see all orders. Staff do a one-time email+password sign-in (`src/app/staff-account.tsx`); the PIN pad is a quick unlock; PINs are NOT stored in the database.
- InstantDB was dropped (it is shutting down and no longer creates apps). Plan/history: `docs/BACKEND_PLAN.md`.
- Still to do: push notifications, automatic texts (e.g. Twilio), real PayPal, photo uploads to Supabase Storage.

## Known placeholders
- Food photos are Unsplash links; store graphics are the website's own images. Owner will supply real artwork later (replace `photo`/`image` addresses).
- PayPal is a demo sheet (`PayPalSheet` in `src/app/checkout.tsx`); no real money moves.
- Kitchen address, hours, sample menu and sample sales are placeholders.
- Descriptions for the Kitchen, Local School Events and Alms sections in `store.config.ts` were written by Claude (the website had none). Kids Plate Donation price ($5) was inferred.

## Running it
`npm install`, then `npx expo start` (press `a` for Android emulator, `i` for iPhone simulator, `w` for web). `npx tsc --noEmit` must pass.

## Git
Repo: https://github.com/oldskol73-sudo/restaurant-app, branch `main`. Do not create pull requests unless asked.
