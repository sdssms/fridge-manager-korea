# Fresh Keep 개발 현황 정리 (2026-10-29 기준)

운영 주소: https://fridge.ian-rounge.store · 저장소: github.com/sdssms/fridge-manager-korea (main, 최신 커밋 `47f03f2`)

## 완료된 것

### 1. 계정·가족 인증 체계 (커밋 `55492fd`)
- 회원가입 → **관리자 승인 전 로그인 불가**(`PENDING` → `ACTIVE`)
- 승인된 회원 누구나 가족을 **직접 생성**(즉시 첫 구성원) 하거나, 초대코드로 **합류 신청** → 기존 구성원이 승인/거절
- 모든 재고·냉장고·장보기 API가 세션의 가족 ID로 격리됨. 다른 가족 리소스 ID로 접근하면 404 (존재 자체를 숨김)
- 재료별 개인 요리 메모(`ItemPersonalMeta`)는 작성자 본인만 조회 가능, 공용 재고는 자동 차감 안 함
- 보안: Argon2id 비밀번호 해시, 해시된 랜덤 세션 토큰, `HttpOnly/Secure/SameSite` 쿠키, Origin 검사(CSRF), DB 기반 rate limit, 감사 로그(`AuditEvent`)
- 그룹 탈퇴 시 마지막 활성 구성원은 탈퇴 불가, 정지된 계정은 세션 즉시 무효화
- 설계 문서: `AUTH_SPEC.md` (v3, 구현 완료 상태로 갱신됨)

### 2. 운영 인프라 보안 강화
- DB 비밀번호 교체, PostgreSQL 포트(5433)를 `127.0.0.1`에만 바인딩
- `.env.production`을 Git 추적에서 제거
- **중요 발견 및 수정**: nginx DDoS shield가 443 포트를 Caddy로 패스스루하지 않아 외부 HTTPS가 조용히 끊겨 있었음 → `/tmp/nginx-shield/nginx-ratelimit.conf`에 `stream` 블록 추가해 해결 (스킬 문서 `home-server-infrastructure.md`에 교훈 기록해둠)
- 배포 전 운영 DB 백업 관행 확립: `/Users/sms/fridge-backups/`에 마이그레이션별 덤프 보관

### 3. UI/디자인
- 색상 테마를 파란색(`#3182f6`)에서 연그린(`#2fa36e`)으로 전면 교체 (커밋 `00d5d85`)
- 실온보관(`PANTRY`) 냉장고 타입 추가 — 필터 칩, 등록 폼 버튼 그리드에 반영 (커밋 `114fec5`)
- 식재료 이름 입력 시 카테고리 **자동 추천** — "김치찌개"처럼 겹치는 키워드는 더 구체적인 분류(국·찌개)를 우선 매칭하도록 순서 설계. 사용자가 수동으로 바꾸면 그 등록 건에서는 더 이상 덮어쓰지 않음 (커밋 `80edce4`)
- 재고 **수량 수정** 기능 — 각 재료 행에 연필 아이콘, "절반만 남기기" 원터치 버튼 제공 (커밋 `47f03f2`)

### 4. API
- `POST /api/items/bulk` — 최대 200개 재료 한 번에 등록 (커밋 `975ee27`)
- 기존 `PATCH /api/items/[id]`가 `quantity`/`unit`/`name`/`expiryDate` 수정을 이미 지원하고 있어서 수량 수정 기능은 백엔드 변경 없이 프론트만으로 구현

### 5. 운영 자동화
- 가입 신청 알림 cron(`freshkeep-signup-alert`, 5분 간격, 변경 감지 시에만 발송) — 새 `PENDING` 사용자 생기면 이 대화방으로 알림. 승인은 자동화하지 않고 사람이 `/admin`에서 처리

## 남은 것 / 아직 구현 안 된 것

- **이메일 소유 검증, 셀프 비밀번호 재설정** — 관리자 비밀번호 변경 UI도 없음 (서버에서 직접 파일로 관리 중: `/Users/sms/.freshkeep/admin-password`)
- **그룹 폐쇄/탈퇴 시 가족 데이터 전체 삭제** 절차 없음 — 마지막 구성원 탈퇴만 막아둔 상태
- 구매 → 재고 자동 반영, 소비 이력, AI 추천 레시피, GPT/MCP 연동 — 모두 설계 논의만 했고 미구현
- **실제 휴대전화 실기기 검증 안 됨** — 지금까지는 Playwright Chromium 에뮬레이션(360/390/430/1280px)과 로컬 Caddy HTTPS 경유로만 확인
- 외부 LTE/5G 네트워크에서 직접 접속 테스트 안 됨 (이 서버 환경 자체의 아웃바운드 제약으로 외부 fetch가 자주 타임아웃됨 — `web_extract`로는 확인되지만 `browser_navigate`로는 안 되는 경우가 있었음)

## 이어서 개발할 때 주의할 점

1. **배포 전 체크리스트**: ① `npm run build && npm run lint` ② 격리된 테스트 DB(`fridge_auth_test`, 포트 5433)에서 `tests/auth-security.mjs` + `tests/auth-ui.mjs` + `tests/qa.mjs` 통과 ③ 운영 DB 백업(`pg_dump -Fc`) ④ 스키마 변경 있으면 `npx prisma migrate deploy`를 프로덕션 `DATABASE_URL`로 먼저 실행 후 앱 이미지 재빌드. `DEPLOYMENT.md`에 전체 순서 정리돼 있음.
2. **테스트 DB와 운영 DB를 혼동하지 말 것**. 테스트는 항상 `fridge_auth_test`(또는 별도 DB)에서, `tests/qa.mjs`는 운영 DB에서 절대 실행 금지(실제 데이터를 생성·삭제함).
3. **관리자 계정 자격 증명**: `admin@ian-rounge.store`, 비밀번호는 서버의 `/Users/sms/.freshkeep/admin-password`(권한 0600)에만 있음. 채팅/커밋/문서 어디에도 평문으로 남기지 말 것.
4. Prisma 마이그레이션 작성 시 `prisma migrate dev`는 비대화형 환경에서 실패함 — 마이그레이션 폴더를 수동으로 만들고 SQL을 직접 작성한 뒤 `prisma migrate deploy`로 적용하는 방식을 써왔음 (예: `prisma/migrations/20261029150000_pantry_fridge_type/`).
5. nginx DDoS shield 설정(`/tmp/nginx-shield/nginx-ratelimit.conf`)을 건드릴 일이 있으면, 컨테이너가 Docker bind mount를 쓰고 있어서 `nginx -s reload`만으로는 안 먹힐 때가 있다 — `docker compose up -d --force-recreate nginx-ddos-shield`로 재생성해야 확실히 반영됨.
6. UI 색상·텍스트는 모두 `components/dashboard.tsx`, `components/auth-layout.tsx` 등에 Tailwind 임의값(`bg-[#2fa36e]` 등)으로 하드코딩돼 있음. 디자인 토큰화는 안 돼 있으니 색 바꿀 때 `search_files`로 전체 occurrence를 찾아 일괄 교체해야 함.
7. `tests/auth-security.mjs`는 매 실행 전에 `rate_limits` 테이블을 비워야 함(`TRUNCATE rate_limits`) — 안 그러면 가입/로그인 rate limit에 걸려 실패함.
8. cron job `freshkeep-signup-alert`는 **알림 전용**이며 승인을 자동으로 하지 않음. 자동 승인 로직을 추가해달라는 요청이 없는 한 그대로 둘 것 — 스팸 가입 방지를 위한 의도적 설계.
