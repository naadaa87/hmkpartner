// GET /api/inquiries — 신청 목록 조회 (로그인 필요)
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  let bin = '';
  new Uint8Array(sig).forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function isAuthed(request, env) {
  const c = request.headers.get('Cookie') || '';
  const m = c.match(/(?:^|;\s*)hmk_admin=([^;]*)/);
  if (!m) return false;
  const parts = decodeURIComponent(m[1]).split('.');
  if (parts.length !== 2) return false;
  const exp = Number(parts[0]);
  if (!exp || exp < Date.now()) return false;
  const secret = env.AUTH_SECRET || ((env.ADMIN_PW || '') + '|hmk-partner');
  return (await hmac(secret, String(exp))) === parts[1];
}

export async function onRequestGet({ request, env }) {
  const json = (o, s) => new Response(JSON.stringify(o), {
    status: s || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

  if (!await isAuthed(request, env)) return json({ ok: false, error: 'UNAUTHORIZED' }, 401);
  if (!env.DB) return json({ ok: false, error: 'DB_NOT_BOUND' }, 500);

  try {
    const { results } = await env.DB.prepare(
      `select id, created_at, name, company, phone, email, fields, status,
              summary, source, page, handled, memo
       from partner_inquiries
       order by datetime(created_at) desc
       limit 2000`
    ).all();

    const rows = (results || []).map(r => {
      let f = [];
      try { f = JSON.parse(r.fields || '[]'); } catch (e) { f = []; }
      return Object.assign({}, r, { fields: f, handled: !!r.handled });
    });
    return json({ ok: true, rows: rows });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}
