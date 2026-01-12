# EbookGov Master Runbook Tier 1

# EbookGov — Master Runbook (Tier 1)

## Checklist SOP for AVOXA (AZ Real Estate Voice Agent)

**Scope**: Tier 1 = Vapi inbound numbers directly + one number per brokerage + one Cal.com team per brokerage + round robin scheduling. [web:178]  
**Non-negotiables**: Brokerage context must be resolved at call start; Vapi variables must be set when the call is created; AZ-only property search enforced in code. [web:178][web:114]

---

## 0) Definitions (read once)

- **Avoxa**: Shared Vapi assistant used across all brokerages.
- **Brokerage front door**: A Vapi inbound phone number dedicated to a brokerage.
- **Server URL**: Vapi org-level webhook endpoint used for assistant-request and other events. [web:151]
- **Tier 1 scheduling**: Cal.com Team per brokerage + Round Robin event types.

---

## 1) Accounts & keys (setup)

- [ ] Create/confirm Vapi org + billing.
- [ ] Create/confirm Cal.com org + API key.
- [ ] Create/confirm Supabase project (Tier 1 shared project).
- [ ] Create/confirm email provider (SendGrid/Postmark/etc.).
- [ ] Store secrets in a secure secrets manager (never in repo).

---

## 2) Repo & environments (setup)

- [ ] Create mono-repo structure:
  - [ ] `/backend` (Server URL + Vapi tool endpoints)
  - [ ] `/docs` (runbooks, contracts, diagrams)
- [ ] Create environments:
  - [ ] `dev`
  - [ ] `staging`
  - [ ] `prod`
- [ ] Create env var templates:
  - [ ] `VAPI_API_KEY`
  - [ ] `CAL_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `EMAIL_PROVIDER_KEY`

---

## 3) Supabase schema (Tier 1)

**Goal**: All data in one database; every row scoped by `brokerage_id`.

- [ ] Create tables:
  - [ ] `brokerages`
  - [ ] `calls`
  - [ ] `leads`
  - [ ] `appointments`
  - [ ] `legal_queue`
- [ ] Create indexes (minimum):
  - [ ] `brokerages.inbound_phone_number` unique
  - [ ] `calls.brokerage_id, calls.started_at`
  - [ ] `appointments.brokerage_id, appointments.scheduled_time_utc`
- [ ] Add RLS policies (Tier 1):
  - [ ] Service role can read/write all.
  - [ ] Future: brokerage dashboards restricted by `brokerage_id`.

---

## 4) Cal.com configuration (per brokerage)

**Goal**: One team per brokerage; Tier 1 = round robin only.

For each brokerage:

- [ ] Create Cal.com Team.
- [ ] Add agents as team members.
- [ ] Create event types (minimum 2):
  - [ ] Buyer consult (15 min)
  - [ ] Showing (30 min)
  - [ ] (Optional) Listing consult (20 min)
- [ ] Set each event type to Round Robin.
- [ ] Record identifiers into `brokerages` table:
  - [ ] `cal_team_slug`
  - [ ] event type slugs (or IDs)

---

## 5) Vapi inbound numbers (per brokerage)

**Goal**: Vapi inbound numbers route dynamically via Server URL.

For each brokerage:

- [ ] Provision/import phone number in Vapi.
- [ ] Ensure the phone number has **no assistantId assigned** so Vapi sends an assistant-request to the Server URL. [web:178]
- [ ] Update `brokerages.inbound_phone_number` with the E.164 number.

Org-level:

- [ ] Set Vapi **Server URL** to your backend endpoint (staging then prod). [web:151]

---

## 6) Server URL handler (required)

**Goal**: Resolve brokerage from dialed number and return Avoxa + per-brokerage variables.

- [ ] Implement `/vapi/server-url` handler supporting:
  - [ ] `assistant-request` events (required for inbound dynamic assistant selection). [web:151][web:178]
  - [ ] transcript/status/end-of-call events (for logging). [web:151]

Assistant-request logic:

- [ ] Read `dialedNumber` (the inbound Vapi number that was called).
- [ ] Lookup `brokerage_id` by `inbound_phone_number`.
- [ ] If brokerage NOT found:
  - [ ] Return fallback assistant or response that ends call politely.
- [ ] If brokerage found:
  - [ ] Return `assistantId = Avoxa`
  - [ ] Return `assistantOverrides.variableValues` such as:
    - `brokerageName`
    - `brokerageDisclosureText`
    - `brochureUrl`
    - `calTeamSlug`
    - `eventTypeSlugShowing`, `eventTypeSlugBuyerConsult`
  - [ ] IMPORTANT: variables must be set at call creation; do not attempt to patch mid-call. [web:114]

---

## 7) Vapi tool endpoints (required)

**Goal**: Provide minimal tools needed for Tier 1.

Implement these HTTP endpoints (Vapi tool calls):

### A) searchListingsAZ(criteria)

- [ ] Enforce AZ-only:
  - [ ] Always send `state=AZ` (or equivalent)
  - [ ] Filter results to `state == "AZ"` before returning
- [ ] Return only fields needed for voice readout.

### B) bookAppointmentCal(...)

- [ ] Use Cal.com API v2 `POST /v2/bookings`. [web:54]
- [ ] Always set header `cal-api-version` (Cal.com warns it defaults to older versions if missing). [web:54]
- [ ] Book a **team** event type using `eventTypeSlug + teamSlug` OR `eventTypeId`. [web:54]
- [ ] Store `cal_booking_uid` in `appointments`.

### C) sendConfirmationEmail(...)

- [ ] Send email with:
  - [ ] Booking confirmation details
  - [ ] Brokerage brochure link
  - [ ] Assigned agent bio link
  - [ ] AI disclosure text
- [ ] Fire-and-forget; retry failures asynchronously.

### D) logCallAndDecisions(...)

- [ ] Persist transcript + call metadata to `calls`.
- [ ] Link to `brokerage_id`.

### E) flagForLegalReview(...)

- [ ] Create `legal_queue` record with reason codes + severity.
- [ ] Email the brokerage reviewer configured in `brokerages.legal_review_email`.

---

## 8) Avoxa prompt (Tier 1)

- [ ] First message includes AI disclosure (short, natural).
- [ ] Qualification flow:
  - [ ] location → timing → budget → pre-approval → must-haves
- [ ] Booking flow:
  - [ ] collect email (required for scheduling + brochure)
  - [ ] offer two slots
  - [ ] confirm booking
- [ ] Hard boundaries:
  - [ ] No legal advice; escalate/flag when needed.

---

## 9) Observability & safeguards (Tier 1)

- [ ] Add request IDs for every call and tool invocation.
- [ ] Log tool latency (p50/p95).
- [ ] Add rate limiting + basic spam heuristics per inbound number.
- [ ] Store a minimal end-of-call report.

---

## 10) End-to-end tests (must pass)

For each brokerage number:

- [ ] Call the number → confirm assistant-request hits your Server URL. [web:151][web:178]
- [ ] Confirm variables are correct (brokerage name/brochure).
- [ ] Run booking → confirm Cal.com booking created successfully (v2 + header). [web:54]
- [ ] Confirm confirmation email received.
- [ ] Confirm call + booking logged to Supabase.
- [ ] Trigger a legal-review phrase → confirm legal_queue + email.

---

## 11) Launch checklist (go-live)

- [ ] Promote Server URL from staging → prod.
- [ ] Confirm all brokerage numbers exist in prod and are mapped in `brokerages`.
- [ ] Confirm Cal.com team slugs/event slugs correct for each brokerage.
- [ ] Run 3 live test calls per brokerage.
- [ ] Enable daily error report (failed bookings, failed emails, missing brokerage lookups).

---

## 12) Premium hooks (do NOT build now)

- [ ] Custom routing (attributes/headless routing).
- [ ] Dedicated Supabase project per brokerage.
- [ ] Multiple numbers per brokerage (campaign tracking).
Chart
Code Interpreter Graph · v1

Chart
Code Interpreter Graph · v2

I created your checklist SOP runbook as EbookGov_Master_Runbook_Tier1.md and included a clean Tier‑1 flowchart you can paste into your IDE docs. This SOP is aligned with Vapi inbound routing via Server URL “assistant-request” events (used when a phone number has no assistantId) and with Cal.com API v2 booking requirements (including the cal-api-version header).
​

Downloadable runbook file
The runbook is ready as a Markdown file: /workspace/EbookGov_Master_Runbook_Tier1.md.

If you want, I can also generate a second version that is “engineer-first” (commands + code blocks) instead of checklist-first.

Tier 1 flowchart (paste into docs)
Use this image to orient the Antigravity Agent and engineers to the runtime path.

Tier 1 inbound call routing and booking flow (with fallback)
EbookGov_Master_Runbook_Tier1.md (checklist SOP)
text

# EbookGov — Master Runbook (Tier 1)

## Checklist SOP for AVOXA (AZ Real Estate Voice Agent)

**Scope**: Tier 1 = Vapi inbound numbers directly + one number per brokerage + one Cal.com team per brokerage + round robin scheduling. [web:178]  
**Non-negotiables**: Brokerage context must be resolved at call start; Vapi variables must be set when the call is created; AZ-only property search enforced in code. [web:178][web:114]

---

## 0) Definitions (read once)

- **Avoxa**: Shared Vapi assistant used across all brokerages.
- **Brokerage front door**: A Vapi inbound phone number dedicated to a brokerage.
- **Server URL**: Vapi org-level webhook endpoint used for assistant-request and other events. [web:151]
- **Tier 1 scheduling**: Cal.com Team per brokerage + Round Robin event types.

---

## 1) Accounts & keys (setup)

- [ ] Create/confirm Vapi org + billing.
- [ ] Create/confirm Cal.com org + API key.
- [ ] Create/confirm Supabase project (Tier 1 shared project).
- [ ] Create/confirm email provider (SendGrid/Postmark/etc.).
- [ ] Store secrets in a secure secrets manager (never in repo).

---

## 2) Repo & environments (setup)

- [ ] Create mono-repo structure:
  - [ ] `/backend` (Server URL + Vapi tool endpoints)
  - [ ] `/docs` (runbooks, contracts, diagrams)
- [ ] Create environments:
  - [ ] `dev`
  - [ ] `staging`
  - [ ] `prod`
- [ ] Create env var templates:
  - [ ] `VAPI_API_KEY`
  - [ ] `CAL_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `EMAIL_PROVIDER_KEY`

---

## 3) Supabase schema (Tier 1)

**Goal**: All data in one database; every row scoped by `brokerage_id`.

- [ ] Create tables:
  - [ ] `brokerages`
  - [ ] `calls`
  - [ ] `leads`
  - [ ] `appointments`
  - [ ] `legal_queue`
- [ ] Create indexes (minimum):
  - [ ] `brokerages.inbound_phone_number` unique
  - [ ] `calls.brokerage_id, calls.started_at`
  - [ ] `appointments.brokerage_id, appointments.scheduled_time_utc`
- [ ] Add RLS policies (Tier 1):
  - [ ] Service role can read/write all.
  - [ ] Future: brokerage dashboards restricted by `brokerage_id`.

---

## 4) Cal.com configuration (per brokerage)

**Goal**: One team per brokerage; Tier 1 = round robin only.

For each brokerage:

- [ ] Create Cal.com Team.
- [ ] Add agents as team members.
- [ ] Create event types (minimum 2):
  - [ ] Buyer consult (15 min)
  - [ ] Showing (30 min)
  - [ ] (Optional) Listing consult (20 min)
- [ ] Set each event type to Round Robin.
- [ ] Record identifiers into `brokerages` table:
  - [ ] `cal_team_slug`
  - [ ] event type slugs (or IDs)

---

## 5) Vapi inbound numbers (per brokerage)

**Goal**: Vapi inbound numbers route dynamically via Server URL.

For each brokerage:

- [ ] Provision/import phone number in Vapi.
- [ ] Ensure the phone number has **no assistantId assigned** so Vapi sends an assistant-request to the Server URL. [web:178]
- [ ] Update `brokerages.inbound_phone_number` with the E.164 number.

Org-level:

- [ ] Set Vapi **Server URL** to your backend endpoint (staging then prod). [web:151]

---

## 6) Server URL handler (required)

**Goal**: Resolve brokerage from dialed number and return Avoxa + per-brokerage variables.

- [ ] Implement `/vapi/server-url` handler supporting:
  - [ ] `assistant-request` events (required for inbound dynamic assistant selection). [web:151][web:178]
  - [ ] transcript/status/end-of-call events (for logging). [web:151]

Assistant-request logic:

- [ ] Read `dialedNumber` (the inbound Vapi number that was called).
- [ ] Lookup `brokerage_id` by `inbound_phone_number`.
- [ ] If brokerage NOT found:
  - [ ] Return fallback assistant or response that ends call politely.
- [ ] If brokerage found:
  - [ ] Return `assistantId = Avoxa`
  - [ ] Return `assistantOverrides.variableValues` such as:
    - `brokerageName`
    - `brokerageDisclosureText`
    - `brochureUrl`
    - `calTeamSlug`
    - `eventTypeSlugShowing`, `eventTypeSlugBuyerConsult`
  - [ ] IMPORTANT: variables must be set at call creation; do not attempt to patch mid-call. [web:114]

---

## 7) Vapi tool endpoints (required)

**Goal**: Provide minimal tools needed for Tier 1.

Implement these HTTP endpoints (Vapi tool calls):

### A) searchListingsAZ(criteria)

- [ ] Enforce AZ-only:
  - [ ] Always send `state=AZ` (or equivalent)
  - [ ] Filter results to `state == "AZ"` before returning
- [ ] Return only fields needed for voice readout.

### B) bookAppointmentCal(...)

- [ ] Use Cal.com API v2 `POST /v2/bookings`. [web:54]
- [ ] Always set header `cal-api-version` (Cal.com warns it defaults to older versions if missing). [web:54]
- [ ] Book a **team** event type using `eventTypeSlug + teamSlug` OR `eventTypeId`. [web:54]
- [ ] Store `cal_booking_uid` in `appointments`.

### C) sendConfirmationEmail(...)

- [ ] Send email with:
  - [ ] Booking confirmation details
  - [ ] Brokerage brochure link
  - [ ] Assigned agent bio link
  - [ ] AI disclosure text
- [ ] Fire-and-forget; retry failures asynchronously.

### D) logCallAndDecisions(...)

- [ ] Persist transcript + call metadata to `calls`.
- [ ] Link to `brokerage_id`.

### E) flagForLegalReview(...)

- [ ] Create `legal_queue` record with reason codes + severity.
- [ ] Email the brokerage reviewer configured in `brokerages.legal_review_email`.

---

## 8) Avoxa prompt (Tier 1)

- [ ] First message includes AI disclosure (short, natural).
- [ ] Qualification flow:
  - [ ] location → timing → budget → pre-approval → must-haves
- [ ] Booking flow:
  - [ ] collect email (required for scheduling + brochure)
  - [ ] offer two slots
  - [ ] confirm booking
- [ ] Hard boundaries:
  - [ ] No legal advice; escalate/flag when needed.

---

## 9) Observability & safeguards (Tier 1)

- [ ] Add request IDs for every call and tool invocation.
- [ ] Log tool latency (p50/p95).
- [ ] Add rate limiting + basic spam heuristics per inbound number.
- [ ] Store a minimal end-of-call report.

---

## 10) End-to-end tests (must pass)

For each brokerage number:

- [ ] Call the number → confirm assistant-request hits your Server URL. [web:151][web:178]
- [ ] Confirm variables are correct (brokerage name/brochure).
- [ ] Run booking → confirm Cal.com booking created successfully (v2 + header). [web:54]
- [ ] Confirm confirmation email received.
- [ ] Confirm call + booking logged to Supabase.
- [ ] Trigger a legal-review phrase → confirm legal_queue + email.

---

## 11) Launch checklist (go-live)

- [ ] Promote Server URL from staging → prod.
- [ ] Confirm all brokerage numbers exist in prod and are mapped in `brokerages`.
- [ ] Confirm Cal.com team slugs/event slugs correct for each brokerage.
- [ ] Run 3 live test calls per brokerage.
- [ ] Enable daily error report (failed bookings, failed emails, missing brokerage lookups).

---

## 12) Premium hooks (do NOT build now)

- [ ] Custom routing (attributes/headless routing).
- [ ] Dedicated Supabase project per brokerage.
- [ ] Multiple numbers per brokerage (campaign tracking).
If you want me to save this into your workspace
Tell me whether you want:

a /workspace/docs/ folder convention, or

keep everything at /workspace/ root.
