-- Consumption tracking: who ate or discarded what, and why when discarded.
CREATE TYPE "ConsumptionAction" AS ENUM ('EATEN', 'DISCARDED');
CREATE TYPE "DiscardReason" AS ENUM ('EXPIRED', 'SPOILED', 'TOO_MUCH', 'OTHER');

CREATE TABLE "consumption_events" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "actorId" TEXT,
    "itemName" TEXT NOT NULL,
    "category" "FoodCategory" NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "action" "ConsumptionAction" NOT NULL,
    "discardReason" "DiscardReason",
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "consumption_events_householdId_occurredAt_idx" ON "consumption_events"("householdId", "occurredAt");

ALTER TABLE "consumption_events" ADD CONSTRAINT "consumption_events_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consumption_events" ADD CONSTRAINT "consumption_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
