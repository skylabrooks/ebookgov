import { createClient } from "npm:@supabase/supabase-js@2.35.0";
import JSZip from 'npm:jszip@3.10.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEFAULT_BUCKET = Deno.env.get('DEFAULT_BUCKET') || 'public';
const MAX_FILE_BYTES = Number(Deno.env.get('MAX_ATTACHMENT_BYTES') || 50 * 1024 * 1024); // default 50MB

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function getField(row, candidates) {
  for (const c of candidates) if (row[c] !== undefined && row[c] !== null) return row[c];
  return null;
}

async function fetchWithTimeout(url, opts = {}, maxBytes = MAX_FILE_BYTES) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 120000); // 2 min
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // stream and cap size
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No body');
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        controller.abort();
        throw new Error(`File exceeds max size ${maxBytes} bytes`);
      }
      chunks.push(value);
    }
    // concat
    let total = 0; for (const c of chunks) total += c.byteLength;
    const u8 = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) { u8.set(c, offset); offset += c.byteLength; }
    return u8;
  } finally { clearTimeout(id); }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401 });
    const token = authHeader.replace(/^Bearer /i, '');

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    const uid = userData.user.id;

    const { lead_id } = await req.json();
    if (!lead_id) return new Response(JSON.stringify({ error: 'lead_id required' }), { status: 400 });

    const { data: agentRows, error: agentErr } = await supabase.from('agents').select('id').eq('user_id', uid).limit(1).maybeSingle();
    if (agentErr) return new Response(JSON.stringify({ error: 'Error checking agent' }), { status: 500 });
    if (!agentRows || !agentRows.id) return new Response(JSON.stringify({ error: 'Agent not found for user' }), { status: 403 });
    const agentId = agentRows.id;

    const { data: leadRow, error: leadErr } = await supabase.from('leads').select('*').eq('id', lead_id).maybeSingle();
    if (leadErr) return new Response(JSON.stringify({ error: 'Error fetching lead' }), { status: 500 });
    if (!leadRow) return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
    if (leadRow.agent_id !== agentId) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });

    const [{ data: notes }, { data: interactions }, { data: tags }, { data: property }, { data: attachments }] = await Promise.all([
      supabase.from('notes').select('*').eq('lead_id', lead_id),
      supabase.from('interactions').select('*').eq('lead_id', lead_id),
      supabase.from('lead_tags').select('tag_id').eq('lead_id', lead_id),
      supabase.from('properties').select('*').eq('id', leadRow.property_id).maybeSingle(),
      supabase.from('attachments').select('*').eq('lead_id', lead_id),
    ]);

    const zip = new JSZip();
    zip.file('lead.json', JSON.stringify(leadRow, null, 2));

    const toCSV = (rows) => {
      if (!rows || rows.length === 0) return '';
      const keys = Object.keys(rows[0]);
      const escape = (v) => v === null || v === undefined ? '' : typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : String(v);
      const lines = [keys.join(',')];
      for (const r of rows) lines.push(keys.map(k => escape(r[k])).join(','));
      return lines.join('\n');
    };

    zip.file('lead.csv', toCSV([leadRow]));
    zip.file('notes.md', notes && notes.length ? notes.map(n => `-- ${n.created_at} --\n${n.body}\n`).join('\n') : '');
    zip.file('interactions.csv', toCSV(interactions || []));
    if (property) zip.file('property.json', JSON.stringify(property, null, 2));

    // Attachments: flexible schema handling
    if (attachments && attachments.length) {
      const folder = zip.folder('attachments');
      for (const att of attachments) {
        const meta = JSON.stringify(att, null, 2);
        const attId = att.id || (Math.random() + '').slice(2, 10);
        folder.file(`${attId}.meta.json`, meta);

        const directUrl = getField(att, ['url', 'storage_url', 'direct_url']);
        const bucket = getField(att, ['storage_bucket', 'bucket']) || DEFAULT_BUCKET;
        const path = getField(att, ['storage_path', 'path', 'storage_key', 'key']);
        const filenameCandidate = getField(att, ['filename', 'name', 'original_name']);
        let filename = filenameCandidate || (path ? path.split('/').pop() : `${attId}`);
        if (!filename) filename = `${attId}`;

        try {
          let fileBytes = null;
          if (directUrl) {
            try {
              fileBytes = await fetchWithTimeout(directUrl, {}, MAX_FILE_BYTES);
            } catch (e) {
              folder.file(`${filename}.error.txt`, `Failed to fetch direct URL: ${String(e)}`);
            }
          } else if (path) {
            try {
              const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
              if (signErr || !signed?.signedUrl) {
                folder.file(`${filename}.missing.txt`, `Could not create signed URL for bucket=${bucket} path=${path} error=${signErr?.message || 'unknown'}`);
              } else {
                fileBytes = await fetchWithTimeout(signed.signedUrl, {}, MAX_FILE_BYTES);
              }
            } catch (e) {
              folder.file(`${filename}.error.txt`, `Error fetching storage object: ${String(e)}`);
            }
          } else {
            folder.file(`${attId}.missing.txt`, 'No path or URL available to fetch attachment');
          }

          if (fileBytes) {
            folder.file(filename, fileBytes);
          }
        } catch (e) {
          folder.file(`${filename}.error.txt`, `Unexpected error: ${String(e)}`);
        }
      }
    }

    const readme = `Lead Package\n\nFields included: id, name, phone_number, email, summary, created_at, updated_at\n\nAttachment fetching strategy: direct URL -> (bucket+path via signed URL) -> DEFAULT_BUCKET fallback\n`;
    zip.file('README.md', readme);

    const content = await zip.generateAsync({ type: 'uint8array' });
    const zipName = `lead-package-${lead_id}.zip`;

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
      },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
});