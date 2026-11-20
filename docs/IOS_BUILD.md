# Building the iPhone app on a Mac (Xcode)

Everything is already set up in the project: app ID `org.israelunite.sweetsavorcafe`, name "Sweet Savor Cafe", app icon and splash, push-notification entitlement, and the shared-database settings. You do NOT edit any code. The `ios/` folder is generated for you (it is not stored in GitHub).

## 1. One-time Mac setup
1. **Xcode:** App Store → search "Xcode" → Get (large download, ~15 GB). Open it once, click **Agree**, and let it install extra components. If asked, also install the **iOS** platform/simulator.
2. **Command line tools:** open **Terminal** (Cmd+Space, type Terminal) and run: `xcode-select --install` (if it says already installed, fine).
3. **Node.js:** https://nodejs.org → download the **LTS** installer → open → Continue until done.
4. **Git:** in Terminal run `git --version`. If a box offers to install, click **Install**.
5. **CocoaPods** (installs iPhone libraries): easiest with Homebrew. Install Homebrew from https://brew.sh (copy its one command into Terminal), then run: `brew install cocoapods`

## 2. Get the project
In Terminal:
```
git clone https://github.com/oldskol73-sudo/restaurant-app
cd restaurant-app
npm install
```
Later, to get updates: `cd restaurant-app`, `git pull`, `npm install`.

## 3A. Fastest: run in the iPhone Simulator
```
npx expo run:ios
```
It builds the app (first time takes several minutes) and opens the Simulator with the app running. Edits you save later refresh automatically.

## 3B. Open it in Xcode (to put it on your own iPhone)
1. In Terminal, inside `restaurant-app`: `npx expo prebuild --platform ios`
2. Open the project **workspace** (the white icon, NOT the blue one):
   ```
   open ios/SweetSavorCafe.xcworkspace
   ```
3. In Xcode's left list click the top item **SweetSavorCafe**, then the **SweetSavorCafe** target, then the **Signing & Capabilities** tab.
4. **Team:** click the dropdown → **Add an Account…** → sign in with your Apple ID, then choose your name as the Team. Leave **Automatically manage signing** ticked.
5. **Bundle Identifier** should read `org.israelunite.sweetsavorcafe`. If Xcode says it is not available, add a word to the end, for example `org.israelunite.sweetsavorcafe2`.
6. **Push Notifications:** if you use a FREE Apple ID, Xcode shows "Personal development teams do not support the Push Notifications capability". Click the small **−** next to **Push Notifications** to remove it for testing (alerts then won't work on that build; the in-app banner still does). A paid Apple Developer account (see 5) keeps it.
7. **Your iPhone:** plug it in with USB. On the iPhone: tap **Trust** when asked, then Settings → Privacy & Security → **Developer Mode** → on → restart.
8. At the top of Xcode choose your iPhone (next to the ▶ button), then press **▶ (Run)**.
9. First launch only: on the iPhone go to Settings → General → **VPN & Device Management** → your Apple ID → **Trust**.
10. Free Apple ID apps stop opening after 7 days; just press ▶ again.

To run it without needing the computer's development server, change Xcode's Product → Scheme → **Edit Scheme… → Run → Build Configuration → Release**.

## 4. Push alerts on iPhone
- Needs a paid Apple Developer account (5).
- Expo's push service needs Apple's push key. Easiest: in Terminal run `npx eas-cli credentials`, choose **iOS** and set up the **Push Notifications** key (it asks you to sign in to your Apple Developer account and does the rest).
- The Expo project id is already in `app.json`.

## 5. Putting it on the App Store / TestFlight
1. Join the **Apple Developer Program** (https://developer.apple.com/programs, $99/year).
2. In **App Store Connect** (appstoreconnect.apple.com) → Apps → **+** → New App. Use bundle ID `org.israelunite.sweetsavorcafe` (or your changed one), name "Sweet Savor Cafe".
3. In Xcode choose **Any iOS Device** as the target, then menu **Product → Archive**. When it finishes click **Distribute App → App Store Connect → Upload**.
4. Back in App Store Connect, open **TestFlight** to test with friends, or fill in the store page (screenshots, description, privacy policy web address) and **Submit for Review**.
Alternative without Xcode archiving: `npx eas-cli build --platform ios --profile production` then `npx eas-cli submit --platform ios`.

## Before you submit to the App Store
- Change the app ID from the `org.israelunite…` placeholder if the business has its own domain, and then re-run `npx expo prebuild --platform ios --clean`.
- Replace placeholder food photos, address, hours and menu.
- PayPal is still a demo sheet; Apple also requires a privacy policy web address.
- The Store tab links out to the website for purchases.

## If something goes wrong
- "No such module" / red errors in Xcode → you opened the blue project icon; close it and open `ios/SweetSavorCafe.xcworkspace`.
- Pod errors → `cd ios`, then `pod install --repo-update`, then `cd ..`.
- Odd leftovers → Xcode menu **Product → Clean Build Folder** (Shift+Cmd+K), or in Terminal `npx expo prebuild --platform ios --clean`.
- Still stuck → copy the red error text into a Claude session in the project folder.
