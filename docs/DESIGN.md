# Design notes — Sweet Savor Cafe app inside the iuic.dc Store

Source: the original "Restaurant App – Screen-by-Screen Plan" plus decisions made while building. Items marked **(added)** were not in the original plan.

## How people get to each area
| Who | Starts at | Gets to |
|---|---|---|
| Anyone | **Store** front page (added) | Six store sections, products, shopping bag; **Kitchen** button / Sweet Savor Cafe tile |
| Customer (guest or signed in) | **Kitchen** (the cafe's Welcome screen) | Start Order → Menu → Meal → Cart → Checkout → Order Status; Account; Rewards |
| Staff | "Staff" button → PIN pad (added) | Orders, Menu, Settings; **Sales** needs a second passcode |

"Kitchen" on the front page means the *customer's* way into the cafe's ordering. It is not the cooks' screen.

## Screens from the original plan
Customer: 1 Welcome, 2 Menu (search, Favorites), 3 Meal Spotlight ("Complete the Plate", options, note), 4 Cart ("Add a drink?"), 5 Checkout (PayPal or cash only; app alert / text / both; guest allowed), 6 Order Status (Received → Being Prepared → Ready for Pickup), 7 Account (favorites, past orders, Order Again), 8 Rewards (punch card, points).
Restaurant: 9 Staff Orders (live list, Unpaid cash in red, chime, Ready sends alert/text), 10 Menu Manager, 11 Restaurant Settings (incl. pause ordering), 12 Sales Summary.

## Added beyond the plan
- **Store front page** with the iuic.dc sections and products (data in `store.config.ts`), shopping bag, purchases completed on the website.
- **Staff sign-in** with a 4-digit PIN (default 1234) so customers can't reach staff screens.
- **Sales passcode:** the Sales tab asks for a separate 4-digit passcode (default 5678) every time it is opened, and locks again when you leave it. Both codes are changed in Settings.
- Black + orange look from the reference image (round plate photos, pill buttons, orange stat bar).
- "Send a test order" button and demo PayPal sheet for previews.

## Not built yet
Shared online database so customer and staff phones see the same orders and menu; push alerts; automatic texts; real PayPal; real photos and artwork; real kitchen address/hours/menu.
