-- ═══════════════════════════════════════════════
--  HMK 사업파트너 신청 · Cloudflare D1 스키마
--  D1 대시보드 → Console 에 붙여넣고 실행하십시오.
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS partner_inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL,          -- ISO 8601 (UTC)
  name        TEXT    NOT NULL,          -- 성함
  company     TEXT,                      -- 회사 · 상호
  phone       TEXT    NOT NULL,          -- 연락처
  email       TEXT,                      -- 이메일
  fields      TEXT    NOT NULL,          -- 관심 분야 (JSON 배열 문자열)
  status      TEXT    NOT NULL,          -- 현재 상황
  summary     TEXT,                      -- 경력 · 사업 요약
  source      TEXT,                      -- 유입 경로
  page        TEXT,                      -- 신청 페이지 주소
  handled     INTEGER NOT NULL DEFAULT 0,-- 0 미처리 / 1 처리 완료
  memo        TEXT                       -- 담당자 메모
);

CREATE INDEX IF NOT EXISTS idx_partner_created
  ON partner_inquiries (created_at DESC);
