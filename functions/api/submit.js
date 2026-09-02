// POST /api/submit — 랜딩페이지 신청 폼 접수
export async function onRequestPost({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  if (!env.DB) return json({ ok: false, error: 'DB_NOT_BOUND' }, 500);

  let d;
  try { d = await request.json(); }
  catch (e) { return json({ ok: false, error: 'BAD_JSON' }, 400); }

  // 스팸 봇이 채우는 숨김 필드 — 조용히 성공 처리
  if (d.website) return json({ ok: true });

  const s = (v, max) => (v == null ? '' : String(v)).trim().slice(0, max || 200);
  const name = s(d.name, 40);
  const phone = s(d.phone, 20);
  const fields = Array.isArray(d.fields) ? d.fields.map(x => s(x, 40)).slice(0, 20) : [];
  const status = s(d.status, 40);

  if (!name) return json({ ok: false, error: 'NAME_REQUIRED' }, 400);
  if (phone.replace(/[^0-9]/g, '').length < 9) return json({ ok: false, error: 'PHONE_INVALID' }, 400);
  if (!fields.length) return json({ ok: false, error: 'FIELDS_REQUIRED' }, 400);
  if (!status) return json({ ok: false, error: 'STATUS_REQUIRED' }, 400);

  try {
    await env.DB.prepare(
      `insert into partner_inquiries
       (created_at, name, company, phone, email, fields, status, summary, source, page)
       values (?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      new Date().toISOString(),
      name,
      s(d.company, 60) || null,
      phone,
      s(d.email, 80) || null,
      JSON.stringify(fields),
      status,
      s(d.summary, 1500) || null,
      s(d.source, 300) || null,
      s(d.page, 300) || null
    ).run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}
