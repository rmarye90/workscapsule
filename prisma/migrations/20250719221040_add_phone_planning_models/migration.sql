-- CreateTable
CREATE TABLE "phone_slots" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "assignedUserId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "dayOfWeek" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_reminders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneSlotId" TEXT NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_reminders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "phone_slots" ADD CONSTRAINT "phone_slots_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_reminders" ADD CONSTRAINT "phone_reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
