-- CreateEnum
CREATE TYPE "FridgeType" AS ENUM ('NORMAL_FRIDGE', 'NORMAL_FREEZER', 'KIMCHI_FRIDGE', 'SIDE_DISH_FRIDGE');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('KIMCHI', 'SIDE_DISH', 'SOUP_STEW', 'SAUCE_SEASONING', 'BABY_FOOD', 'MEAT_FISH', 'VEGETABLE_FRUIT', 'DAIRY', 'ETC');

-- CreateEnum
CREATE TYPE "KimchiRipeness" AS ENUM ('FRESH', 'RIPE', 'SOUR');

-- CreateEnum
CREATE TYPE "BabyFoodStage" AS ENUM ('EARLY', 'MIDDLE', 'LATE');

-- CreateTable
CREATE TABLE "fridges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FridgeType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fridges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "kimchiType" TEXT,
    "kimchiRipeness" "KimchiRipeness",
    "babyFoodStage" "BabyFoodStage",
    "cubeCount" INTEGER,
    "fridgeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "defaultShelfLife" INTEGER,
    "defaultUnit" TEXT,
    "isKimchi" BOOLEAN NOT NULL DEFAULT false,
    "kimchiType" TEXT,
    "isBabyFood" BOOLEAN NOT NULL DEFAULT false,
    "babyFoodStage" "BabyFoodStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_presets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_items_fridgeId_idx" ON "food_items"("fridgeId");

-- CreateIndex
CREATE INDEX "food_items_expiryDate_idx" ON "food_items"("expiryDate");

-- CreateIndex
CREATE INDEX "food_items_category_idx" ON "food_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "food_presets_name_key" ON "food_presets"("name");

-- AddForeignKey
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_fridgeId_fkey" FOREIGN KEY ("fridgeId") REFERENCES "fridges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
