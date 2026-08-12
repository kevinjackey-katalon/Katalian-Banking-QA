<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19NOAIUNscPlKlkuAOJmJhAChlifGG5TJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Feature flows

### 1. Retail & transactions
Login → Two-Factor Verification → Balance (Dashboard) → Transfer (internal or Pay a Payee) → Payee management → Account statements (PDF).

- **Payees**: manage saved external payees from `Payments → Pay a Payee` or the `Manage Payees` link on the dashboard/nav. Payee data lives on `User.payees`.
- **Statements**: from any account tile → account ledger → `Download Statement` (per-month or full history, PDF).

### 2. Lending
Loan product selection → Application (personal info) → **eKYC** (ID type/number + simulated document upload + liveness check) → Employment & terms → **Credit Decision** (Approved / Referred / Declined, with a risk score and reason) → **Disbursement** (pick a destination account, funds are credited and the loan becomes Active).

The credit decision engine (`api/mockApi.ts`) is deterministic given the same inputs — no randomness — so Katalon assertions on decision outcome stay stable across runs. It declines automatically if the eKYC step wasn't completed, and otherwise buckets on loan-amount-to-income ratio (≤20% → Approved, ≤50% → Referred, else Declined).

### 3. Two-Factor Authentication (2FA)
After password login, users land on a one-time-code screen (`/verify-otp`). This app has **no real SMS/email gateway**, so by design the current code is also shown on screen in a labeled "Demo Mode" panel — no team member needs a real phone to log in.

**For Katalon Studio automation**, the code is available two ways:
- Read the on-screen element: `id="demo_otp_code"`
- Or read it directly from browser storage: `WebUI.executeJavaScript("return localStorage.getItem('katalian_otp_v1')", null)` (JSON with `code`, `userId`, `expiresAt`, `attemptsRemaining`)

Key element IDs for scripting the flow:
| Step | Element |
|---|---|
| Enter code | `#otp_code` |
| Submit | `#button_verifyOtp` |
| Resend | `#button_resendOtp` |
| Remember device | `#checkbox_rememberDevice` |

Checking "Remember this device" persists a trusted-device flag in `localStorage` (`katalian_trusted_device_<userId>`) and skips 2FA on subsequent logins for that browser profile — useful for day-to-day team use, but leave it unchecked in automated suites that want to exercise 2FA every run.

This is intentionally a demo/QA implementation, not production MFA (no carrier integration, no TOTP secret exchange). Swap `utils/otp.ts` for a real provider before going anywhere near production traffic.
