# Admin Setup (Firebase Custom Claims)

This project gates certain callable functions behind an admin check:

- `triggerReindex` (inventory reindex)
- `triggerEval` (AI evaluation suite)

Admin is granted by either:

- Firebase Auth custom claim: `admin: true` (preferred), or
- `ADMIN_UIDS` env var (comma-separated UIDs) as a fallback.

## Step-by-step (recommended): Set `admin=true` claim

1. Get your Firebase Auth UID (Firebase Console -> Authentication -> Users).
2. From `/Users/richardmendez/richard-automotive-_-command-center/functions`, run:

```bash
npm run set-admin-claim -- --uid YOUR_UID
```

By default it will try `./serviceAccountKey.json` (or `GOOGLE_APPLICATION_CREDENTIALS` if set).

3. Sign out and sign back in on the client to refresh the ID token.

## Fallback: `ADMIN_UIDS`

Set `ADMIN_UIDS` in functions environment to a comma-separated list of UIDs:

```bash
ADMIN_UIDS=uid1,uid2
```

