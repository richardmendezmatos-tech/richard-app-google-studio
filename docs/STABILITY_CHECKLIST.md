# Stability Checklist (Post-Copilot)

## 1) Required Environment Variables

Configure these in `.env` (or your deployment secret manager):

- `VITE_GEMINI_API_KEY`
- `VITE_FIREBASE_API_KEY` (fallback for Gemini in this project)
- `VITE_ANTIGRAVITY_API_URL` (needed for Antigravity API calls)
- `VITE_ANTIGRAVITY_EDGE_URL` (needed for image optimization edge path)
- `VITE_ANTIGRAVITY_API_KEY` (optional but recommended for protected endpoints)
- `VITE_ANTIGRAVITY_OUTREACH_ACTION_PATH` (optional, defaults to `/copilot/outreach-action`)
- `VITE_RESEND_API_KEY` (optional, enables real transactional email)
- `VITE_RESEND_FROM_EMAIL` (optional, sender identity for Resend)

Notes:
- If `VITE_RESEND_API_KEY` is missing or invalid, email runs in simulation mode.
- If `VITE_ANTIGRAVITY_API_URL` is missing, outreach selection falls back to local logic.
- If `VITE_GEMINI_API_KEY` is missing, the app attempts `VITE_FIREBASE_API_KEY` as fallback.

## 2) Local Verification Commands

Run from the project root:

```bash
npm run test -- src/services/antigravityOmnichannelService.test.ts src/services/automationService.test.ts src/services/emailService.test.ts
npm run build
```

## 3) Runtime Smoke Checks

- CRM board manual outreach:
  - Verify message dispatch still works when Antigravity is unavailable.
- Lead nurturing:
  - Verify day-1 rule can send via email, and falls back to WhatsApp on email failure.
- Transactional email:
  - With no Resend key, verify simulated success logs.
  - With a valid Resend key, verify API send success.

## 4) Deployment Gate

Before deployment, confirm:

- Tests in section 2 pass.
- Build completes with no errors.
- Production env includes all required keys for your chosen channels.
