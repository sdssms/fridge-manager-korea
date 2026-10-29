import type { Metadata } from 'next'
import Link from 'next/link'
import { geist } from '@/lib/fonts'
import { Reveal, WordReveal } from '@/components/landing/reveal'

export const metadata: Metadata = {
  title: 'Fresh Keep | 가족이 함께 쓰는 냉장고 관리',
  description:
    '장보기부터 보관, 요리, 소비 이력까지. 가족이 함께 쓰는 냉장고를 한 곳에서 관리하고 버리는 식재료를 줄여요.',
  openGraph: {
    title: 'Fresh Keep | 가족이 함께 쓰는 냉장고 관리',
    description:
      '장보기부터 보관, 요리, 소비 이력까지. 가족이 함께 쓰는 냉장고를 한 곳에서 관리하고 버리는 식재료를 줄여요.',
    type: 'website',
  },
}

const BRAND = '#2fa36e'

const benefits = [
  {
    title: '버릴 식재료를 먼저 보여줘요',
    body: '유통기한이 지난 재료와 3일 안에 확인할 재료를 따로 모아 보여줘요. 폐기 대상만 걸러 바로 정리할 수 있어요.',
  },
  {
    title: '장본 걸 한 번에 재고로',
    body: '장보기에서 체크한 항목을 보관 위치와 수량만 확인하면 그대로 냉장고 재고가 돼요. 다시 입력할 필요가 없어요.',
  },
  {
    title: '가족이 같은 냉장고를 봐요',
    body: '초대코드로 가족을 묶으면 재고와 장보기 목록을 함께 보고 수정해요. 누가 무엇을 먹고 버렸는지 소비 이력도 남아요.',
  },
  {
    title: '김치냉장고와 실온까지',
    body: '냉장, 냉동, 김치냉장고, 실온 보관을 모두 구분해 담을 수 있어요. 한국 가정 살림에 맞춰 설계했어요.',
  },
]

const steps = [
  {
    n: '01',
    title: '장보기 목록에 담아요',
    body: '살 것을 적고 장을 보며 체크해요. 가족이 함께 목록을 채워요.',
  },
  {
    n: '02',
    title: '체크한 걸 재고로 옮겨요',
    body: '보관 위치와 수량, 유통기한만 확인하면 냉장고 재고로 바로 등록돼요.',
  },
  {
    n: '03',
    title: '먹거나 버린 걸 기록해요',
    body: '다 먹었는지 버렸는지 한 번에 정리하면 소비 이력이 가족 공용으로 남아요.',
  },
]

const faqs = [
  {
    q: '가입하면 바로 쓸 수 있나요?',
    a: '가입 후 서비스 관리자의 승인을 거쳐 로그인할 수 있어요. 승인되면 가족을 만들거나 초대코드로 합류할 수 있어요.',
  },
  {
    q: '가족은 어떻게 연결하나요?',
    a: '한 명이 가족을 만들고 초대코드를 공유하면, 나머지 구성원이 코드로 합류를 신청하고 승인받아 같은 냉장고를 함께 써요.',
  },
  {
    q: '요리 메모도 가족에게 다 보이나요?',
    a: '재료와 소비 이력은 가족이 함께 보지만, 재료마다 적는 개인 요리 메모는 작성한 본인만 볼 수 있어요.',
  },
  {
    q: '비용이 드나요?',
    a: '지금은 무료로 쓸 수 있어요. 가입하고 가족을 연결하면 모든 기능을 바로 쓸 수 있어요.',
  },
  {
    q: '모바일에서도 편한가요?',
    a: '휴대폰과 PC 화면 모두에 맞춰 만들었어요. 장을 보며 한 손으로 체크하고 집에서 큰 화면으로 정리하기 좋아요.',
  },
  {
    q: '버린 재료는 왜 기록하나요?',
    a: '무엇을 왜 버렸는지 쌓이면 다음 장보기에서 덜 사게 돼요. 유통기한 지남, 너무 많이 삼 같은 이유까지 남겨요.',
  },
]

export default function WelcomePage() {
  return (
    <div className={`${geist.variable} min-h-screen bg-white font-sans text-neutral-900 [word-break:keep-all]`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-neutral-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        본문으로 건너뛰기
      </a>

      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight" style={{ color: BRAND }}>
          Fresh Keep
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px"
            style={{ outlineColor: BRAND }}
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
            style={{ backgroundColor: BRAND, outlineColor: BRAND }}
          >
            무료로 시작하기
          </Link>
        </nav>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 sm:pt-20">
          <Reveal>
            <h1
              className="mx-auto max-w-[680px] text-center text-4xl font-bold tracking-tight sm:text-5xl"
              style={{
                textWrap: 'balance',
                backgroundImage: 'linear-gradient(90deg, #000000, #666666)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              가족이 함께 쓰는 냉장고,
              <br />
              버리는 식재료가 줄어요
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p
              className="mx-auto mt-6 max-w-[680px] text-center text-lg text-neutral-600"
              style={{ textWrap: 'pretty' }}
            >
              장보기부터 보관, 요리, 소비 이력까지 한 곳에서. 유통기한이 임박한
              재료를 먼저 알려주고, 장본 걸 그대로 재고로 옮겨 가족이 함께 관리해요.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="w-full rounded-xl px-6 py-3 text-center text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98] sm:w-auto"
                style={{ backgroundColor: BRAND, outlineColor: BRAND }}
              >
                무료로 시작하기
              </Link>
              <Link
                href="/login"
                className="w-full rounded-xl border border-neutral-200 px-6 py-3 text-center text-base font-semibold text-neutral-700 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-px sm:w-auto"
                style={{ outlineColor: BRAND }}
              >
                이미 쓰고 있어요
              </Link>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-6 text-center text-sm text-neutral-500">
              냉장 · 냉동 · 김치냉장고 · 실온까지 한 번에 관리
            </p>
          </Reveal>
        </section>

        {/* Benefits */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ textWrap: 'balance' }}>
              사두고 잊어버린 재료, 이제 없어요
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-base text-neutral-600" style={{ textWrap: 'pretty' }}>
                    {b.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tagline reveal (B11) */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <WordReveal
            text="오늘 산 두부, 언제까지 먹을 수 있는지 가족 모두가 같은 냉장고에서 함께 봐요"
            className="mx-auto max-w-[680px] text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
          />
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ textWrap: 'balance' }}>
              세 단계면 충분해요
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
                  <span className="text-sm font-semibold" style={{ color: BRAND }}>
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-base text-neutral-600" style={{ textWrap: 'pretty' }}>
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto w-full max-w-3xl px-6 py-16">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ textWrap: 'balance' }}>
              자주 묻는 질문
            </h2>
          </Reveal>
          <dl className="mt-8 divide-y divide-neutral-200">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 50} as="div">
                <details className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2" style={{ outlineColor: BRAND }}>
                    {f.q}
                    <span
                      className="shrink-0 text-neutral-400 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-base text-neutral-600" style={{ textWrap: 'pretty' }}>
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-8">
          <Reveal>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
              <h2 className="mx-auto max-w-[680px] text-3xl font-bold tracking-tight sm:text-4xl" style={{ textWrap: 'balance' }}>
                오늘 산 재료부터 바로 담아보세요
              </h2>
              <p className="mx-auto mt-4 max-w-[680px] text-lg text-neutral-600" style={{ textWrap: 'pretty' }}>
                가입은 무료예요. 가족을 연결하고 첫 장보기 목록을 함께 채워보세요.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-block rounded-xl px-6 py-3 text-base font-semibold text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
                style={{ backgroundColor: BRAND, outlineColor: BRAND }}
              >
                무료로 시작하기
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="text-sm font-semibold" style={{ color: BRAND }}>
            Fresh Keep
          </span>
          <nav className="flex items-center gap-4 text-sm text-neutral-500">
            <Link href="/login" className="hover:text-neutral-900">
              로그인
            </Link>
            <Link href="/signup" className="hover:text-neutral-900">
              가입하기
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
