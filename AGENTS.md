<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 디자인 시스템 (필수)

Fresh Keep의 모든 UI 작업 — 화면, 컴포넌트, 랜딩페이지, 디자인 리뷰 — 은 `.claude/skills/landing-page-design/SKILL.md`의 규칙을 따른다. 프리미엄 깔끔(무신사·오늘의집 톤).

- **인앱 화면**(로그인 후 냉장고·장보기·요리·계정): SKILL.md의 **Part B(비주얼 시스템)만** 적용한다. 히어로 그라데이션 제목·tagline-reveal·전환 카피 섹션은 랜딩 전용이므로 인앱에 넣지 않는다.
- **랜딩/소개·가입 유도 페이지**: Part A(전략·구조·카피·FAQ·SEO)와 Part B를 모두 적용한다.
- 핵심 Part B 규칙 요약: 폰트는 Geist/Manrope/Poppins(Inter·Roboto 금지, italic·900 weight 금지); 한글은 필요 시 Pretendard. 폰트 크기는 Tailwind 기본 스케일에 스냅. 간격은 0·2·4·8·12·16·24·32·40·48·64·80·96px만. radius는 Tailwind 값, 중첩 공식 `inner = outer − gap`. 배경 그라데이션 금지·카드 한쪽 테두리 금지. 아이콘은 Phosphor/Solar/Iconamoon. 트랜지션은 custom cubic-bezier, 스크롤 리빌은 IntersectionObserver. hover/active/focus/loading/empty/error 상태 전부 구현. 모바일 390px·PC 1280px 둘 다 검증, 터치 영역 ≈44px.
- 디자인 가이드가 프레임워크 기본과 충돌하면 가이드가 우선하고, 사용자의 명시 지시가 가이드와 충돌하면 사용자가 우선한다.
