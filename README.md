# Fresh Keep

한국 가정의 냉장고 재료를 관리하는 모바일·PC 웹앱. [화면 설계 및 품질 기준](DESIGN_REWORK.md)을 참고하세요.

## 현재 구현
- 홈: 보관 재료 수, 3일 안에 확인할 재료, 식재료 바로가기
- 냉장고: 이름 검색, 보관 위치 필터, 유통기한 순 보기, 등록, 목록에서 삭제
- 장보기: 추가·체크·삭제. **현재 브라우저의 localStorage에만 저장**되며 기기 간 동기화되지 않음
- 요리: 재료 분류에 따른 **규칙 기반 아이디어**. AI 추천이나 전체 레시피는 아님
- 모바일 하단 4탭, PC 사이드바; 등록은 모바일 바텀시트/PC 중앙 모달

## 기술
Next.js 16 / React 19 / Tailwind CSS 4 (`@tailwindcss/postcss`) / shadcn 스타일 Radix UI 컴포넌트 / Prisma 5 / PostgreSQL / Docker Compose

## 실행 및 테스트
```bash
npm ci
npm run build
npm run lint
# 이미 앱과 DB가 실행 중인 서버에서:
TEST_URL=http://localhost:3001 node tests/qa.mjs
# 운영 빌드 재배포
docker compose -f docker-compose.prod.yml up -d --build
```

`tests/qa.mjs`는 식재료 테스트 레코드를 생성하고 삭제합니다. 별도 테스트 DB 사용을 권장하며, 실패 시 `QA당근-` 접두의 테스트 레코드를 정리하세요. 스크린샷은 `qa-output/`에 저장됩니다.

## 아직 없는 기능 / 운영 주의
- 로그인·권한·가구별 데이터 분리 **없음**. 현재 공개 API에 접근 가능한 사람은 식재료를 읽고 변경할 수 있습니다. 민감한 실사용 데이터를 넣기 전에 인증을 추가해야 합니다.
- 소비 이력, 구매→냉장고 자동 등록, 정확한 레시피/AI, 가족 장보기 동기화 미구현.
- 만료일 미입력은 날짜 미설정으로 표시됩니다. 삭제는 되돌릴 수 없습니다.

[운영 배포 문서](DEPLOYMENT.md)
