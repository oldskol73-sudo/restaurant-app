# One-time setup: shared menu, orders and staff login

Do this once, on a computer, before the cafe goes live. It takes about 10 minutes.
Until it is done, menu changes and orders only stay on the phone that made them.

You need: the Supabase account that owns the project
(https://supabase.com/dashboard, project `poyofvyolqsqfdjhjncv`).

## Step 1. Build the database
1. Sign in to the Supabase dashboard and open the project.
2. In the left menu click **SQL Editor**, then **New query**.
3. Open the file `supabase/schema.sql` from the app folder, select everything (Cmd+A), copy it (Cmd+C).
4. Paste it into the query box and click **Run**.
5. You should see "Success. No rows returned". It is safe to run again later.

## Step 2. Create the staff login
1. Left menu: **Authentication** → **Users** → **Add user** → **Create new user**.
2. Type the staff email and a password. Write both down for the kitchen team.
3. Tick **Auto Confirm User** so no confirmation email is needed.
4. Click **Create user**.

## Step 3. Tell the database this email is staff
1. Back in **SQL Editor** → **New query**.
2. Paste the line below, with the email you used in Step 2, and click **Run**:

   `insert into public.staff_emails (email) values ('staff@example.com') on conflict do nothing;`

## Step 4. Turn off public sign-ups
1. Left menu: **Authentication** → **Sign In / Providers** (may be called **Providers**).
2. Under **Email**, turn **off** "Allow new users to sign up".
3. Click **Save**. Only the staff login you created can sign in now.

## Step 5. Sign in on the staff phone (once per phone)
1. In the app, tap **Staff** (top right of the store home page).
2. Choose the staff account sign-in, enter the staff email and password.
3. After this, the staff PIN is just a quick unlock on that phone.

## Step 6. Test it
1. On the staff phone open **Menu Manager** and flip a dish to **Sold out**.
2. On a different phone, open the Sweet Savor Cafe menu. The dish should show as sold out within a few seconds.
3. Place a test order on the second phone. It should appear on the staff **Orders** screen.

## Everyday staff tasks
- **Mark a dish sold out:** Staff → Menu Manager → flip the switch next to the dish.
- **Delete a dish for good:** Staff → Menu Manager → tap the dish → **Delete item** → **Yes, delete it**.
- **Add a dish:** Staff → Menu Manager → **Add meal** (or **Add extra**).

## Never share
The Supabase **service_role** key. The key inside the app (the "publishable" key) is safe to ship.
