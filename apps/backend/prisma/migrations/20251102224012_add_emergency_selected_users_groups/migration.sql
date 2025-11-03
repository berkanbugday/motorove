-- CreateTable
CREATE TABLE "_EmergencySelectedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmergencySelectedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EmergencySelectedGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EmergencySelectedGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EmergencySelectedUsers_B_index" ON "_EmergencySelectedUsers"("B");

-- CreateIndex
CREATE INDEX "_EmergencySelectedGroups_B_index" ON "_EmergencySelectedGroups"("B");

-- AddForeignKey
ALTER TABLE "_EmergencySelectedUsers" ADD CONSTRAINT "_EmergencySelectedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Emergency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmergencySelectedUsers" ADD CONSTRAINT "_EmergencySelectedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmergencySelectedGroups" ADD CONSTRAINT "_EmergencySelectedGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Emergency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmergencySelectedGroups" ADD CONSTRAINT "_EmergencySelectedGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
