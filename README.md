# Fresh Keep

한국 가정의 공동 냉장고·장보기 웹앱. [화면 설계](DESIGN_REWORK.md) · [계정/가족 설계와 범위](AUTH_SPEC.md)

## 현재 구현
- 일반 사용자 가입 신청 → 서비스 관리자 승인 → 로그인. 승인 전 세션 발급 안 함.
- 승인된 회원 누구나 가족을 만들고 첫 구성원이 되거나 초대코드로 합류 신청. 기존 구성원 누구나 승인/거절; 코드만으로 재고 접근 불가.
- 가족별 냉장고·식재료·장보기 동기화. 공용 재료별 개인 요리 목적/메모/계획 수량은 작성자만 조회·수정. 계획만으로 재고 차감 없음.
- 이름 검색·위치 필터·유통기한 보기·등록·삭제, 규칙 기반 요리 아이디어. 모바일 4탭/PC 사이드바.
- 과거 브라우저 `freshkeep-shopping-v1` 목록은 사용자가 **가져오기 또는 삭제**를 선택할 수 있음. 자동 병합하지 않음.

## 보안 및 초기 데이터
- Argon2id 비밀번호, 무작위 해시 세션, `HttpOnly/Secure/SameSite=Lax` 쿠키, 상태 변경 Origin 검사, 계정/가족별 API 권한 검사, 승인·재고 변경 감사 이벤트.
- 초기 관리자 계정 `admin@ian-rounge.store`는 운영 서버에서만 생성했으며 암호는 Git 밖의 권한 `0600` 파일 `/Users/sms/.freshkeep/admin-password`에 저장. **암호를 채팅·이슈·저장소에 올리지 마세요.** 운영 전환 시 관리자 본인만 확인하고 비밀번호 변경 기능을 마련하는 것이 좋습니다.
- 기존 재료는 백업 후 `legacy-household`에 귀속시키고 초기 관리자만 구성원으로 연결. 운영 DB에 기존 냉장고 2개·재료 6개가 보존됨.
- PostgreSQL 포트 `5433`은 호스트 루프백에만 바인딩하고, DB 비밀번호를 교체함. Compose는 Git에 넣지 않는 `.env`의 `DB_PASSWORD`를 요구.

## 기술 및 검증
Next.js 16 / React 19 / Tailwind CSS 4 / Radix UI / Prisma 5 / PostgreSQL / Docker Compose

```bash
npm ci
npx prisma generate
npm run build
npm run lint
# 별도 fridge_auth_test DB 및 테스트 관리자 계정이 준비된 경우에만:
TEST_URL=http://localhost:3002 node tests/auth-security.mjs
TEST_URL=http://localhost:3002 node tests/auth-ui.mjs
TEST_URL=http://localhost:3002 node tests/qa.mjs
```

`tests/qa.mjs`는 테스트 DB에 항목을 생성·삭제합니다. 운영 DB에서 실행하지 마세요. `tests/prod-smoke.mjs`는 운영 계정 로그인·읽기·로그아웃만 수행합니다. [운영 배포/복구](DEPLOYMENT.md) 참고.

## 아직 없는 기능
이메일 소유 검증/셀프 비밀번호 재설정/관리자 비밀번호 변경 UI, 그룹 폐쇄, 구매→재고 자동 반영, 소비 이력, AI 레시피/MCP 연동. 실제 휴대전화 사파리·크롬과 외부 LTE/5G 접속 품질은 아직 실기기 검증하지 않았습니다.
