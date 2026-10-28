# 🇰🇷 우리집 냉장고 - 한국형 냉장고 재고 관리

> 김치, 밑반찬, 이유식까지 관리하는 한국 가정 맞춤형 식재료 관리 서비스

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)

## ✨ 주요 기능

### 🎯 한국형 특화 기능
- **김치 관리** 🥬 - 배추김치, 깍두기, 총각김치 등 12종 프리셋
- **밑반찬 관리** 🍱 - 멸치볶음, 콩자반 등 20종 프리셋
- **이유식 관리** 🍼 - 큐브 단위 관리 (1큐브 = 30ml)
- **김치냉장고 지원** - 일반냉장고와 분리 관리

### 📊 실용 기능
- ⏰ **유통기한 색상 알림** (🔴 긴급 / 🟡 주의 / 🟢 신선)
- 📱 **직관적인 대시보드** (한눈에 보는 통계)
- 🧊 **냉장고 타입별 관리** (냉장/냉동/김치/밑반찬)
- 📅 **D-Day 계산** 자동

## 🖼️ 스크린샷

![메인 화면](docs/screenshot-main.png)

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL, Prisma ORM
- **Infrastructure**: Docker, Docker Compose

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/fridge-manager-korea.git
cd fridge-manager-korea
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 데이터베이스 실행
```bash
docker-compose up -d
```

### 4. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일 수정
```

### 5. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

### 6. 테스트 데이터 생성 (선택)
```bash
npx tsx prisma/seed.ts
```

### 7. 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000 에서 확인하세요!

## 📦 배포

### Docker Compose 프로덕션 배포
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 환경 변수
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## 🗂️ 프로젝트 구조

```
fridge-manager-korea/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── fridges/      # 냉장고 API
│   │   └── items/        # 식재료 API
│   └── page.tsx          # 메인 페이지
├── prisma/
│   ├── schema.prisma     # DB 스키마
│   └── seed.ts           # 시드 데이터
├── lib/
│   └── prisma.ts         # Prisma Client
└── docker-compose.yml    # Docker 설정
```

## 🎨 주요 컴포넌트

### 식재료 카테고리
- 🥬 김치/장아찌 (KIMCHI)
- 🍱 밑반찬 (SIDE_DISH)
- 🍼 이유식 (BABY_FOOD)
- 🥩 육류/생선 (MEAT_FISH)
- 🥕 채소/과일 (VEGETABLE_FRUIT)
- 🥛 유제품 (DAIRY)
- 🍲 국/찌개/육수 (SOUP_STEW)
- 🧂 장류/양념 (SAUCE_SEASONING)

### 냉장고 타입
- 일반 냉장고 (NORMAL_FRIDGE)
- 일반 냉동실 (NORMAL_FREEZER)
- 김치냉장고 (KIMCHI_FRIDGE)
- 밑반찬 냉장고 (SIDE_DISH_FRIDGE)

## 🔮 로드맵

### Phase 1: MVP ✅
- [x] 식재료 CRUD
- [x] 유통기한 관리
- [x] 색상 코딩 알림
- [x] 이유식 큐브 관리
- [x] 한글 UI

### Phase 2: 실용성 ⏳
- [ ] 식재료 등록 폼
- [ ] 바코드 스캔
- [ ] 영수증 OCR
- [ ] 푸시 알림
- [ ] 가족 공유

### Phase 3: 고도화 📅
- [ ] AI 레시피 추천
- [ ] 장보기 리스트
- [ ] 통계 대시보드
- [ ] PWA 지원

## 🤝 기여하기

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

## 👨‍💻 개발자

Smith Sung ([@smithsung](https://github.com/smithsung))

## 🙏 감사

- [FridgeBuddy](https://apps.apple.com/fridgebuddy) - UI/UX 영감
- [Next.js](https://nextjs.org/) - 프레임워크
- [Prisma](https://www.prisma.io/) - ORM
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링

---

**Made with ❤️ for Korean Families**
