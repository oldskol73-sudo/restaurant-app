# Shared backend plan (InstantDB)

Goal: staff changes (menu, sold out, settings) show up on customers' phones, and customer orders show up live on the staff Orders screen. Today everything is saved per phone in `src/lib/store.tsx`.

## One-time setup (owner does this on their computer — needs a browser login)
1. Create a free account at https://instantdb.com (sign up with email).
2. In the VS Code terminal inside `restaurant-app`, run: `npx instant-cli login` (a browser window opens; approve it).
3. Run: `npx instant-cli init-without-files --title sweet-savor-cafe` — it prints an **app id** and an **admin token**.
4. Put them in a new file `.env` in the project folder (never commit it; `.env` is git-ignored):
   ```
   EXPO_PUBLIC_INSTANT_APP_ID=paste-app-id-here
   INSTANT_APP_ADMIN_TOKEN=paste-admin-token-here
   ```
5. Then ask Claude (in VS Code): "Read docs/BACKEND_PLAN.md and set up InstantDB."

## Work for Claude after login
1. `npx expo install @instantdb/react-native @react-native-community/netinfo react-native-get-random-values` and import `react-native-get-random-values` first in `src/app/_layout.tsx`.
2. Create `instant.schema.ts` / `instant.perms.ts`; `npx instant-cli push schema --yes`, then `push perms --yes`.
3. Replace the data layer in `src/lib/store.tsx` with InstantDB queries and transactions (keep the same `useStore()` shape so screens barely change). Keep cart, bag, favorites and staff login local.
4. Seed the database once from `restaurant.config.ts` (menu + settings) and `store.config.ts` stays a file.
5. Test: two browser windows / two phones — place an order on one, see it appear (with chime) on the other; mark sold out on one, see it on the other.

## Draft data model
- `menuItems`: name, description, price, category (indexed), photo (use Instant Storage `$files` link for uploaded photos — not URL strings), badge, saleLabel, wasPrice, soldOut, isAddOn, optionGroupIds (json), pairings (json), sortOrder.
- `orders`: number (indexed), name, phone, lines (json), subtotal, discount, tax, total, payment, paid, notify, status (indexed), createdAt (indexed), readyAt, rewardUsed, alertSeen, deviceId (indexed, for "my orders" on guest phones), userId.
- `settings`: single record (`key: 'main'`): name, tagline, hours, taxRatePercent, accent, wine, paused, rewards, PIN hashes.
- `$users` for signed-in customers (favorites, rewards, past orders, Order Again).

## Security decision needed (important)
PINs checked inside the app cannot protect the database: anyone who can run the app could write to it. To really lock menu/settings/sales to staff, staff must sign in with InstantDB auth (email magic code) and permissions check a `role` on their user (`staff` or `manager`). Customers create orders but can only read their own. Plan: keep the friendly PIN pad on the phone for quick unlocking after a one-time staff email sign-in.
