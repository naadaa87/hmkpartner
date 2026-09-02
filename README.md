# HMK홀딩스그룹 사업파트너 랜딩페이지 + 관리자 대시보드

Cloudflare 한곳에서 전부 돌아갑니다. Supabase나 외부 서비스를 쓰지 않습니다.

```
방문자 → 랜딩페이지(신청 폼) → Pages Functions → D1 데이터베이스
                                                      ↓
                                담당자 → /admin 대시보드에서 확인
```

---

## 파일 구성

```
index.html                랜딩페이지
admin/index.html          관리자 대시보드
admin/assets/             대시보드 스타일 · 스크립트
functions/api/
  submit.js               신청서 접수 (D1 저장)
  login.js                관리자 로그인
  logout.js               로그아웃
  inquiries.js            신청 목록 조회
  update.js               처리상태 · 메모 저장, 삭제
schema.sql                D1 테이블 생성 SQL
assets/                   랜딩페이지 스타일 · 스크립트 · 이미지
_headers, robots.txt, sitemap.xml, favicon.svg
```

---

# 설치 순서

## 1단계 · GitHub 업로드

새 저장소를 만들거나 기존 `hmkpartners` 저장소를 씁니다.

**폴더 안의 내용물을 드래그 앤 드롭**으로 올리십시오. `index.html`, `admin`, `assets`, `functions` 등을 한꺼번에 선택해 브라우저 업로드 영역에 끌어다 놓습니다. "choose files" 버튼을 쓰거나 폴더째 올리면 하위 경로가 사라집니다.

기존 저장소에 덮어쓰는 경우, `assets/js/config.js`와 `assets/js/main.js`가 바뀌었으니 반드시 함께 올려야 합니다.

---

## 2단계 · D1 데이터베이스 만들기

Cloudflare 대시보드 → 왼쪽 메뉴 **Storage & Databases → D1 SQL Database → Create**

| 항목 | 값 |
|---|---|
| Database name | `hmk-partner` |
| Location | Asia-Pacific (또는 Automatic) |

만들어지면 그 데이터베이스로 들어가 **Console** 탭을 엽니다. `schema.sql` 파일 내용을 전부 붙여넣고 실행하십시오.

**Tables** 탭에 `partner_inquiries`가 보이면 완료입니다.

---

## 3단계 · Pages에 D1 연결

Workers & Pages → 해당 Pages 프로젝트 → **Settings → Bindings → Add → D1 database**

| 항목 | 값 |
|---|---|
| Variable name | `DB` |
| D1 database | `hmk-partner` |

**Variable name은 반드시 `DB`** 여야 합니다. 코드가 이 이름을 찾습니다.

Production과 Preview 두 환경이 있으면 양쪽 모두에 추가하십시오.

---

## 4단계 · 관리자 계정 설정

같은 화면의 **Settings → Variables and Secrets → Add**

| 이름 | 값 | 종류 |
|---|---|---|
| `ADMIN_ID` | 원하는 아이디 (예: `hmk`) | Secret |
| `ADMIN_PW` | 원하는 비밀번호 | Secret |
| `AUTH_SECRET` | 아무 긴 문자열 (예: `hmk-partner-2026-a7x9k2` ) | Secret |

담당자 모두가 이 계정 하나를 공용으로 씁니다.

`AUTH_SECRET`은 로그인 상태를 유지하는 데 쓰는 값입니다. 아무 문자열이나 넣으시면 되고, 나중에 이 값을 바꾸면 모든 담당자가 다시 로그인하게 됩니다.

---

## 5단계 · 재배포

설정을 바꾼 뒤에는 반드시 다시 배포해야 반영됩니다.

**Deployments 탭 → 맨 위 배포의 ⋯ 메뉴 → Retry deployment**

또는 GitHub에서 아무 파일이나 한 글자 고쳐 커밋하면 자동으로 다시 배포됩니다.

---

## 6단계 · 확인

**신청 폼**
랜딩페이지를 열어 신청서를 한 건 보내십시오. 주황색 박스 없이 "접수되었습니다"만 나오면 D1에 저장된 것입니다.

**대시보드**
`https://주소/admin` 으로 들어가 3단계에서 정한 아이디와 비밀번호로 로그인합니다. 방금 넣은 신청이 목록에 보이면 완료입니다.

---

# 대시보드 사용법

| 기능 | 설명 |
|---|---|
| 상단 카드 | 전체 · 미처리 · 오늘 · 최근 7일. 누르면 해당 조건으로 걸러집니다 |
| 검색 | 이름, 회사, 연락처, 요약, 메모를 한 번에 찾습니다 |
| 필터 | 관심 분야 · 현재 상황 · 처리 상태 |
| 목록 클릭 | 오른쪽에 상세가 열립니다 |
| 상세 | 메모 작성, 처리 완료 체크, 전화 걸기, 메일 보내기, 삭제 |
| 엑셀 내려받기 | 현재 화면에 보이는 목록을 CSV로 저장합니다 |

휴대폰에서도 그대로 쓸 수 있습니다. 담당자에게 `/admin` 주소와 계정만 알려 주시면 됩니다.

로그인은 12시간 유지되고, 그 뒤에는 다시 로그인하면 됩니다.

---

# 문제가 생겼을 때

| 증상 | 원인 | 조치 |
|---|---|---|
| 신청 후 주황색 박스가 뜸 | D1 연결 안 됨 | 3단계 Variable name이 `DB`인지 확인, 재배포 |
| 로그인에서 "설정되지 않았습니다" | 계정 변수 없음 | 4단계 확인, 재배포 |
| 로그인해도 "맞지 않습니다" | 아이디·비번 불일치 | 앞뒤 공백 확인 |
| 목록이 안 뜸 | 테이블 없음 | 2단계 `schema.sql` 실행 확인 |
| 설정을 바꿨는데 그대로 | 재배포 안 함 | 5단계 Retry deployment |

원인을 알기 어려우면 브라우저에서 F12 → Network 탭을 열고 다시 시도해, `/api/...` 요청의 응답 내용을 확인하십시오.

---

# 운영 참고

**비용** — D1 무료 한도는 하루 읽기 500만 건, 쓰기 10만 건, 저장 5GB입니다. 파트너 신청 규모에서는 초과할 일이 없습니다.

**정지 없음** — Supabase와 달리 사용이 없어도 정지되지 않습니다.

**백업** — 대시보드에서 엑셀 내려받기를 주기적으로 해 두시면 됩니다. D1 대시보드에서 데이터베이스 전체 내보내기도 가능합니다.

**개인정보** — 성함과 연락처가 담깁니다. 계정을 아는 사람은 전부 조회할 수 있으므로 공유 범위를 관리하시고, 처리가 끝난 오래된 건은 정기적으로 정리하시는 편이 좋습니다.

**Supabase(hmk-crm)** — 이 페이지는 더 이상 Supabase를 쓰지 않습니다. 앞서 만든 `partner_inquiries` 테이블은 지우셔도 됩니다.

```sql
drop table if exists public.partner_inquiries;
```

---

# 내용 수정 위치

| 바꿀 내용 | 위치 |
|---|---|
| 보유 · 협의 자산 목록 | `index.html` → `<table class="ledger">` |
| 사업파트너 유형 | `index.html` → `<section id="who">` |
| 참여 방식 12종 | `index.html` → `<div class="ways">` |
| 자주 묻는 질문 | `index.html` → `<section id="faq">` |
| 관심 분야 선택지 | `index.html` → `.chips` 안의 `<label class="chip">` |
| 이메일 · 전화 | `assets/js/config.js` |
| 사무실 주소 · 지도 | `index.html` → `<section id="office">`, 신청 영역, 푸터 |

---

# 페이지 구성

```
히어로 → 01 사업개요 → 02 사업노하우(보유 자산 포함) → 03 사업파트너
      → 04 참여방식(12종) → 05 파트너신청 → 06 오시는길
      → 07 자주묻는질문 → 마무리 → 푸터
```

데스크톱 1181px 이상은 가로 메뉴, 그 아래는 햄버거 메뉴입니다. 모바일에서는 히어로를 지나면 하단에 신청 버튼이 고정으로 뜹니다.
