# 구매→재고 반영 · 소비 이력 기획서 (초안)

**상태: 기획 단계. 코드 작업 전.** 기존 `PRODUCT_SPEC_V2.md`/`FLOW_ANALYSIS.md`는 인증·가족 모델 도입 이전에 쓴 초기 아이디어 문서라 바코드 스캔·AI 레시피·5탭 내비 등 이번 스택에서 바로 구현하기 어려운 내용이 섞여 있다. 이 문서는 **현재 실제로 배포된 구조**(가족 공동 냉장고, `장보기/냉장고/요리/홈` 4탭, `ShoppingItem`/`FoodItem`/`ItemPersonalMeta` 스키마) 위에서 바로 쌓을 수 있는 범위로 새로 정의한다.

## 1. 왜 필요한가

- **장보기 → 재고 단절**: 지금은 장보기 리스트에서 체크(`checked`)해도 그 재료가 냉장고 재고(`FoodItem`)로 자동 연결되지 않는다. 장 보고 와서 다시 하나하나 "식재료 등록" 폼을 채워야 한다.
- **소비/폐기 기록 없음**: 지금 "제거" 버튼은 다 먹었든 버렸든 구분 없이 그냥 삭제한다. 그래서 "이번 달 뭘 많이 버렸는지", "장보기 리스트에 반복해서 올라오는 재료가 뭔지" 같은 질문에 답할 데이터가 없다.

## 2. 이번 범위 (하는 것 / 안 하는 것)

**한다**
- 장보기에서 체크 완료한 항목을 리뷰 화면에서 확인하고, 보관 위치·유통기한·수량만 채워서 재고로 바로 등록
- 재료를 냉장고에서 제거할 때 "다 먹음" / "버림" 중 하나를 고르게 하고, 그 기록을 가족 단위로 보관 (`ConsumptionEvent` 신규 테이블)
- 최근 소비 이력을 간단한 목록으로 조회 (가족 공용, 누가 언제 어떻게 없앴는지)

**안 한다 (후속 과제로 분리)**
- 바코드 스캔, 사진 인식, 음성 등록 — 하드웨어/AI 연동 필요, 별도 기획
- 통계 대시보드(월간 절약 금액, 탄소 절감량 등) — 이력 데이터가 쌓인 뒤에 집계 로직만 추가하면 되므로 다음 단계
- 레시피 추천 고도화, 요리 모드(타이머 등) — 완전히 별개 기능
- 자동 재입고 추천(AI가 "우유 다 떨어졌으니 장보기에 추가" 제안) — 규칙 기반이라도 별도 논의 필요

## 3. 사용자 시나리오

### 시나리오 A: 장보기 후 한번에 등록
1. 토요일 장을 보고 집에 왔다. 장보기 탭에는 이미 체크해둔 "우유, 계란, 대파"가 있다.
2. "장보기 완료 → 재고에 담기" 버튼을 누른다.
3. 리뷰 화면에 체크된 3개 항목이 카드로 뜬다. 이름은 이미 채워져 있고, 보관 위치는 재료명 기반 추천(기존 카테고리 자동 추천 로직 재사용), 유통기한·수량은 비어 있다.
4. 각 카드에서 유통기한/수량만 입력하고 "모두 등록" 누르면 `FoodItem`이 한 번에 생성되고(`POST /api/items/bulk` 재사용), 해당 장보기 항목은 리스트에서 사라진다(완료 처리).
5. 리뷰 화면에서 특정 항목만 "이번엔 제외"하면 장보기 리스트에는 그대로 남는다(다음에 다시 등록 가능).

### 시나리오 B: 다 먹어서 치우기
1. 냉장실 목록에서 "계란말이"를 다 먹었다. 삭제 버튼을 누른다.
2. 기존처럼 확인창이 뜨지만, 선택지가 "다 먹었어요" / "버렸어요"로 바뀐다(취소 가능).
3. "다 먹었어요"를 고르면 `FoodItem`이 삭제되고 동시에 `ConsumptionEvent(action=EATEN)`이 가족 단위로 기록된다.
4. "버렸어요"를 고르면 같은 방식으로 `ConsumptionEvent(action=DISCARDED)`가 기록된다. 유통기한이 이미 지난 상태였다면 기본 선택지를 "버렸어요"로 미리 맞춰준다.

### 시나리오 C: 소비 이력 확인
1. 가족 구성원이 "소비 이력" 화면에 들어간다(냉장고 탭 하단 혹은 별도 진입점 — 아래 결정 필요 항목 참고).
2. 최근 30일 내 다 먹은 것/버린 것이 날짜순으로 보인다: "10/28 김민지 — 계란말이 다 먹음", "10/26 박주형 — 시금치나물 버림".
3. 버린 항목이 많은 재료 이름을 보고 "이건 좀 적게 사야겠다"는 판단에 참고한다. (통계 집계·그래프는 이번 범위 밖, 목록만 제공)

## 4. 데이터 모델 변경 (제안)

```prisma
model ConsumptionEvent {
  id          String   @id @default(cuid())
  householdId String
  actorId     String      // 누가 처리했는지
  itemName    String      // FoodItem이 삭제된 뒤에도 이름은 남겨야 하므로 비정규화 저장
  category    FoodCategory
  quantity    Float?
  unit        String?
  action      ConsumptionAction  // EATEN | DISCARDED
  occurredAt  DateTime @default(now())
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  actor       User? @relation(fields: [actorId], references: [id], onDelete: SetNull)
  @@index([householdId, occurredAt])
}
enum ConsumptionAction { EATEN DISCARDED }
```

- `FoodItem` 삭제(`DELETE /api/items/[id]`)를 확장해서 `action` 파라미터를 받고, 같은 트랜잭션에서 `ConsumptionEvent`를 생성한다.
- `ShoppingItem`에 `convertedToItemId`(nullable) 같은 필드를 추가해 "이미 재고로 전환됨" 상태를 표시할지, 아니면 전환 성공 시 그냥 삭제할지는 결정 필요(5번 참고).
- 가족 탈퇴/계정 정지 시 기존 `AuditEvent`와 마찬가지로 `ConsumptionEvent`는 감사 목적상 유지한다(개인 메모와 달리 "누가 얼마나 버렸는지"는 가족 전체가 볼 수 있는 공용 정보로 설계).

## 5. 확정된 결정 사항

1. **장보기 → 재고 전환 후 원래 `ShoppingItem`은 삭제한다.** "지난번에 뭘 샀는지" 별도 조회는 이번 범위에 넣지 않는다.
2. **리뷰 화면에는 체크된(산) 장보기 항목만 끌어온다.** 아직 안 산 항목은 장보기 탭에 그대로 남는다.
3. **소비 이력 화면은 냉장고 탭 안에 동일 레벨의 새 하위 뷰로 둔다.** (냉장고 탭 상단에 "재료 목록 / 소비 이력" 같은 서브 토글, 또는 별도 서브 경로 — 구현 시 기존 `tab` 상태 패턴에 맞춰 조정)
4. **`ConsumptionEvent`는 무기한 보관한다.** 운영 부담(DB 용량 등)은 실제로 문제가 될 때 별도로 다룬다.
5. **"버렸어요" 선택 시 사유를 하나 고르게 한다** — 더 정밀한 데이터를 위해 `DiscardReason` enum 추가: `EXPIRED`(유통기한 지남) / `SPOILED`(맛·상태 변함) / `TOO_MUCH`(너무 많이 사서) / `OTHER`(기타). "다 먹었어요"는 사유 없이 바로 기록.

## 6. 데이터 모델 (확정)

```prisma
enum ConsumptionAction { EATEN DISCARDED }
enum DiscardReason { EXPIRED SPOILED TOO_MUCH OTHER }

model ConsumptionEvent {
  id          String   @id @default(cuid())
  householdId String
  actorId     String?
  itemName    String
  category    FoodCategory
  quantity    Float?
  unit        String?
  action      ConsumptionAction
  discardReason DiscardReason?   // action=DISCARDED일 때만 값 존재
  occurredAt  DateTime @default(now())
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)
  actor       User? @relation(fields: [actorId], references: [id], onDelete: SetNull)
  @@index([householdId, occurredAt])
}
```

## 7. API 변경 (구현 범위)

- `POST /api/shopping/complete`: 체크된 `ShoppingItem` id 목록 → 리뷰용 프리필(이름, 추천 카테고리) 반환. 체크 안 된 id가 섞이면 거부.
- `POST /api/shopping/complete` 2단계 확정 엔드포인트 또는 기존 `POST /api/items/bulk`를 확장해 전환 성공 시 해당 `ShoppingItem`들을 같은 트랜잭션에서 삭제.
- `DELETE /api/items/[id]` 확장: body `{ action: 'EATEN' }` 또는 `{ action: 'DISCARDED', discardReason: 'EXPIRED'|'SPOILED'|'TOO_MUCH'|'OTHER' }` 필수. 트랜잭션으로 `ConsumptionEvent` 생성 후 `FoodItem` 삭제.
- `GET /api/consumption`: 가족 범위 이력 목록(최신순, 페이지네이션).

## 8. 화면 변경 (구현 범위)

- **장보기 탭**: 체크된 항목이 1개 이상이면 "재고에 담기 (N개)" 버튼 노출 → 리뷰 시트(보관 위치 추천값 포함, 유통기한/수량 입력) → 일괄 등록.
- **냉장고 탭**: 상단에 "재료 목록 / 소비 이력" 서브 전환. 재료 목록은 기존 그대로, 소비 이력은 날짜별 "이름 · 다 먹음/버림(사유) · 처리자" 목록.
- **삭제 확인 다이얼로그 변경**: 기존 `window.confirm` 단순 확인을 "다 먹었어요 / 버렸어요" 선택 다이얼로그로 교체. "버렸어요" 선택 시 사유 4개 중 하나 추가 선택. 유통기한이 이미 지난 재료는 기본 선택을 "버렸어요 → 유통기한 지남"으로 미리 맞춰준다.

**작성일**: 2026-10-29
