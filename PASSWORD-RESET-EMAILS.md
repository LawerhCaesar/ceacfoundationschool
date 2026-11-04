# Password Reset Email Troubleshooting

When reset emails don't arrive or only sometimes work, check these:

## 1. Supabase rate limits (most common)

**Supabase’s built‑in email provider has a very low limit** (about 2 auth emails per hour for signup + password reset + email change combined).

- **Fix:** Set up **custom SMTP** with Resend. **Setup guide:** [SETUP-RESEND-SMTP.md](./SETUP-RESEND-SMTP.md)
- Use a provider like SendGrid, Resend, or your domain’s SMTP
- This also improves deliverability and reduces spam issues

## 2. Redirect URL configuration

The reset link must point to a URL allowed in your Supabase project.

- **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**
- Add:
  - `https://ceacfoundationschool.com/reset-password`
  - `https://www.ceacfoundationschool.com/reset-password` (if you use www)
  - `http://localhost:5173/reset-password` (for local dev)

## 3. Spam / filters

- Ask users to check spam/junk
- Emails from `@supabase.io` often end up in spam
- Custom SMTP with your own domain usually delivers better

## 4. Auth logs

- **Supabase Dashboard → Logs → Auth**
- Look for failed send attempts or rate limit messages
