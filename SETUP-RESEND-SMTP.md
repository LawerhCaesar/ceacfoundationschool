# Setup Resend SMTP for Password Reset Emails

Follow these steps to connect Resend (free tier) to Supabase so password reset emails send reliably.

---

## Option A: One-Click Integration (Easiest)

If you want Resend to auto-configure Supabase for you:

1. **Sign up at [resend.com](https://resend.com)** (free account)
2. **Verify your domain** first:
   - Go to [resend.com/domains](https://resend.com/domains)
   - Click **Add Domain**
   - Enter your domain (e.g. `ceacfoundationschool.com` or a subdomain like `mail.ceacfoundationschool.com`)
   - Add the DNS records Resend shows to your domain registrar
   - Wait for verification (usually 5–10 minutes)
3. **Connect to Supabase:**
   - Go to [resend.com/settings/integrations](https://resend.com/settings/integrations)
   - Click **Connect to Supabase** → sign in to Supabase
   - Select your project → select your verified domain
   - Click **Add API Key** → **Configure SMTP Integration**
   - Add a sender name (e.g. "CEAC Foundation School") → **Supabase Dashboard**
   - Supabase will open with SMTP already configured

---

## Option B: Manual SMTP Setup

Use this if you prefer to configure Supabase yourself.

### Step 1: Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to [resend.com/api-keys](https://resend.com/api-keys)
3. Click **Create API Key** → name it (e.g. "Supabase Auth") → copy the key

### Step 2: Verify Your Domain in Resend

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter your domain (e.g. `ceacfoundationschool.com` or `mail.ceacfoundationschool.com`)
4. Add the DNS records Resend shows (SPF, DKIM) at your domain registrar
5. Click **I've added the records** and wait for verification

> **Note:** You need a verified domain to send to real users. For testing, Resend may let you send to your own verified email only.

### Step 3: Configure Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. **Project Settings** (gear icon) → **Authentication** tab
4. Scroll to **SMTP Settings**
5. Toggle **Enable Custom SMTP** ON
6. Enter:

| Field | Value |
|-------|-------|
| **Sender email** | `noreply@yourdomain.com` (must use your verified domain) |
| **Sender name** | `CEAC Foundation School` (or similar) |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your Resend API key |

7. Click **Save**

### Step 4: Confirm Redirect URLs in Supabase

1. Still in **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs** (if not already there):
   - `https://ceacfoundationschool.com/reset-password`
   - `https://www.ceacfoundationschool.com/reset-password`
   - `http://localhost:5173/reset-password` (for local dev)

---

## Test It

1. Go to your app’s login page
2. Click **Forgot Password?**
3. Enter an email address that has an account
4. Click **Send Reset Link**
5. Check the inbox (and spam) for the reset email

---

## Troubleshooting

- **No email received:** Check Supabase **Logs → Auth** for errors
- **"Domain not verified":** Ensure DNS records for your domain are added and propagated
- **Still using Supabase email:** Confirm **Enable Custom SMTP** is ON and **Save** was clicked
