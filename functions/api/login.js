// POST /api/login — 관리자 로그인 (공용 아이디/비밀번호 1쌍)
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

export async function onRequestPost({ request, env }) {
  const json = (o, s) => new Response(JSON.stringify(o), {
    status: s || 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  const id = String(body.id || '');
  const pw = String(body.pw || '');
  const ADMIN_ID = env.ADMIN_ID || '';
  const ADMIN_PW = env.ADMIN_PW || '';

  if (!ADMIN_ID || !ADMIN_PW) return json({ ok: false, error: 'NOT_CONFIGURED' }, 500);
  if (id !== ADMIN_ID || pw !== ADMIN_PW) return json({ ok: false, error: 'INVALID' }, 401);

  const exp = Date.now() + 12 * 60 * 60 * 1000; // 12시간
  const secret = env.AUTH_SECRET || (ADMIN_PW + '|hmk-partner');
  const token = exp + '.' + await hmac(secret, String(exp));

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': `hmk_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
    }
  });
}
