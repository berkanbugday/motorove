-- CreateTable
CREATE TABLE "PostAddress" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "PostAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostAddress_postId_idx" ON "PostAddress"("postId");

-- CreateIndex
CREATE INDEX "PostAddress_language_idx" ON "PostAddress"("language");

-- CreateIndex
CREATE UNIQUE INDEX "PostAddress_postId_language_key" ON "PostAddress"("postId", "language");

-- AddForeignKey
ALTER TABLE "PostAddress" ADD CONSTRAINT "PostAddress_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
