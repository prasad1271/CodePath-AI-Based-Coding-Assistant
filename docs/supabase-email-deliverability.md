# Supabase Email Deliverability & Bounce Rate Resolution Guide

## 1. Problem Root Cause Analysis

### Why Did Supabase Send the Warning?
Your Supabase project `zwagbbmxckiinpacawkr` received this warning:
> *"Our system has detected a high rate of bounced emails from your Supabase project (zwagbbmxckiinpacawkr) transactional emails."*

**The root cause is a combination of two factors:**
1. **Default "Confirm email" was enabled in Supabase:**
   Every time someone registered on the platform (`supabase.auth.signUp()`), Supabase automatically attempted to dispatch an email verification message using its default shared pool (via AWS SES / Mailgun).
2. **Test / Placeholder email signups during development:**
   When developers or evaluators tested user registration using dummy emails (such as `student@college.edu`, `test@example.com`, or typo domains), these destination domains either do not exist or reject incoming mail. This triggers **hard bounces (550 User Unknown / Host Not Found)**.
3. **Strict SES Bounce Thresholds:**
   Cloud transactional providers enforce strict reputation limits: a bounce rate exceeding **5%** triggers warnings, and **>10%** risks temporary sending suspension.

---

## 2. Immediate Resolution (Stops Bounces Instantly)

### Option A: Disable "Confirm Email" (Recommended for Development & Fast Onboarding)
If you do not strictly require students to click an email verification link before logging in, turn off email confirmations:

1. Open the [Supabase Auth Settings for Project zwagbbmxckiinpacawkr](https://supabase.com/dashboard/project/zwagbbmxckiinpacawkr/settings/auth).
2. Scroll to the **Email Auth** section.
3. Look for **"Confirm email"**.
4. **Toggle "Confirm email" to OFF** (Disabled) and click **Save**.

**What this does immediately:**
- Signups no longer trigger outgoing emails from Supabase's shared SMTP pool.
- Registered users are instantly verified and directed immediately into `/onboarding` and `/dashboard`.
- **Your bounce rate immediately drops to 0%**, preventing any restriction on your Supabase project.

---

## 3. Production Resolution: Set Up a Custom SMTP Provider

Supabase’s default email service is shared across thousands of free projects and has severe rate limits (3-30 emails/hour). For production, Supabase officially requires configuring a **Custom SMTP Provider**.

### Recommended Provider: Resend (Free 3,000 emails/month)
1. Sign up for free at [Resend.com](https://resend.com).
2. In Resend, generate an API Key (e.g., `re_abc123...`).
3. Add your sending domain (e.g., `codepath.dev` or `yourdomain.com`) and verify DNS records (DKIM/SPF).
4. Go to your [Supabase Project Auth Settings](https://supabase.com/dashboard/project/zwagbbmxckiinpacawkr/settings/auth).
5. Scroll down to **SMTP Settings** and toggle **"Enable Custom SMTP"** to **ON**.
6. Enter the following parameters:
   - **Sender email:** `noreply@yourdomain.com` (or `onboarding@resend.dev` for testing)
   - **Sender name:** `CodePath Support`
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (SSL) or `587` (TLS)
   - **Minimum Version:** `TLS v1.2`
   - **User:** `resend`
   - **Password:** `[Your Resend API Key]`
7. Click **Save**.

**Benefits of Custom SMTP:**
- All emails send from your dedicated, verified domain.
- Completely decouples your project from Supabase's shared pool bounce penalties.
- Unlimited, high-speed transactional email delivery with full analytics.

---

## 4. Safeguards Added to the Codebase

To protect your Supabase project from future bounce spikes, the following safeguards are implemented in the frontend:

1. **Dummy & Placeholder Domain Blacklist (`register/page.tsx`, `forgot-password/page.tsx`):**
   - Blocks placeholder registrations with `@example.com`, `@test.com`, `@college.edu`, `@fake.com`, `@tempmail.com`, etc.
   - Instructs users to use their real email or use instant demo mode.

2. **Common Typo Detection:**
   - Detects unintentional typos like `@gamil.com`, `@outlok.com`, `@hotmial.com`, or `@yaho.com` and warns the user before submission.

3. **Instant Demo Access Button:**
   - Evaluators and developers can click **"Instant Demo Access"** on both `/login` and `/register` to test the full application without creating dummy accounts that fire real transactional emails.

4. **Confirmation State Awareness (`AuthContext.tsx`):**
   - If Supabase has email confirmation enabled, the UI detects `needsEmailConfirmation` and advises the user accordingly rather than failing silently.
