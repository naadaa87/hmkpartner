/* ─────────────────────────────────────────────
   HMK 사업파트너 랜딩페이지 설정
   신청서는 Cloudflare D1에 저장됩니다.
   ───────────────────────────────────────────── */
window.HMK_PARTNER_CONFIG = {

  // 문의 응대 이메일 (화면 표시 · 자동 접수 실패 시 대체 수신처)
  CONTACT_EMAIL: "hmkholdings@hmkholdings.com",

  // 대표 전화 (값을 넣으면 신청 영역에 표시됩니다. 비우면 표시되지 않습니다)
  CONTACT_PHONE: "",

  // 신청서 접수 주소. Cloudflare Pages Functions 경로입니다.
  // 바꿀 일이 거의 없습니다.
  SUBMIT_API: "/api/submit"
};
