/*
  Warnings:

  - A unique constraint covering the columns `[stripeProductId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "givingUserId" TEXT NOT NULL,
    "receivingUserId" TEXT NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripePriceId_key" ON "Donation"("stripePriceId");

-- CreateIndex
CREATE INDEX "Donation_givingUserId_idx" ON "Donation"("givingUserId");

-- CreateIndex
CREATE INDEX "Donation_receivingUserId_idx" ON "Donation"("receivingUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeProductId_key" ON "User"("stripeProductId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_givingUserId_fkey" FOREIGN KEY ("givingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_receivingUserId_fkey" FOREIGN KEY ("receivingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
