# Plan: Meta Ads OAuth + Ad Account Picker

## Context
Users currently have no way to connect their Meta Ads account in the onboarding flow. `OnboardAdPlatforms.js` is a skeleton and `/api/ads/connect` requires the frontend to already know the `external_account_id` (a raw Meta ad account ID users can't easily find). The goal is a "Connect with Meta" OAuth button that lets the backend fetch their ad accounts and present a human-readable dropdown picker — no raw IDs required.

---

## Architecture Overview

```
[ Connect with Meta ] → POST /api/ads/meta/oauth → returns authUrl
→ window.location = authUrl (Meta login)
→ Meta redirects → GET /api/ads/meta/callback?code=xxx
  → exchange code for long-lived token
  → store token in meta_oauth_pending table
  → redirect to ${FRONTEND_ORIGIN}/onboard/ads?meta_connected=true
→ frontend detects ?meta_connected=true
→ GET /api/ads/meta/accounts → reads pending token, lists accounts
→ user picks from dropdown
→ POST /api/ads/meta/confirm { store_id, external_account_id, account_name }
  → reads token from pending table → inserts ad_accounts → deletes pending row
→ redirect to /dashboard
```

---

## Files to Modify

| File | Change |
|------|--------|
| `db/init/schema.sql` | Add `meta_oauth_pending` table |
| `backend/services/meta.service.js` | Add `fetchAdAccounts()` |
| `backend/routes/ads/routes.js` | Add 4 new routes + update import |
| `src/components/OnboardAdPlatforms.js` | Build out the full UI |

---

## Step 1: Schema — `db/init/schema.sql`

Add at the end of the file:

```sql
CREATE TABLE meta_oauth_pending (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  access_token TEXT NOT NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  CONSTRAINT fk_meta_oauth_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

Purpose: temporarily holds the long-lived Meta token between OAuth callback and account selection. Deleted when `POST /api/ads/meta/confirm` runs.

---

## Step 2: Service — `backend/services/meta.service.js`

Add `fetchAdAccounts(accessToken)` and export it alongside the existing `fetchAdSpend`.

```js
async function fetchAdAccounts(accessToken) {
  const url = `${META_GRAPH_BASE}/me/adaccounts`;
  const params = {
    access_token: accessToken,
    fields: 'id,name,currency,account_status,business{name,id}',
    limit: 100,
  };
  const accounts = [];
  let nextUrl = null;

  do {
    const response = nextUrl
      ? await axios.get(nextUrl)
      : await axios.get(url, { params });

    const metaError = response.data?.error;
    if (metaError) {
      if (metaError.code === 190) throw new Error('ACCESS_TOKEN_EXPIRED');
      if (metaError.code === 200) throw new Error('PERMISSION_DENIED');
      throw new Error(`Meta API error ${metaError.code}: ${metaError.message}`);
    }

    const { data, paging } = response.data;
    for (const account of data) {
      if (account.account_status !== 1) continue; // active only
      accounts.push({
        id: account.id.replace(/^act_/, ''), // strip prefix; fetchAdSpend re-adds it
        name: account.name,
        currency: account.currency,
        business_name: account.business?.name ?? null,
      });
    }
    nextUrl = paging?.cursors?.after
      ? `${url}?${new URLSearchParams({ ...params, after: paging.cursors.after })}`
      : null;
  } while (nextUrl);

  // Business Manager accounts first, then alphabetical
  accounts.sort((a, b) => {
    if (a.business_name && !b.business_name) return -1;
    if (!a.business_name && b.business_name) return 1;
    return a.name.localeCompare(b.name);
  });

  return accounts;
}
```

Required env vars (add to `.env`):
- `META_APP_ID`
- `META_APP_SECRET`
- `META_REDIRECT_URI` (e.g., `http://localhost:8080/api/ads/meta/callback`)

---

## Step 3: Routes — `backend/routes/ads/routes.js`

### 3a. Update import at top
```js
const { fetchAdSpend, fetchAdAccounts } = require('../../services/meta.service');
```

### 3b. `POST /api/ads/meta/oauth`
Generates the Meta authorization URL and returns it as JSON. Frontend does `window.location.href = authUrl`.

```js
adsRouter.post('/meta/oauth', (req, res) => {
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth');
  authUrl.searchParams.set('client_id', process.env.META_APP_ID);
  authUrl.searchParams.set('redirect_uri', process.env.META_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'ads_read');
  authUrl.searchParams.set('response_type', 'code');
  res.json({ authUrl: authUrl.toString() });
});
```

### 3c. `GET /api/ads/meta/callback`
Meta redirects here after user authorizes. JWT cookie is present (browser redirect, same session).

1. Exchange `code` for short-lived token via `oauth/access_token`
2. Exchange short-lived for long-lived token (`fb_exchange_token`, ~60 days)
3. Upsert long-lived token into `meta_oauth_pending` for `req.user.id`
4. Redirect to `${FRONTEND_ORIGIN}/onboard/ads?meta_connected=true`

```js
adsRouter.get('/meta/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Exchange code → short-lived token
  const tokenRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
    params: {
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      redirect_uri: process.env.META_REDIRECT_URI,
      code,
    },
  });
  const shortLivedToken = tokenRes.data.access_token;

  // Exchange → long-lived token
  const llRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.META_APP_ID,
      client_secret: process.env.META_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });
  const longLivedToken = llRes.data.access_token;
  const expiresAt = new Date(Date.now() + llRes.data.expires_in * 1000);

  await db.query(
    `INSERT INTO meta_oauth_pending (user_id, access_token, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), expires_at = VALUES(expires_at)`,
    [req.user.id, longLivedToken, expiresAt]
  );

  const frontendUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/onboard/ads?meta_connected=true`);
});
```

### 3d. `GET /api/ads/meta/accounts`
Reads the pending token for the logged-in user and returns account list.

```js
adsRouter.get('/meta/accounts', async (req, res) => {
  const [rows] = await db.query(
    'SELECT access_token FROM meta_oauth_pending WHERE user_id = ?',
    [req.user.id]
  );
  if (!rows.length) {
    return res.status(404).json({ error: 'No pending Meta token. Please reconnect.' });
  }

  const accounts = await fetchAdAccounts(rows[0].access_token);
  res.json({ ok: true, accounts });
});
```

### 3e. `POST /api/ads/meta/confirm`
Finalizes the connection: reads token from pending table, inserts into `ad_accounts`, removes pending row.

```js
adsRouter.post('/meta/confirm', async (req, res) => {
  const { store_id, external_account_id, account_name } = req.body;
  if (!store_id || !external_account_id) {
    return res.status(400).json({ error: 'store_id and external_account_id are required' });
  }

  const [rows] = await db.query(
    'SELECT access_token, expires_at FROM meta_oauth_pending WHERE user_id = ?',
    [req.user.id]
  );
  if (!rows.length) {
    return res.status(404).json({ error: 'No pending Meta token. Please reconnect.' });
  }

  const { access_token, expires_at } = rows[0];
  const META_PLATFORM_ID = 1; // 'facebook' row in ad_platforms seed data

  await db.query(
    `INSERT INTO ad_accounts (store_id, ad_platform_id, external_account_id, account_name, access_token, token_expires_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE account_name = VALUES(account_name), access_token = VALUES(access_token), token_expires_at = VALUES(token_expires_at)`,
    [store_id, META_PLATFORM_ID, external_account_id, account_name || null, access_token, expires_at]
  );

  await db.query('DELETE FROM meta_oauth_pending WHERE user_id = ?', [req.user.id]);

  res.json({ ok: true, message: 'Meta Ads account connected' });
});
```

---

## Step 4: Frontend — `src/components/OnboardAdPlatforms.js`

**State:**
- `step`: `'idle'` | `'loading'` | `'pick'` | `'saving'` | `'done'`
- `accounts`: array from `GET /api/ads/meta/accounts`
- `selectedId`: chosen account id
- `error`: string | null

**On mount:** check `?meta_connected=true` in URL → auto-enter `'loading'` step and call `GET /api/ads/meta/accounts`.

**UI per step:**

| Step | UI |
|------|----|
| `idle` | "Connect with Meta Ads" button → calls `POST /api/ads/meta/oauth` → `window.location.href = authUrl` |
| `loading` | Spinner while fetching accounts |
| `pick` | Dropdown grouped by `business_name` via `<optgroup>`, each option shows `{name} ({currency})`. "Save" button calls `POST /api/ads/meta/confirm` |
| `done` | Success message + navigate to `/dashboard` |
| `error` | Inline error + "Try again" button |

**Note:** The component needs `store_id`. Fetch it from whichever endpoint the dashboard already uses to get the user's store (check how the dashboard currently loads store data and reuse that pattern).

---

## Env Vars Required (`.env`)

```
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_REDIRECT_URI=http://localhost:8080/api/ads/meta/callback
```

Register `META_REDIRECT_URI` in the Meta App Dashboard under **Facebook Login > Valid OAuth Redirect URIs**.

`ads_read` permission works immediately for developer/tester accounts. App Review required before going live with arbitrary users.

---

## Verification Checklist

- [ ] Navigate to `/onboard/ads` → "Connect with Meta Ads" button visible
- [ ] Click button → Meta login opens
- [ ] Authorize → redirected back to `/onboard/ads?meta_connected=true`
- [ ] Dropdown populates with your Meta ad accounts
- [ ] Select one, click Save → success message
- [ ] `SELECT * FROM ad_accounts;` — new row present with correct `external_account_id`
- [ ] `SELECT * FROM meta_oauth_pending;` — row deleted after confirm
- [ ] `POST /api/ads/sync` with the new `ad_account_id` — spend data loads
