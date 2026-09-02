// POST /api/logout — 로그아웃 (쿠키 삭제)
export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': 'hmk_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
    }
  });
}
