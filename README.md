# Platform Admin portal

The operator's side of the SaaS: create the **companies** that buy the product, set how many **seats**
and which **features** each has, record their **payments**, and suspend one if needed. Companies manage
their own people in the user app's `/admin` console — this portal never shows a company's ordinary users.

Architecture and rules: `trading-agent-backend/docs/MULTI_TENANT_COMPANIES.md`.

## Run

```bash
npm install
API_TARGET=http://127.0.0.1:3001 npm run dev      # http://localhost:5174 (proxies /api to the gateway)
npm run build                                      # static files in dist/
```

Sign-in uses the operator accounts from the backend's `PLATFORM_ADMINS` setting
(`name:bcrypt-hash`) and the same 2FA mode as admin accounts. Set `APP_BASE_URL` on the backend so
owner invite links point at the user app.

For a deployed build served from a different origin than the gateway, set `VITE_API_BASE_URL`
(see `.env.example`) and allow this portal's origin in the gateway's `CORS_ALLOW_ORIGINS`.

## Pages

| Route | |
|---|---|
| `/` | Overview: companies, seats sold/used, revenue, renewals due, companies near their seat limit |
| `/companies` | List, search, create (name, seats, owner email, months, features) |
| `/companies/:id` | Record payment, adjust seats, refund, owners and invite links, settings (features, branding, domains, expiry), suspend/reactivate, company audit |
| `/payments` | Every payment across companies |
| `/audit` | Platform-wide audit log |

A production host must serve `index.html` for these paths (SPA fallback).
