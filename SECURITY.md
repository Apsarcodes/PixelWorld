# PixelWorld Application Security Architecture & Checklist

## 1. Security Principles & Architecture

PixelWorld is designed with **Defense in Depth** and **Zero Trust** principles across every layer:

1. **Authentication & Session Security:**
   - Payload Native Auth with Argon2id / bcrypt password hashing.
   - Sessions issued via HTTP-only, secure, `SameSite=Lax` cookies to prevent XSS credential theft.
   - Brute-force protection: in-memory sliding window rate limiting on auth endpoints (max 10 login attempts per 15 min; max 5 signups per hour per IP) + account lockouts (max 5 consecutive failed attempts).
   - Strict password complexity validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number).

2. **Authorization & Multi-Tenant Data Isolation:**
   - Strict Role-Based Access Control (RBAC): `Visitor`, `Advertiser`, `Organization Member`, `Organization Owner`, `Moderator`, `Admin`, `Super Admin`.
   - All tenant resources (campaigns, creatives, reservations, invoices, transactions) are strictly isolated by `organizationId`.
   - Server-side enforcement: Collection-level access policies (`organizationScopedAccess`) verify tenancy on every read/write query.
   - Insecure Direct Object Reference (IDOR) protection: User-supplied document IDs are always validated against active organization membership.

3. **Input Validation & Sanitization:**
   - Whitelist validation for all API inputs (sizes, dates, status enums, text lengths).
   - Strict parameter boundary checking (preventing Prototype Pollution, SQL Injection, and NoSQL Injection).
   - Zero-trust URL schema validation for campaign destination URLs (only `https://` and `http://` allowed; strictly blocking `javascript:`, `file:`, `data:`).
   - HTML stripping on user inputs (`sanitizeString`) to prevent stored and reflected XSS.

4. **File Upload Security (Media):**
   - Whitelist restricted MIME types: strictly `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
   - Executables and dangerous vector files (SVG with scripts) are rejected.
   - Max file size limits enforced on server (10MB per creative).
   - Filenames sanitized with safe alphanumeric replacement.

5. **Payment Security (YouPI-PG ONLY):**
   - **Zero Client-Side Trust:** Campaign publishing and reservation confirmation are strictly driven by verified server-side events, NEVER client callbacks.
   - Cryptographic HMAC-SHA256 signature verification on all incoming payment webhooks (`X-Gateway-Signature: sha256=...`).
   - Anti-Replay: Timestamp freshness window enforcement (tolerance: 2 hours for webhook retries with duplicate delivery ID deduplication).
   - Idempotent transaction processing via `idempotencyKey` and database unique constraints.
   - Server-Side Price Calculation: `paymentService.calculatePrice` calculates total based on slot size, duration, and GST (18%). Client cannot manipulate amounts.
   - Decoupled abstraction layer: `PaymentProvider` interface implemented by `YoupiPaymentProvider`.

6. **Network & HTTP Security Headers:**
   - `Content-Security-Policy` (CSP)
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
   - `Strict-Transport-Security` (HSTS) in production

---

## 2. Security Checklist & Audit Log

| Control Item | Requirement | Verification Method | Status | Verified On |
| :--- | :--- | :--- | :--- | :--- |
| **Secrets Management** | No secrets in Git history; `.env*` ignored in `.gitignore` | `grep` regex scan + git index audit | **PASSED** | Phase 1 & 2 |
| **Auth Brute-Force** | Rate limiting on `/api/app-auth/login` & `/signup` | Sliding-window limiter unit test | **PASSED** | Phase 2 |
| **Password Policy** | Min 8 chars, uppercase, lowercase, digit validation | Regex complexity test | **PASSED** | Phase 2 |
| **Session Cookies** | `httpOnly`, `secure`, `sameSite: 'lax'`, partitioned | `src/lib/app-auth.ts` cookie audit | **PASSED** | Phase 2 |
| **Media Uploads** | Restrict MIME types to safe raster images (`jpeg`, `png`, `webp`, `gif`) | Upload filter test & collection config | **PASSED** | Phase 2 |
| **HTTP Headers** | Security headers in `next.config.ts` | Config inspection & build validation | **PASSED** | Phase 2 |
| **Type Safety** | No TypeScript build bypasses (`ignoreBuildErrors`) | `tsc --noEmit` full compilation | **PASSED** | Phase 2 & 3 |
| **Payment Signature** | HMAC-SHA256 cryptographic verification for YouPI-PG webhooks | `crypto.timingSafeEqual` unit audit | **PASSED** | Phase 5 |
| **Replay Protection** | Webhook timestamp freshness window check | Tolerance window enforcement | **PASSED** | Phase 5 |
| **Price Tampering** | Server-side calculation of campaign fees & GST | `PaymentService.calculatePrice` | **PASSED** | Phase 5 |
| **Idempotency** | Prevent duplicate charge processing on webhook retries | Unique orderId and idempotency keys | **PASSED** | Phase 5 |
