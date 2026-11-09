# PixelWorld Application Security Architecture & Checklist

## 1. Security Principles & Architecture

PixelWorld is designed with **Defense in Depth** and **Zero Trust** principles across every layer:

1. **Authentication & Session Security:**
   - Payload Native Auth with Argon2id / bcrypt password hashing.
   - Sessions issued via HTTP-only, secure, `SameSite=Lax` cookies to prevent XSS credential theft.
   - Brute-force protection: rate limiting on auth endpoints + account lockouts (max 5 consecutive failed attempts).
   - Strict password complexity validation (min 8 chars, uppercase, lowercase, numbers/symbols).

2. **Authorization & Multi-Tenant Data Isolation:**
   - Strict Role-Based Access Control (RBAC): `Visitor`, `Advertiser`, `Organization Member`, `Organization Owner`, `Moderator`, `Admin`, `Super Admin`.
   - All tenant resources (campaigns, creatives, reservations, invoices, transactions) are strictly isolated by `organizationId`.
   - Server-side enforcement: Collection-level access policies (`organizationScopedAccess`) verify tenancy on every read/write query.
   - Insecure Direct Object Reference (IDOR) protection: User supplied document IDs are always validated against active organization membership.

3. **Input Validation & Sanitization:**
   - Whitelist validation for all API inputs (sizes, dates, status enums, text lengths).
   - Strict parameter boundary checking (preventing Prototype Pollution, SQL Injection, and NoSQL Injection).
   - Zero-trust URL schema validation for campaign destination URLs (only `https://` allowed; blocking `javascript:`, `file:`, `data:`).

4. **File Upload Security (Media):**
   - Whitelist restricted MIME types: strictly `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
   - SVG vector files containing executable `<script>` or event handlers are rejected or rendered in sandboxed isolation.
   - Max file size limits enforced on server (5MB per creative).
   - File content / magic number validation to prevent executable polyglots.

5. **Payment Security (YouPI-PG):**
   - **Zero Client-Side Trust:** Campaign publishing and reservation confirmation are strictly driven by verified server-side events, NEVER client callbacks.
   - Cryptographic HMAC-SHA256 signature verification on all incoming payment webhooks (`X-Gateway-Signature: sha256=...`).
   - Anti-Replay: Timestamp freshness window enforcement (tolerance: 2 hours for webhook retries with duplicate ID deduplication).
   - Idempotent transaction processing via `idempotencyKey` and database unique constraints.
   - Price calculation occurs strictly on the server based on slot dimensions, duration, and city base rates. Client cannot manipulate amounts.

6. **Network & HTTP Security Headers:**
   - `Content-Security-Policy` (CSP)
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
   - `Strict-Transport-Security` (HSTS) in production

---

## 2. Security Checklist for Development & Releases

| Category | Control Item | Status | Verified By |
| :--- | :--- | :--- | :--- |
| **Secrets** | No hardcoded API keys, tokens, or private credentials in code | PASS | AppSec Scan |
| **Secrets** | `.env*` files excluded in `.gitignore` (`.env.example` safe) | PASS | Config Review |
| **Auth** | Passwords hashed securely; no plaintext passwords stored/logged | PASS | Payload Auth |
| **Auth** | Cookies configured with `httpOnly`, `secure`, `sameSite: 'lax'` | PASS | Cookie Config |
| **Tenancy** | Organization-scoped access control on campaigns & payments | PASS | Access Policies |
| **Uploads** | Strict image MIME type whitelist & file size limits | PASS | Upload Config |
| **Payments** | Server-side price calculation; client amount manipulation blocked | PASS | Payment Engine |
| **Payments** | HMAC-SHA256 signature & timestamp freshness verification on webhooks | PASS | Webhook Engine |
| **Payments** | Idempotency keys enforced on payment creations & state transitions | PASS | DB Schema |
| **XSS** | All user-supplied text rendered via React escape or sanitized | PASS | Frontend Audit |
| **Headers** | Security headers configured in Next.js config | PASS | Next Config |
| **Admin** | Admin & Moderation APIs protected with role verification | PASS | Role Guards |
