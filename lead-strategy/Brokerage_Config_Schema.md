# Brokerage Configuration Schema (Supabase)

This schema defines the `brokerages` table, which serves as the "brain" for multi-tenancy.

## Table: `brokerages`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key. |
| `name` | `text` | Name of the brokerage. |
| `vapi_phone_number` | `text` | The incoming phone number assigned in Vapi. |
| `cal_com_team_id` | `text` | The team ID for round-robin scheduling. |
| `cal_com_event_link` | `text` | The public link for self-service booking. |
| `branding_context` | `jsonb` | Agency-specific tone, greetings, and mission. |
| `disclosure_text` | `text` | Mandatory Arizona risks + AI disclosure text. |
| `brochure_url` | `text` | Link to the PDF brochure sent in confirmation emails. |
| `status` | `text` | `active`, `suspended`, `beta_testing`. |
| `created_at` | `timestamp` | Audit field. |

## Recommended RLS Policy (Multi-Tenancy)

To ensure one brokerage cannot see another's data:

```sql
-- Enable RLS
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;

-- Allow read access only if the service_role is used (or user is authorized)
CREATE POLICY "Brokerages are visible to authorized backend" 
ON brokerages 
FOR SELECT 
USING (true); -- Restricted by API keys in practice

-- Ensure 'calls' table is isolated
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brokerage call isolation" 
ON calls 
FOR ALL 
USING (brokerage_id = (auth.jwt() ->> 'brokerage_id')::uuid);
```

## Seed Example

```json
{
  "id": "e456-...",
  "name": "Arizona Elite Realty",
  "vapi_phone_number": "+14805550123",
  "cal_com_team_id": "team_123",
  "disclosure_text": "I am Avoxa, an AI assistant. Note: some homes in Queen Creek use hauled water...",
  "status": "active"
}
```
