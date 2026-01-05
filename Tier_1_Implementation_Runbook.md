# Avoxa Tier 1 Implementation Runbook

This document outlines the step-by-step implementation plan for the Avoxa AI Real Estate Voice Agent MVP, incorporating safeguards against the Supabase API limitations and potential launch bottle-necks identified during research.

## 1. Supabase Infrastructure Setup (Launch Safeguards)

### A. Custom SMTP Configuration (CRITICAL)

**Problem**: Default Supabase email limits (3/hour) will block user signups on launch.

- [ ] Sign up for an email provider (Resend, Postmark, or SendGrid).
- [ ] Navigate to **Project Settings > Auth > SMTP Settings** in Supabase.
- [ ] Enable "Custom SMTP" and enter the provider credentials.
- [ ] Verify the sender email.

### B. Database Hardening & RLS

- [ ] Create the `brokerages` table (see `Brokerage_Config_Schema.md`).
- [ ] Create the `calls` and `appointments` tables.
- [ ] **Action**: Enable Row Level Security (RLS) on ALL tables.
- [ ] **Action**: Add indexes for `brokerage_id` on all tables to prevent full table scans and CPU spikes.

### C. Rate Limit Monitoring

- [ ] If using Edge Functions for the tool backend, implement a simple rate limiter or use the `X-RateLimit` headers to gracefully handle 429 errors.

---

## 2. Tool Backend (Node.js/Vercel)

### A. Webhook Architecture

Implement the following endpoints to handle Vapi tool calls:

- `POST /tools/search-listings`: Queries RentCast MLS API.
- `POST /tools/book-appointment`: Interacts with Cal.com v2 API.
- `POST /tools/log-call`: Writes audit logs to Supabase.
- `POST /tools/flag-review`: Triggers the legal review workflow.

### B. Error Handling

- Use try/catch blocks for all external API calls (RentCast, Cal.com).
- Return clear JSON errors to Vapi so the assistant can apologize gracefully: "I'm having trouble checking the calendar right now, one moment..."

---

## 3. Vapi Assistant Configuration

### A. Integration

- [ ] Create a "Server URL" in Vapi pointing to your backend.
- [ ] Configure the `Transcription`, `LLM`, and `TTS` providers as per the Vision doc (AssemblyAI, GPT-4o, ElevenLabs).

### B. Prompt Injection Protection

- [ ] Add a system instruction to never reveal internal API keys or database structures to the caller.
- [ ] Sanitize all inputs from the caller before passing them to the `search-listings` tool.

---

## 4. Launch Day Checklist

- [ ] **Warm-up**: Run 5 test calls to ensure all tools (Cal.com, RentCast, Supabase) are responding <1s.
- [ ] **Monitoring**: Open the Supabase Dashboard "Reports" tab to monitor Database CPU and API Latency.
- [ ] **Kill Switch**: Have a way to disable specific tools or the entire agent in Vapi if a major exploit is discovered.
