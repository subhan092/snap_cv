/*
  Warnings:

  - The primary key for the `Resume` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Education` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Experience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Education" DROP CONSTRAINT "Education_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_resumeId_fkey";

-- AlterTable
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_pkey",
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "template" TEXT NOT NULL DEFAULT 'modern',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Resume_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Resume_id_seq";

-- DropTable
DROP TABLE "Education";

-- DropTable
DROP TABLE "Experience";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "Skill";
