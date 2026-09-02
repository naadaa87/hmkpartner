// POST /api/update — 처리상태 · 메모 저장 (로그인 필요)
import { isAuthed } from './inquiries.js';

export async function onRequestPost({ request, env }) {
  const json = (o, s) => new Response(JSON.stringify(o), {
    status: s || 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });

  if (!await isAuthed(request, env)) return json({ ok: false, error: 'UNAUTHORIZED' }, 401);
  if (!env.DB) return json({ ok: false, error: 'DB_NOT_BOUND' }, 500);

  let b;
  try { b = await request.json(); } catch (e) { return json({ ok: false }, 400); }

  const id = Number(b.id);
  if (!id) return json({ ok: false, error: 'ID_REQUIRED' }, 400);

  try {
    if (b.action === 'delete') {
      await env.DB.prepare('delete from partner_inquiries where id = ?').bind(id).run();
      return json({ ok: true, deleted: true });
    }
    const handled = b.handled ? 1 : 0;
    const memo = (b.memo == null ? '' : String(b.memo)).slice(0, 2000);
    await env.DB.prepare(
      'update partner_inquiries set handled = ?, memo = ? where id = ?'
    ).bind(handled, memo || null, id).run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e && e.message || e) }, 500);
  }
}
