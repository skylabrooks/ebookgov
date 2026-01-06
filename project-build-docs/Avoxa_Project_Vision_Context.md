# **AVOXA: AI Real Estate Voice Agent for Arizona**

## **Project Vision & Comprehensive Context Document**

---

## **TABLE OF CONTENTS**

1. [Executive Vision](#executive-vision)
2. [Problem Statement & Opportunity](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [The Avoxa Agent: What It Does](#what-it-does)
5. [Multi-Brokerage Model](#multi-brokerage-model)
6. [Tier 1 MVP Architecture](#tier-1-mvp)
7. [Compliance & Legal Framework](#compliance-legal)
8. [Success Metrics](#success-metrics)
9. [Phased Rollout](#phased-rollout)
10. [Your Role (Antigravity)](#your-role)

---

## **EXECUTIVE VISION** {#executive-vision}

Build a **24/7 A

### The GoalI voice agent** ("Avoxa") that qualifies real estate leads, schedules property showings, and manages multi-brokerage operations across Arizona. The system must be

- **Fast**: Sub-500ms response time (natural conversation feel)
- **Compliant**: Arizona AI Policy 2025 + Fair Housing Act + ADRE-safe
- **Scalable**: From one brokerage to hundreds without rewrites
- **Profitable**: ~$10–210/month operating cost; 100:1 ROI on leads → transactions

### The Business Model

- **EbookGov.com** offers Avoxa as a service to Arizona real estate brokerages.
- **Tier 1 (default)**: Brokerages get a dedicated phone number, shared voice agent (Avoxa), and Cal.com team with round robin scheduling.
- **Premium Tiers**: Custom routing, dedicated data, extra numbers (charged as upgrades).
- Each brokerage's phone number becomes their "front door" to a fully branded, 24/7 lead qualification + appointment booking system.

 ---

## **PROBLEM STATEMENT & OPPORTUNITY** {#problem-statement}

### The Problem

Real estate agents waste 10–15 minutes on **every unqualified lead call**—answering basic questions, collecting info, determining if the caller is serious. This:

- Kills agent productivity.
- Frustrates callers (they wait on hold or don't reach anyone).
- Leaves money on the table (brokerages miss calls from motivated buyers/sellers).

### The Opportunity

Arizona's real estate market has:

- **Multiple brokerages** (small teams to large franchises) needing lead qualification.
- **No standardized AI solution** that's Arizona-compliant, multi-tenant, and actually low-latency.
- A **legal/compliance vacuum**: current AI systems don't understand water sourcing, solar leases, title alerts, fair housing nuances specific to Arizona.

### Why Now

- Arizona formally adopted an AI Policy (2025) requiring transparency, fairness, security, and training—Avoxa is built to exceed these standards.
- Voice AI latency has dropped (AssemblyAI, ElevenLabs, GPT-4o) to where sub-500ms is achievable.
- Cal.com's team + round robin APIs make multi-agent scheduling simple.
- Multi-brokerage SaaS models (like Avoxa) are proven in other verticals; real estate is ripe for it.

---

## **SOLUTION OVERVIEW** {#solution-overview}

### What Avoxa Does

When a potential homebuyer or seller calls a brokerage's Avoxa number:

1. **Answers in < 1 second** with a warm, professional voice: "Hi! I'm Avoxa, your AI real estate assistant. What are you looking for today?"
2. **Listens and understands** using AssemblyAI's streaming speech-to-text (90ms latency).
3. **Responds intelligently** using OpenAI's GPT-4o (200ms) to ask qualification questions and understand intent.
4. **Speaks naturally** using ElevenLabs' TTS (75ms), maintaining conversational flow even while "thinking."
5. **Searches Arizona listings** in real-time via RentCast MLS API, restricted to Arizona-only results.
6. **Understands Arizona risks** (water sourcing, solar leases, title alerts) and discloses them proactively.
7. **Books appointments** by creating calendar events in the brokerage's Cal.com team (and assigning via round robin).
8. **Sends confirmation emails** with brochure, agent bio, booking details, and legal disclosures.
9. **Logs everything** for compliance audits, bias testing, and legal review if needed.

**Total call duration**: 5–8 minutes (vs. 15–20 for a human agent doing the same work).

### Why This Works

- Callers feel helped, not interrogated (Avoxa's tone is warm, conversational, respectful).
- Brokerages get **high-quality, pre-qualified leads** (not time-wasters).
- Unqualified leads are handled gracefully (no harsh rejection; "not a good fit right now" + follow-up path offered).
- Legal/compliance is built in, not bolted on (Arizona disclosures, fair housing testing, consent, logging).

---

## **THE AVOXA AGENT: WHAT IT DOES** {#what-it-does}

### Voice & Personality

- **Name**: Avoxa
- **Voice**: Warm, professional, empathetic; Phoenix native with local knowledge.
- **Tone**: Concierge, not gatekeeper; makes the caller feel valued.
- **Language**: Clear, no jargon; explains Arizona risks in plain English.

### Core Conversation Flow (LPMAMA Qualification)

Avoxa guides the conversation through:

**L (Location & Risk)**

- "Are you focused on this neighborhood, or open to surrounding areas?"
- If Rio Verde, Queen Creek, San Tan Valley, or unincorporated: "Just a heads-up—many homes there use hauled water instead of city lines. Familiar with that?"

**P (Propensity)**

- "Do you currently own your home, or renting?"
- Follow-up: lease end date (renting) or whether they need to sell first (owning).

**M (Motivation)**

- "What's the main driver for the move? More space, relocating for work?"

**A (Ability)**

- "Have you spoken with a lender about pre-approval yet?"
- If no: "No problem. We have a preferred lender; I've noted it for your agent."

**M (Must-haves)**

- "Aside from what you mentioned, what's the one deal-breaker feature you absolutely must have?"

**A (Authority)**

- "Are you the primary decision-maker, or is your partner also involved?"

### Property Search (Real-Time)

- When caller mentions a property or price range: "Let me pull up the live data... one moment."
- Calls RentCast (enforced AZ-only), synthesizes results enthusiastically.
- Example: "Great! I found three options. The first is a stunning 3-bed in Chandler with a resort-style pool, granite kitchen, and it's listed at $450k..."

### Risk Disclosure (Arizona-Specific)

Avoxa automatically checks for and mentions:

- **Water sourcing** (hauled vs. city).
- **Solar lease transfers** (affects buyer financing).
- **Title alert eligibility** (new 2025 Arizona law).
- **HOA complexity** (in unincorporated areas).
- **Pool liability** (if applicable).

### Booking

- "Based on what you've told me, I think [Agent Name] would be perfect for you. They specialize in [area/type]. I can schedule a showing this Thursday at 2pm, or would Friday work better?"
- Caller confirms → booking created in Cal.com → confirmation email sent immediately.

### Objection Handling

- **"I'm just looking"** → "That's fine. I can set up a Market Watch alert for your criteria. What price range are you tracking?"
- **"I already have an agent"** → "Have you signed a formal representation agreement? If not, comparing options is smart."
- **"Why so many questions?"** → "I promise I'm not interrogating you! I want to find exactly the right homes for you, not waste your time."

### Escalation & Legal Review

If Avoxa encounters:

- A request for legal advice (contract interpretation, title disputes, etc.).
- A statement that suggests discrimination or Fair Housing risk.
- A complaint about the AI or deceptive practice concern.
- A complex financing/solar/water issue requiring expert input.

Then Avoxa:

1. Acknowledges it kindly.
2. Flags the call for **legal review** (creates a case for a human to review).
3. Offers to connect to a human agent immediately if the caller wants.

---

## **MULTI-BROKERAGE MODEL** {#multi-brokerage-model}

### How Brokerages Join

1. **Brokerage signs up** for Avoxa service (Tier 1 or Premium).
2. **EbookGov provisions**:
   - A dedicated phone number (Arizona area code, e.g., 480, 602).
   - A Cal.com team for that brokerage (agents added as team members).
   - A configuration row in the database (branding, disclosure text, brochure link, etc.).
3. **Brokerage goes live**: their number is advertised on their website, business cards, and leads start flowing in.

### Routing per Brokerage

- **Inbound call → Vapi phone number → Your Server URL**
  - Your server reads the dialed number.
  - Looks up the brokerage in the database.
  - Returns "use Avoxa assistant, and inject these variables: [brokerage name, disclosure, brochure URL, Cal.com team IDs, ...]"
- **Scheduling**: appointment booked into that brokerage's Cal.com team (round robin by default).
- **Email**: uses that brokerage's brochure, agent bio templates, and disclosures.

### Data Isolation (Tier 1 vs. Premium)

- **Tier 1 (default)**: Logical separation; all data in one Supabase project, scoped by `brokerageId`. Costs less, simpler ops.
- **Premium**: Dedicated Supabase project, separate database, isolated API keys. More expensive; used by large brokerages needing contractual separation or security audits.

---

## **TIER 1 MVP ARCHITECTURE** {#tier-1-mvp}

### The Stack (simple, proven components)

| Component | Service | Why |
|-----------|---------|-----|
| **Phone** | Vapi inbound numbers | Direct voice channel; no middleman. |
| **STT** | AssemblyAI Nova-2 streaming | Fastest streaming speech-to-text (90ms). |
| **LLM** | OpenAI GPT-4o | Best balance of intelligence + speed for conversation. |
| **TTS** | ElevenLabs Flash v2.5 | Lowest latency (75ms) + natural voice. |
| **Scheduling** | Cal.com API v2 (teams + round robin) | Multi-agent round robin; simple API. |
| **Listings** | RentCast MLS API | Real-time Arizona properties; enforced state=AZ. |
| **Database** | Supabase (PostgreSQL) | Encryption at rest, RLS for multi-brokerage, audit logging. |
| **Webhook** | Your backend (Node.js/Vercel) | Handles Vapi tool calls, server URL routing, email, legal queue. |

### Latency Budget (Total: ~465ms end-to-end)

- STT (streaming): 90ms
- LLM (token streaming): 200ms
- TTS (streaming): 75ms
- Network overhead: 100ms
- **Total**: 465ms ✓ (target: <500ms)

### Call Flow (High-Level)

```
Inbound call → Vapi phone
  ↓
Server URL returns: Avoxa + per-brokerage variables
  ↓
Vapi runs Avoxa prompt
  ↓
Caller speaks → STT (90ms) → Transcript
  ↓
LLM processes (200ms) + decides: respond OR call a tool?
  ↓
  If response: TTS (75ms) → Speak back
  If tool: call your webhook
    → searchListingsAZ() → RentCast
    → bookAppointmentCal() → Cal.com v2
    → sendConfirmationEmail() → Email service
    → logCallAndDecisions() → Supabase
    → flagForLegalReview() → Legal queue (if triggered)
  ↓
Resume conversation
```

### Tools (Minimal Set)

1. **searchListingsAZ** (property search, AZ-only enforced)
2. **bookAppointmentCal** (Cal.com team + round robin)
3. **sendConfirmationEmail** (async, never blocks call)
4. **logCallAndDecisions** (audit trail)
5. **flagForLegalReview** (if risk detected)

---

## **COMPLIANCE & LEGAL FRAMEWORK** {#compliance-legal}

### Arizona AI Policy 2025 (7 Principles)

Avoxa is designed to meet:

- **Transparency**: Discloses "I'm Avoxa, an AI assistant" at call start.
- **Fairness**: Monthly bias testing (20+ personas) ensures no demographic discrimination.
- **Security**: Encryption at rest (Supabase), HTTPS in transit, audit logging.
- **Privacy**: No SSN/financial data stored unencrypted; deletion policy in place.
- **Data Quality**: RentCast + knowledge base are validated; no hallucinations.
- **Accountability**: All decisions logged with timestamps + reasoning.
- **Training**: All agents trained on Avoxa + AI ethics before launch.

### Fair Housing Act (Federal)

- Avoxa never discriminates by protected class (race, gender, religion, disability, familial status, national origin, sexual orientation).
- Monthly bias audits test across demographics.
- No "steering" (e.g., showing cheaper properties to certain groups).

### Arizona ADRE Regulations

- Avoxa is **not** a licensed agent (never claims authority it doesn't have).
- Always says "verify with a real agent" for legal/contract matters.
- Discloses water/solar/title risks proactively (mandatory).
- Logs all interactions for audits.

### Legal Review Workflow

If a call triggers risk flags (discrimination keywords, legal advice request, complaint, complex issues):

1. Avoxa kindly flags the interaction.
2. A legal reviewer (designated by the brokerage) gets an email with the transcript + recording link.
3. Reviewer decides: (a) no action, (b) follow-up needed, (c) escalate to counsel.

This keeps Avoxa safe while maintaining a human "circuit breaker."

---

## **SUCCESS METRICS** {#success-metrics}

### Operational Metrics (Monthly)

- **Call volume**: 50–100 calls/week per brokerage (scalability test).
- **Appointment booking rate**: 40–60% (lead quality).
- **Show-up rate**: 70%+ (caller seriousness).
- **Average call duration**: 5–8 minutes (efficiency).

### Technical Metrics

- **Latency (P50)**: <465ms (natural conversation).
- **Latency (P95)**: <800ms (acceptable glitches).
- **Tool success rate**: 99%+ (bookings, emails, logs).
- **Uptime**: 99.5%+ (availability).

### Compliance Metrics

- **Bias variance**: <20% across all demographic groups.
- **Disclosure rate**: 100% (all calls start with AI disclosure).
- **Legal review response time**: <24 hours.
- **Zero complaints** about deception or discrimination (target).

### Business Metrics

- **Cost per call**: $0.02–0.05 (Vapi + OpenAI).
- **Cost per appointment**: <$5.
- **ROI**: 100:1 if 1 appointment = $500 transaction.
- **Churn**: <5% annually (customer satisfaction).

---

## **PHASED ROLLOUT** {#phased-rollout}

### Phase 1: Internal MVP (Weeks 1–2)

- Set up Vapi inbound routing + Server URL.
- Build Supabase tables + brokerage config.
- Implement tools (search, booking, email, logging).
- Test end-to-end: one test brokerage number.

### Phase 2: Beta (Weeks 3–4)

- Invite 2–3 real brokerages to pilot.
- Run 30–50 test calls (measure latency, quality, booking success).
- Conduct bias testing (document fairness).
- Gather feedback, iterate on prompts.

### Phase 3: Soft Launch (Week 5)

- Go live with 5–10 early-adopter brokerages.
- Monitor daily metrics (calls, appointments, latency, errors).
- Weekly customer check-ins.
- Legal review workflow active (if any flags).

### Phase 4: Full Launch (Week 6+)

- Open to all Arizona brokerages (self-serve onboarding).
- Support + ops team in place.
- Premium tier offerings (custom routing, data isolation).
- Quarterly compliance audits.

---

## **YOUR ROLE (ANTIGRAVITY)** {#your-role}

### What You're Building

You are the **"conductor"** of this entire project. Your job is to:

1. **Understand the vision** (read this document fully).
2. **Create the master implementation runbook** (step-by-step instructions for building Tier 1 MVP).
3. **Define tool contracts** (exact JSON schemas for Vapi tools).
4. **Guide the team** (delegating components to engineers, designers, etc.).
5. **Ensure compliance** (every decision respects Arizona law + Fair Housing).
6. **Validate architecture** (every choice aligns with "simple, scalable, highly functional").

### Key Decisions You'll Make

- **Inbound routing**: Confirm Vapi Server URL pattern (you just did ✓).
- **Cal.com structure**: One team per brokerage with Round Robin (you just did ✓).
- **Database schema**: `brokerages` table + tool contracts + RLS policies.
- **Tool implementation order** (Phase 1: search, booking, email; Phase 2: legal review workflow).
- **Prompt tuning** (LPMAMA qualification, objection handling, disclosure timing).
- **Testing plan** (end-to-end, bias, latency, failover, legal review).
- **Rollout cadence** (internal MVP → beta → soft launch → full).

### What Success Looks Like (When You're Done)

- A **complete, written implementation runbook** that an engineer can hand off to code.
- A **tool contract document** that defines every Vapi function call + response.
- A **brokerage onboarding checklist** (simple 5-step process).
- A **compliance checklist** (Arizona AI 2025, Fair Housing, ADRE, legal review).
- A **go/no-go decision gate** before Phase 2 (beta).

---

## **THE NEXT STEPS FOR YOU**

### Immediate (Next 48 Hours)

1. Read this document (fully internalize the vision).
2. Create the **Tier 1 Implementation Runbook** (step-by-step, with exact endpoints/fields/schemas).
3. Create the **Tool Contracts** document (JSON schemas for each Vapi tool).
4. Create the **Brokerage Config Schema** (what fields the `brokerages` table needs).

### Follow-Up

1. Work with engineering to implement Phase 1 components.
2. Set up test environment (test brokerage number, test Cal.com team, test database).
3. Run end-to-end tests before beta.
4. Prepare bias testing plan + legal review workflow.

---

## **CLOSING THOUGHT**

Avoxa is not just a chatbot or scheduling tool. It's a **new business model** for Arizona real estate: 24/7 lead qualification + multi-brokerage SaaS + compliance-first + AI-native.

Your job is to make sure every engineer, every brokerage, and every legal reviewer understands this vision and executes it cleanly.

**Let's build something great.**

---

**Document Version**: 1.0  
**Project**: Avoxa (AI Real Estate Voice Agent for Arizona)  
**Intended Audience**: Google Antigravity Agent + Engineering Team + Legal Review  
**Status**: Vision Locked, Architecture Confirmed, Ready for Implementation Runbook
