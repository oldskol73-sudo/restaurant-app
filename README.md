# Sweet Savor Cafe — Restaurant Ordering App (template)

A pickup-only ordering app for iPhone and Android, built with React Native + Expo.
Customers browse, order and pay (PayPal or cash at pickup); staff manage orders, the menu, settings and sales.

## See it on your phone (about 10 minutes)

1. **Install Node.js** (the engine that runs the app): go to https://nodejs.org, click the big green **LTS** button, open the file and click Next until it finishes.
2. **Install "Expo Go" on your phone** — search **Expo Go** in the App Store (iPhone) or Google Play (Android).
3. **Get this folder** on your computer (download the repository from GitHub, or `git clone` it) and open the `restaurant-app` folder.
4. **Open a terminal in that folder**
   - Windows: open the folder, click the address bar, type `cmd`, press Enter.
   - Mac: right-click the folder → *New Terminal at Folder*.
5. Type this and press Enter (one time only, takes a few minutes):
   ```
   npm install
   ```
6. Type this and press Enter:
   ```
   npx expo start
   ```
   A **QR code** appears in the terminal.
7. **Scan the QR code**
   - iPhone: open the normal Camera app, point it at the QR code, tap the banner.
   - Android: open Expo Go, tap *Scan QR code*.
   Your phone and computer must be on the **same Wi-Fi**. If it won't connect, stop with `Ctrl + C` and run `npx expo start --tunnel` instead.

To see it in a web browser instead: run `npx expo start --web`.

## Try the whole flow
1. Welcome → **Start Order** → tap a dish → add sides/extras → **Add to Order**.
2. Open **Order** tab → **Continue to Checkout** → choose *Pay Cash at Pickup* (or PayPal demo) → place the order.
3. On the order screen tap **Staff view** (or the small *Restaurant staff* link on the Welcome screen). **Staff PIN: 1234** (the Sales tab asks for a second passcode, **5678**).
4. In **Orders**: *Start preparing* → *Ready · notify customer*. Cash orders show a wine-red **UNPAID** bar. Use *Send a test order* to hear the new-order chime.
5. Go back to the customer side — the alert banner and the "Ready for Pickup" step appear.

## The front page (Store)
The app opens on the **Store** front page, built from https://iuicdc.company.site/products. Everything on it is in **`store.config.ts`**: the six sections (DC School Store, DC Kitchen, Local School Events, Alms, Traveling Prophets Support, Fundraisers) and the products inside them. The **DC Kitchen** tile opens the restaurant ordering area. Graphics are the website's own images for now; replace the `image` addresses when new artwork is ready.

## Swapping in another restaurant
Open **`restaurant.config.ts`** — it is the one settings file. Change the name, logo letters, address, hours, tax rate, rewards rules, colors and the whole menu (meal names, prices, photos, which sides/extras pair with each meal). Save, and the app reloads. Owners can also change most of it in the app: *Staff → Settings* and *Staff → Menu*.
Tip: after changing the file, in the app go to *Staff → Settings → Reset to defaults* so the phone picks up the new file (the phone remembers earlier edits).

## What is a demo right now (and what to connect to go live)
| Piece | Today | To go live |
|---|---|---|
| Orders & menu | Saved **on the phone it's used on**. Customer and staff must use the same phone to see each other's changes. | Connect an online database so many phones share live orders. This is the one required step before real customers use it. |
| PayPal | A realistic **demo PayPal sheet** (no money moves). | Put your PayPal *Client ID* in `restaurant.config.ts` and replace the body of `PayPalSheet` in `src/app/checkout.tsx` with PayPal's checkout. |
| "Ready" text message | Opens the staff phone's Messages app with the text pre-written to the customer. | Add a text service (e.g. Twilio) on a server for fully automatic texts. |
| App alert | In-app banner on the customer's phone. | Add push notifications (needs the online database above). |
| Photos | Free stock photos from Unsplash (web addresses). Staff can also choose photos from the phone. | Replace with your own food photos. |

## Files
- `restaurant.config.ts` — all restaurant details & menu
- `src/app/` — every screen (Welcome, Menu, Meal, Cart, Checkout, Order status, Account, Rewards; staff: Orders, Menu Manager, Sales, Settings)
- `src/lib/store.tsx` — where data lives (swap this for an online database later)
- `src/components/ui.tsx` — shared look & feel

## iPhone / Xcode build
See **docs/IOS_BUILD.md** for step-by-step Mac instructions (Simulator, your own iPhone, TestFlight/App Store).

## Order-ready alerts (push notifications)
**What it does:** when staff tap **Ready**, the customer's phone gets a notification, even if the app is closed. (If the app is open, the in-app banner appears either way.) The customer is asked for permission when they place an order with "App alert" or "Both".

**One-time setup**
1. Supabase → SQL Editor → run the latest `supabase/schema.sql` again (it adds a column for the phone's alert address).
2. Make a free account at https://expo.dev.
3. In the VS Code terminal, inside `restaurant-app`: `npx eas-cli login`, then `npx eas-cli init` (say yes to creating the project). This writes a project id into `app.json`, which push needs.
4. **Testing:** iPhone — works inside Expo Go once step 3 is done. Android — Expo Go cannot receive push; make a development build: `npx eas-cli build:configure`, then `npx eas-cli build --profile development --platform android`, and install the file it gives you. (iPhone development builds need a paid Apple Developer account; Expo Go avoids that for testing.)
5. **Decision (Nov 2026): Android lock-screen alerts are on hold.** Android phones in Expo Go use the in-app alert only. To add Android push later: create a free Firebase project, put `google-services.json` in this folder (it is picked up automatically by `app.config.js`), upload the Firebase service-account key at expo.dev → project → Credentials, then `npx eas-cli build --platform android --profile preview`. `eas.json` is already set up.
6. Texts (SMS) are not built yet.

If push is not set up, nothing breaks: the order still works and the in-app alert still shows.
