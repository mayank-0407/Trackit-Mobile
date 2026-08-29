# TrackIt Project Context

This document is the durable implementation brief for the TrackIt repository. It is based on the source currently present on branch `feature/mobileapp`. Update it whenever a feature, route, data contract, or security behavior changes.

## Product Summary

TrackIt is a full-stack personal expense tracker. Users can create an account, verify their email, sign in, manage financial accounts and categories, record expenses/income/transfers, inspect dashboard summaries and charts, reveal protected account details, and request Excel reports by email.

The application is implemented with Next.js App Router, React, TypeScript, Tailwind CSS v4, MongoDB through Mongoose, NextAuth credentials/JWT sessions, bcrypt, Nodemailer/Gmail, Recharts, Zod, Axios, and XLSX.

## Current Stack And Commands

- Next.js `15.5.9`, React `19.1.0`, TypeScript 5.
- Tailwind CSS v4 through `@tailwindcss/postcss` and `tw-animate-css`.
- MongoDB/Mongoose `8.18.0`; database name is `trackit`.
- NextAuth `4.24.11` with credentials and JWT sessions.
- Commands: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.
- TypeScript path alias: `@/*` maps to `src/*`.
- There are currently no test files and no test script.
- `next.config.ts` ignores ESLint errors during builds.
- Deployment intent in README: Vercel.

## Route And Page Map

### Public and authentication pages

- `/` - landing page with TrackIt branding and links to login and signup.
- `/login` - credentials login using NextAuth.
- `/signup` - user registration.
- `/forgotpassword` - requests a password reset email.
- `/forgotpassword/reset?token=...` - reset form reached from an email link.
- `/verify?token=...` - email verification screen and client request.
- `/logout` - client sign-out and redirect behavior.

### Authenticated pages

- `/dashboard` - main dashboard, account cards, summaries, charts, transactions, filters, and modal workflows.
- `/dashboard/account/[id]` - account detail page. Current implementation fetches all accounts rather than using the URL id and is not linked from the dashboard.

### Middleware behavior

`src/middleware.ts` uses `getToken` with `NEXTAUTH_SECRET`.

- Static assets, `/_next`, `/static`, and every `/api` path bypass middleware.
- Authenticated users are redirected from `/`, `/login`, and `/signup` to `/dashboard`.
- Unauthenticated users are redirected from `/dashboard` and descendants to `/login?callbackUrl=...`.
- `/verify` is included in the matcher but is not protected by a token requirement.
- `/forgotpassword` is not in the matcher and remains public.
- API handlers must perform their own authorization checks.

## User Features

### Registration and login

Signup accepts name, email, and a password of at least eight characters. The API hashes the password with bcrypt, creates the user, creates a default `Cash` account, and emails a JWT verification link. Verification tokens expire after three minutes. Login compares the bcrypt hash and refuses users whose `isVerified` flag is false. The NextAuth session callback adds the user id to the session.

### Password recovery

The forgot-password form submits an email and the API emails a three-minute reset link. The reset page reads the token from the URL, decodes the email client-side, and posts email plus a new password to the reset API.

Important current behavior: the reset API does not verify the submitted JWT server-side. It finds the user by email and changes the password. This is a high-priority security defect. Forgot-password requests also reveal whether an email exists, and there is no visible rate limiting.

### Accounts

Users can add accounts of type `cash`, `bank`, `credit`, or `other`. Accounts have a name, currency (default `INR`), numeric balance, and optional bank/card metadata: bank name, account number, IFSC code, card number, expiry date, and CVV. Account number, card number, and CVV are encrypted at rest on create/update. The dashboard can reveal sensitive fields through a dedicated API call and can edit or delete accounts through a modal.

### Categories

The API returns built-in default categories plus the current user's categories. Users can add a category with a name and optional icon, and manage/delete categories. A category cannot be deleted when transactions use it. Category names are unique per user through a compound Mongoose index.

### Transactions

Users can create, edit, and delete three transaction types:

- `expense`: decreases the selected account balance.
- `income`: increases the selected account balance.
- `transfer`: moves money between a source account and target account.

Transactions contain account id, optional category id, type, amount, date, optional note, optional transfer account id, user id, and timestamps. The dashboard sorts transactions newest-first, supports account filtering, and refreshes accounts after balance-changing operations.

### Dashboard analytics and exports

The dashboard displays income, expenses, and net balance summaries; account cards; income-versus-expense pie data; transaction amount bar data; and current-month category-expense analytics. Date controls offer last 10, 20, 30, or 60 days and a custom range. The download modal posts selected account ids and an email address to generate account-specific XLSX sheets and send the report through Gmail SMTP.

## API Contract Map

All API paths are under `src/app/api`. Responses and error messages are implemented directly in each route handler; there is no shared API response abstraction.

### Authentication APIs

- `POST /api/auth/signup`: validates signup input, checks/creates user, hashes password, creates default Cash account, signs a three-minute JWT, and sends verification email.
- `POST /api/auth/forgotpassword`: validates email, signs a three-minute reset JWT, and sends reset email. Current response can disclose account existence.
- `POST /api/auth/forgotpassword/reset`: receives email and password and replaces the user's password. Current server-side token verification is missing.
- `GET /api/auth/verifyEmail?token=...`: verifies JWT with `JWT_SECRET`, finds the email, and marks the user verified.
- `POST /api/auth/resend-verification`: creates and emails a new three-minute verification token.
- `/api/auth/[...nextauth]`: NextAuth route using the credentials provider and custom `/login` page.

### Account APIs

- `GET /api/accounts`: returns the signed-in user's accounts.
- `POST /api/accounts`: validates account data, associates it with the session user, encrypts protected fields, and creates the account.
- `GET /api/accounts/[id]`: fetches an account. Current handler lacks authentication/ownership enforcement.
- `PUT /api/accounts/[id]`: updates an account for the authenticated user.
- `DELETE /api/accounts/[id]`: deletes an account. Current handler lacks authentication/ownership enforcement.
- `POST /api/accounts/reveal`: checks ownership and decrypts a requested sensitive field for display.

### Transaction APIs

- `GET /api/transactions?accountId=...`: returns the signed-in user's transactions, optionally filtered by account, with account and category references populated.
- `POST /api/transactions`: creates expense/income/transfer records and mutates balances.
- `PUT /api/transactions/[id]`: reverses old balance effects, updates the transaction, then applies new effects.
- `DELETE /api/transactions/[id]`: reverses the transaction balance effect and deletes it.

Current update/delete handlers lack authentication and ownership checks. Create validates account existence but does not reliably enforce that source and transfer target accounts belong to the current user.

### Category, analytics, and report APIs

- `GET /api/categories`: combines defaults and the current user's categories.
- `POST /api/categories`: creates a user-owned category.
- `DELETE /api/categories/[id]`: deletes an unused category. Current handler lacks authentication/ownership enforcement.
- `GET /api/analytics/category-expense`: aggregates current-month expenses by category.
- `POST /api/download-excel`: creates XLSX worksheets for selected accounts and emails the report using Nodemailer.

## Data Model Details

### User (`src/models/User.ts`)

- `name`
- unique indexed `email`
- bcrypt-hashed `password`
- optional `image`
- `isVerified`
- Mongoose timestamps

### Account (`src/models/Account.ts`)

- `userId`
- `name`
- `type`: cash, bank, credit, other
- bank/card metadata
- `currency`, default `INR`
- mutable numeric `balance`
- Mongoose timestamps

### Category (`src/models/Category.ts`)

- `name`
- optional `icon`
- `color`
- optional `userId`
- `isDefault`
- compound unique index on `{ userId, name }`

### Transaction (`src/models/Transaction.ts`)

- `userId`
- `accountId`
- optional `transferAccountId`
- `type`: expense, income, transfer
- `amount`
- `note`
- `date`
- required `categoryId`
- Mongoose timestamps

## Validation And Business Rules

`src/lib/Validation.ts` defines Zod schemas for signup, login, accounts, transactions, and forgot-password requests.

- Signup: name min 2, valid email, password min 8.
- Login: valid email, non-empty password.
- Account: name required, known type enum, currency default INR, balance default 0, optional metadata.
- Transaction: account id, nullable/optional category id, known type enum, numeric amount, coerced date, optional note and transfer target.
- Forgot password: email is only a string; password is optional but min 8 when provided.

Known inconsistencies: transaction amount has no positive/minimum rule; account balance is client-supplied; update does not use `TransactionSchema`; the model requires `categoryId` while transfer creation intentionally writes null; and a second AccountSchema exists in `src/lib/account.ts`.

## Security And Reliability Notes

Treat these as current implementation risks, not completed features:

- Password reset authorization is based on a client-supplied email, not a server-verified token.
- Account GET/DELETE by id, transaction PUT/DELETE, and category DELETE lack complete auth/ownership checks.
- Transaction creation may accept another user's account or transfer target if ids are supplied.
- Balance changes are separate reads/writes and are not MongoDB transactions; concurrent requests can lose updates.
- `ENCRYPTION_KEY` falls back to a hard-coded value if absent; the fallback may not be a valid 32-byte base64 AES-256 key. Encryption configuration should be mandatory.
- Account creation/update encrypts account/card/CVV values, but expiry is not encrypted while reveal attempts to decrypt it.
- No apparent rate limiting exists for login, verification, resend, or reset endpoints.
- Reset and email flows expose account existence and embed user-controlled URLs in email HTML without additional escaping.
- Middleware intentionally skips APIs, so route-level authorization is essential.
- There are no automated tests in the repository.

## Client Components And State

- `Navbar.tsx`: authenticated navigation and sign-out affordance.
- `AddAccountModal.tsx`: account creation form.
- `AccountDetailsModal.tsx`: sensitive-field reveal, edit, and delete operations.
- `AddTransactionModal.tsx`: transaction creation form.
- `EditTransactionModal.tsx`: transaction edit form.
- `AddCategoryModal.tsx`: category creation form.
- `ManageCategoriesModal.tsx`: category list and deletion.
- `DownloadModal.tsx`: report account/email selection and request.
- `components/ui/*`: Button, Card, Dialog, Form, Input, Label, Select, Tooltip primitives based largely on Radix/shadcn patterns.
- `AuthProvider.tsx`: wraps the application in the NextAuth session provider.

The dashboard owns accounts, transactions, categories, summaries, chart data, modal visibility, date/account filters, deletion state, and retry state. It fetches accounts, transactions, categories, and category analytics on load and after relevant mutations. Transaction loading has an automatic retry path capped at four attempts.

Current dashboard caveats:

- Date filtering changes summary calculations but does not filter the transaction table or bar chart.
- The chart labeled “Transactions This Month” receives the full transaction list rather than a month-filtered list.
- Category analytics is always current-month data and ignores dashboard date/account filters.
- Account edit/delete callbacks do not fully update dashboard state in all paths.
- The account detail page is not connected to dashboard navigation.
- A resend-verification API exists but no visible resend-verification UI was found.

## Styling And Application Shell

`src/app/layout.tsx` supplies metadata, the global stylesheet, `AuthProvider`, and toast support. `src/app/globals.css` imports Tailwind and `tw-animate-css`, defines light/dark design tokens using OKLCH variables, and applies background/foreground and border defaults. Product-specific static imagery is not present in `public/`; it contains default Next/Vercel assets.

## Environment Variables

Expected in `.env.local` or deployment configuration:

- `MONGODB_URI`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `JWT_SECRET`
- `BASE_URL`
- `EMAIL_USER`
- `EMAIL_PASS`

Email uses Gmail SMTP and expects an app password when two-factor authentication is enabled. Verification/reset links are built from `BASE_URL`.

## Working Rules For Future Changes

1. Preserve the App Router and existing route paths unless a migration is intentional.
2. Keep session checks and ownership checks in every API handler; middleware does not protect APIs.
3. When changing transaction behavior, reason about both the transaction document and every affected account balance.
4. When changing account fields, check encryption and reveal symmetry for create, update, and display.
5. Keep dashboard state refreshes consistent after mutations so summaries, charts, tables, and account balances agree.
6. Add focused tests before modifying shared balance or authorization logic; the current repository has no test harness.
7. Run `npm run lint` and `npm run build` when environment variables and MongoDB access are available.

## Source Inventory

Primary source areas for the web app are `src/app`, `src/components`, `src/context`, `src/lib`, `src/models`, and `src/middleware.ts`. The mobile app is currently centered in `App.tsx` with local support modules under `src/`. `README.md` is a high-level guide but is stale where it says Next.js 14. The mobile app includes profile editing in its local Settings screen; this is separate from the web app, which still has no profile route or profile UI.

## Mobile App Implementation (2026-08-28)

The repository now also contains a standalone React Native Expo mobile app. It was scaffolded with Expo SDK 54, React Native 0.81, React 19, and TypeScript. The package name and Expo identity are `trackit-mobile` / `TrackIt`.

### Mobile Commands And Dependencies

- `npm start` - starts the Expo development server.
- `npm run ios` - starts Expo for iOS.
- `npm run android` - starts Expo for Android.
- `npm run web` - starts the Expo web target.
- `npx tsc --noEmit` - current validation command; it passes after the latest changes.
- `expo-sqlite` provides local persistence through `expo-sqlite/kv-store`.
- `lucide-react-native` provides interface icons.

### Mobile Source Map

- `App.tsx` is the Expo entry export for `src/app/TrackItApp.tsx`.
- `src/app/TrackItApp.tsx` owns mobile hydration, tab navigation, cross-feature state, and balance-safe mutations.
- `src/components/BottomNav.tsx` owns footer tab navigation and `src/components/TransactionRow.tsx` owns shared transaction presentation.
- `src/features/dashboard/DashboardScreen.tsx`, `src/features/activity/ActivityScreen.tsx`, and `src/features/insights/InsightsScreen.tsx` own the read-only dashboard, activity, and analytics surfaces.
- `src/features/accounts/*` owns account listing and account editing.
- `src/features/settings/*` owns profile Settings, Categories, and category editing.
- `src/features/transactions/*` owns add, detail, and edit transaction flows.
- `src/store.ts` defines `Account`, `Transaction`, `Category`, `Profile`, and `Store`, plus seed data, formatting, AsyncStorage loading, migration, and saving.
- `src/settingsStyles.ts` contains Settings, Categories, profile, and Insights styles.
- `src/transactionStyles.ts` contains transaction details, edit controls, and selector styles.

### Mobile Persistence Contract

The app uses SQLite-backed key-value storage with key `trackit-mobile-store-v1` in database `trackit.db`; it intentionally uses structured JSON rather than CSV because accounts, transactions, categories, IDs, and balance mutations require reliable nested records and typed migration. `expo-sqlite/kv-store` preserves the existing storage API while moving the persisted data into the device's SQLite-backed app storage.

`Store` contains:

- `accounts`: local accounts with `id`, `name`, `type` (`cash`, `bank`, or `card`), `balance`, `color`, and optional `last4`.
- `transactions`: local records with `id`, `title`, `category`, optional `categoryId`, signed `amount`, `type` (`expense`, `income`, or `transfer`), `date`, `account`, optional `accountId`, and `icon`.
- `categories`: records with `id`, `name`, `icon`, `color`, and `kind` (`expense`, `income`, or `both`).
- `profile`: `{ name, email }`.

The loader backfills missing categories as expense categories, adds the seeded categories when no categories exist, migrates transaction account/category IDs by matching their saved names, and backfills the profile from seed data. Every state mutation is saved back to AsyncStorage.

### Mobile Navigation And Screens

The footer navigation contains:

- Overview: dashboard with total balance, income, spending, account cards, recent activity, insight message, and floating add button.
- Activity: searchable full transaction list. Tapping a row opens its detail sheet.
- Insights: category-wise financial analysis with an Expenses/Income toggle.
- Accounts: account list with net worth and account CRUD.
- Settings: profile and preferences page.

The dashboard `See all` links navigate to the full Accounts and Activity tabs. Insights is directly next to Activity in the footer. Settings opens a separate Categories page through a Categories button and an Insights page through an Insights button.

### Mobile Profile And Settings

Settings shows an editable profile header, name field, email field, Save profile action, currency display (`INR`), Categories navigation, and Insights navigation. Profile changes update the dashboard greeting and persist locally.

### Mobile Account CRUD

Accounts can be added from the Accounts tab or dashboard Add account card, edited through an account sheet, and deleted after native confirmation. Add/edit supports name, type, and current balance. Account changes immediately update net worth and dashboard cards and persist locally.

### Mobile Category CRUD

Categories are managed on their own page under Settings. Users can add, edit, and delete categories with confirmation. Category editing supports name, icon name, color, and usage kind: Expense, Income, or Both. These kinds control which categories appear during transaction creation and editing.

### Mobile Transaction CRUD And Balance Rules

The add transaction sheet supports expense/income mode, amount, description, category selection, and account selection. Category choices are filtered by the selected mode; categories marked Both appear in either mode. The selected account and category IDs plus display names/icons are saved with the transaction.

Every transaction row on the dashboard and Activity page is clickable. Its detail sheet shows title, category, signed amount, account, and date, with Edit transaction and Delete actions.

- Creating an expense applies a negative signed amount to the selected account.
- Creating income applies a positive signed amount to the selected account.
- Deleting subtracts the original signed amount from its account, restoring the prior balance.
- Editing reverses the old signed amount, then applies the new signed amount to the newly selected account. This supports moving an edited transaction between accounts.
- The current mobile transfer UI is not implemented; transfer records remain part of the type model for compatibility with the web product brief.

### Mobile Insights

Insights derives totals directly from transactions. Its toggle switches between expense and income transactions, groups absolute amounts by category, sorts categories by total, displays total amount and transaction count, and renders proportional bars. It shows an empty state when the selected mode has no transactions. New transactions appear automatically because the page reads the current Store state.

### Mobile Follow-Up Notes

- The mobile app is currently local/offline and is not connected to the Next.js APIs, MongoDB, NextAuth, email, or web account.
- Local records are saved in the app's SQLite database and persist across app restarts. They are still removed if the app is uninstalled or its app data is cleared.
- There is no mobile test harness yet; validation currently relies on TypeScript compilation and manual Expo interaction.
- The app’s large compressed `App.tsx` stylesheet includes stale editor diagnostics about old account picker style keys even though `npx tsc --noEmit` passes and current source references use dedicated picker/settings style modules. Reformatting `App.tsx` would improve maintainability but should be done separately from feature work.