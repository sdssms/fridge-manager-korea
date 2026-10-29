# Fresh Keep 운영 배포·복구

운영 주소: https://fridge.ian-rounge.store. 앱 컨테이너 포트 3001, DB는 로컬 전용 `127.0.0.1:5433`.

## 안전한 배포 순서

1. `.env`(Git 제외, 권한 `0600`)에 `DB_PASSWORD`와 호스트에서 쓸 `DATABASE_URL`을 지정한다. **평문 자격 증명은 Compose/YAML/README/Git에 기록하지 않는다.** `docker compose -f docker-compose.prod.yml config --quiet`로 확인한다.
2. 운영 DB 백업과 복구 시험을 한다. 예: `docker exec fridge-manager-db pg_dump -Fc -U postgres -d fridge_manager > ~/fridge-backups/fridge-before-update.dump`; 별도 시험 DB를 만들고 `docker exec -i fridge-manager-db pg_restore --no-owner -U postgres -d <시험 DB> < ~/fridge-backups/fridge-before-update.dump`로 원복 가능한지 확인한다.
3. `npm ci && npx prisma generate && npm run build && npm run lint` 및 격리된 시험 DB의 인증/권한/화면 테스트를 통과한다.
4. **스키마와 API가 동시에 바뀌는 릴리스:** 구 앱 정지 → 새 이미지 빌드 → `DATABASE_URL`을 호스트 접속 URL로 설정해 `npx prisma migrate deploy` → `npx prisma migrate status` 확인 → `docker compose -f docker-compose.prod.yml up -d --no-build app`. `docker compose down -v`는 데이터를 지우므로 실행 금지.
5. 최초 1회만 `ADMIN_EMAIL`/`ADMIN_PASSWORD_FILE`/`DATABASE_URL`을 설정하고 `node scripts/bootstrap-admin.mjs` 실행. 첫 관리자 비밀번호는 Git 외부 권한 `0600` 파일에 저장; 스크립트는 기존 관리자 생성 후 재실행을 차단한다.
6. `docker compose -f docker-compose.prod.yml ps`와 `docker logs fridge-manager-app`을 확인한다. 익명 `/api/items`, `/api/fridges`, `/api/shopping`은 401, `/login`은 200이어야 한다. 관리자 로그인의 본인 가족 재고만 보이는지 확인한다.

## 2026-10-29 전환 기록

- 원본 DB 커스텀 백업: `/Users/sms/fridge-backups/fridge-before-auth-20261029.dump` (시험 DB 복원 성공).
- 마이그레이션: `20261029041423_household_auth`. 기존 냉장고 2개, 재료 6개 → `legacy-household`; 초기 관리자 1명 연결. 전환 뒤 항목 수 유지, 소유 누락 0.
- DB 비밀번호 교체, PostgreSQL 포트 루프백 바인딩. 과거 Git에 포함됐던 `.env.production`은 추적 해제했지만 **과거 Git 기록의 비밀은 기록에서 자동 삭제되지 않음**; DB 기존 비밀번호는 폐기됨. 다른 곳에 재사용했다면 별도 교체 필요.
- HTTPS의 Caddy 로컬 경유 `/login` 200, 익명 `/api/items`·`/api/fridges` 401. 외부 이동통신망과 실제 모바일 기기 검증은 남아 있다.

## 복구

장애 시 먼저 `docker compose -f docker-compose.prod.yml ps`와 앱 로그, `npx prisma migrate status`를 확인한다. DB 복원은 **운영 데이터가 새로 쌓였을 때 모두 사라질 수 있으므로** 별도 최신 백업을 먼저 확보한 뒤 시험 DB에서 검증하고 진행한다. DB를 이전 스키마로 되돌린 경우 앱 이미지도 대응되는 버전으로 되돌려야 한다. 백업 원본은 저장소에 추가하지 않는다.
