# Google Ads Onboarding Integration Plan

## Context

Users of the e-commerce dashboard need to connect their Google Ads account so that daily ad spend data (spend, impressions, clicks, conversions) is pulled from Google and stored in `ad_spend_daily`. The `ad_accounts` and `ad_spend_daily` tables are already in the schema. The goal is to wire up a full OAuth 2.0 onboarding flow + data sync service, following the same patterns used by the existing Shopify OAuth flow and the pending Meta OAuth plan (`META-PLAN.md`).

---

## Step-by-Step Plan

### Step 1 — Google Cloud Setup (Manual, one-time)

1. Create a project in Google Cloud Console.
2. Enable **Google Ads API** and **Google Analytics Data API**.
3. Create **OAuth 2.0 credentials** (Web application type).
4. Set the authorized redirect URI to: `http://localhost:3001/api/ads/google/callback` (or your `BACKEND_ORIGIN`).
5. Add these env vars to `backend/.env` and `backend/.env.example`:
   ```
   GOOGLE_ADS_CLIENT_ID=...
   GOOGLE_ADS_CLIENT_SECRET=...
   GOOGLE_ADS_REDIRECT_URI=http://localhost:3001/api/ads/google/callback
   GOOGLE_ADS_DEVELOPER_TOKEN=...
   ```

---

### Step 2 — DB: Seed `ad_platforms` & Add Pending Token Table

**File to modify:** `db/init/schema.sql`

1. Add a seed insert at the bottom of the schema (or a separate seed file):
   ```sql
   INSERT IGNORE INTO ad_platforms (name) VALUES ('google_ads'), ('meta');
   ```

2. Add a temporary pending-token table for the OAuth code exchange flow:
   ```sql
   CREATE TABLE google_oauth_pending (
     id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
     user_id INT UNSIGNED NOT NULL,
     store_id INT UNSIGNED NOT NULL,
     access_token TEXT NOT NULL,
     refresh_token TEXT NOT NULL,
     token_expires_at DATETIME NOT NULL,
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT fk_google_pending_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```
   This mirrors the pattern described in `META-PLAN.md` for `meta_oauth_pending`.

---

### Step 3 — Backend: Google Ads Service

**New file:** `backend/services/google.service.js`

Implement two functions:

**`fetchAccessibleAccounts(accessToken, developerToken)`**
- Calls `googleads.googleapis.com/v15/customers:listAccessibleCustomers`
- Returns list of customer IDs the user has access to
- For each customer ID, fetches the account name via a GAQL query

**`fetchAdSpend(accessToken, developerToken, customerId, startDate, endDate)`**
- Executes GAQL query against `googleads.googleapis.com/v15/customers/{customerId}/googleAds:searchStream`
- Query:
  ```sql
  SELECT campaign.id, campaign.name, segments.date,
         metrics.cost_micros, metrics.impressions,
         metrics.clicks, metrics.conversions
  FROM campaign
  WHERE segments.date BETWEEN '{startDate}' AND '{endDate}'
    AND campaign.status = 'ENABLED'
  ```
- Converts `cost_micros` → currency by dividing by `1,000,000`
- Aggregates results by date (sum across campaigns per day)
- Returns normalized array matching `ad_spend_daily` columns

Use `axios` (already installed) for HTTP calls — same pattern as `meta.service.js`.

---

### Step 4 — Backend: Google Ads OAuth Routes

**File to modify:** `backend/routes/ads/routes.js`

Add 5 new endpoints:

#### `GET /api/ads/google/oauth`
- Protected by `authenticateToken`
- Accepts `?store_id=` query param
- Builds Google OAuth 2.0 authorization URL with scope: `https://www.googleapis.com/auth/adwords`
- Includes `state` param encoding `{ userId, storeId }` as base64 JSON
- Returns `{ authUrl }` to frontend

#### `GET /api/ads/google/callback`
- **Not** protected by middleware (Google redirects here unauthenticated)
- Decodes `state` to get `userId` and `storeId`
- Exchanges `code` for `access_token` + `refresh_token` via POST to `https://oauth2.googleapis.com/token`
- Encrypts tokens using existing `backend/utils/crypto.js` (AES-256-GCM)
- Stores encrypted tokens in `google_oauth_pending` with `user_id` and `store_id`
- Redirects browser to: `http://localhost:3000/onboard-ad-platforms?google=pending`

#### `GET /api/ads/google/accounts`
- Protected by `authenticateToken`
- Reads encrypted tokens from `google_oauth_pending` for `req.user.id`
- Decrypts and calls `google.service.fetchAccessibleAccounts()`
- Returns `[{ customerId, accountName }]` to frontend for user to pick from

#### `POST /api/ads/google/confirm`
- Protected by `authenticateToken`
- Body: `{ store_id, customer_id, account_name }`
- Reads pending tokens, decrypts them
- Upserts into `ad_accounts`:
  ```sql
  INSERT INTO ad_accounts (store_id, ad_platform_id, external_account_id, account_name, access_token, token_expires_at)
  VALUES (?, (SELECT id FROM ad_platforms WHERE name='google_ads'), ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE access_token=VALUES(access_token), token_expires_at=VALUES(token_expires_at)
  ```
- Deletes row from `google_oauth_pending`
- Returns `{ success: true }`

#### `POST /api/ads/google/sync`
- Protected by `authenticateToken`
- Body: `{ store_id, start_date, end_date }`
- Fetches `ad_accounts` row for this store + google_ads platform
- Decrypts `access_token`
- Calls `google.service.fetchAdSpend()`
- Upserts each day into `ad_spend_daily`:
  ```sql
  INSERT INTO ad_spend_daily (store_id, ad_platform_id, date, spend, impressions, clicks, conversions)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE spend=VALUES(spend), impressions=VALUES(impressions),
    clicks=VALUES(clicks), conversions=VALUES(conversions)
  ```
- Returns `{ synced: N }` (count of rows upserted)

---

### Step 5 — Frontend: Update `OnboardAdPlatforms.js`

**File to modify:** `src/components/OnboardAdPlatforms.js`

Follow the same pattern as `OnboardStore.js` for Shopify:

1. Add a **"Connect Google Ads"** button.
2. On click: call `GET /api/ads/google/oauth?store_id={storeId}`, then do `window.location.href = authUrl`.
3. On page load: check `?google=pending` in the URL. If present:
   - Fetch `GET /api/ads/google/accounts` to get the list of accessible accounts.
   - Render a `<select>` dropdown for the user to choose an account.
4. On account selection and confirm click: call `POST /api/ads/google/confirm` with the selected account.
5. On success: show confirmation and optionally trigger a first sync via `POST /api/ads/google/sync`.

---

## Critical Files

| File | Role |
|---|---|
| `backend/routes/ads/routes.js` | Add all 5 new Google Ads endpoints |
| `backend/services/google.service.js` | New file — Google Ads API calls |
| `backend/utils/crypto.js` | Reuse for token encryption/decryption |
| `db/init/schema.sql` | Add `google_oauth_pending` table + seed `ad_platforms` |
| `src/components/OnboardAdPlatforms.js` | Add Google Ads connect UI |
| `backend/.env` + `backend/.env.example` | Add 4 Google env vars |

---

## Verification

1. **OAuth flow**: Click "Connect Google Ads" → browser redirects to Google login → after auth, browser lands back on `/onboard-ad-platforms?google=pending`.
2. **Account picker**: Dropdown populates with Google Ads accounts the user has access to.
3. **Confirm**: After confirming, check `ad_accounts` table — a row should exist with `ad_platform_id` matching `google_ads` and the encrypted token stored as `iv:authTag:ciphertext`.
4. **Sync**: Call `POST /api/ads/google/sync` with a date range → check `ad_spend_daily` table for inserted rows.
5. **Encryption**: Verify `access_token` column in `ad_accounts` is stored encrypted, not plaintext.
