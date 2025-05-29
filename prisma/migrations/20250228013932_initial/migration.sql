-- CreateTable
CREATE TABLE "AudiobookData" (
    "id" TEXT NOT NULL,
    "debrid_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "debrid_links" TEXT[],
    "cover_edition_key" TEXT,
    "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AudiobookData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AudiobookData_debrid_id_key" ON "AudiobookData"("debrid_id");
