/*
  Warnings:

  - You are about to drop the column `photos` on the `User` table. All the data in the column will be lost.
  - Added the required column `photo` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "photos",
ADD COLUMN     "photo" TEXT NOT NULL;
