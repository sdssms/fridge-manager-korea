import { PrismaClient, FridgeType, FoodCategory, BabyFoodStage } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 냉장고 생성
  const normalFridge = await prisma.fridge.create({
    data: {
      name: '일반 냉장고',
      type: FridgeType.NORMAL_FRIDGE,
      householdId: 'legacy-household',
    },
  })

  const kimchiFridge = await prisma.fridge.create({
    data: {
      name: '김치냉장고',
      type: FridgeType.KIMCHI_FRIDGE,
      householdId: 'legacy-household',
    },
  })

  // 식재료 추가
  await prisma.foodItem.createMany({
    data: [
      // 긴급 - 오늘/내일까지
      {
        name: '우유',
        category: FoodCategory.DAIRY,
        quantity: 1,
        unit: 'L',
        expiryDate: new Date(), // 오늘
        fridgeId: normalFridge.id,
      },
      {
        name: '시금치나물',
        category: FoodCategory.SIDE_DISH,
        quantity: 1,
        unit: '중용기',
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 내일
        fridgeId: normalFridge.id,
      },
      {
        name: '흰살생선 큐브',
        category: FoodCategory.BABY_FOOD,
        babyFoodStage: BabyFoodStage.MIDDLE,
        cubeCount: 6,
        unit: '큐브',
        expiryDate: new Date(), // 오늘
        fridgeId: normalFridge.id,
      },
      
      // 주의 - 3일 이내
      {
        name: '배추김치',
        category: FoodCategory.KIMCHI,
        quantity: 1,
        unit: 'kg',
        kimchiType: '배추김치',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        fridgeId: kimchiFridge.id,
      },
      {
        name: '멸치볶음',
        category: FoodCategory.SIDE_DISH,
        quantity: 1,
        unit: '중용기',
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        fridgeId: normalFridge.id,
      },
      
      // 신선 - 7일 이상
      {
        name: '계란',
        category: FoodCategory.ETC,
        quantity: 10,
        unit: '개',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        fridgeId: normalFridge.id,
      },
      {
        name: '깍두기',
        category: FoodCategory.KIMCHI,
        quantity: 500,
        unit: 'g',
        kimchiType: '깍두기',
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        fridgeId: kimchiFridge.id,
      },
      {
        name: '쌀미음 큐브',
        category: FoodCategory.BABY_FOOD,
        babyFoodStage: BabyFoodStage.MIDDLE,
        cubeCount: 15,
        unit: '큐브',
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        fridgeId: normalFridge.id,
      },
      {
        name: '당근 큐브',
        category: FoodCategory.BABY_FOOD,
        babyFoodStage: BabyFoodStage.MIDDLE,
        cubeCount: 12,
        unit: '큐브',
        expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        fridgeId: normalFridge.id,
      },
    ],
  })

  console.log('✅ 테스트 데이터 생성 완료!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
