-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "badge_code" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "one_scan_only" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "activityId" INTEGER NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendScan" (
    "id" SERIAL NOT NULL,
    "scannerId" INTEGER NOT NULL,
    "scannedId" INTEGER NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_badge_code_key" ON "User"("badge_code");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_name_key" ON "Activity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FriendScan_scannerId_scannedId_key" ON "FriendScan"("scannerId", "scannedId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendScan" ADD CONSTRAINT "FriendScan_scannedId_fkey" FOREIGN KEY ("scannedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendScan" ADD CONSTRAINT "FriendScan_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
