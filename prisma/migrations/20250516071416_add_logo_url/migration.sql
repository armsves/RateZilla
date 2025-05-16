/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `projectId` on the `Comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `ProjectMetrics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `Vote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMetrics" DROP CONSTRAINT "ProjectMetrics_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_projectId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMetrics" DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "github_url" TEXT,
    "twitter_url" TEXT,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "interactions" INTEGER NOT NULL DEFAULT 0,
    "last_interaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_metrics" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "github_stars" INTEGER NOT NULL DEFAULT 0,
    "github_forks" INTEGER NOT NULL DEFAULT 0,
    "github_last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitter_followers" INTEGER NOT NULL DEFAULT 0,
    "twitter_last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_freshness" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "social_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_address_key" ON "contracts"("address");

-- CreateIndex
CREATE INDEX "contracts_address_idx" ON "contracts"("address");

-- CreateIndex
CREATE UNIQUE INDEX "social_metrics_project_id_key" ON "social_metrics"("project_id");

-- CreateIndex
CREATE INDEX "social_metrics_project_freshness_idx" ON "social_metrics"("project_freshness" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMetrics_projectId_key" ON "ProjectMetrics"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_projectId_userId_key" ON "Vote"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_metrics" ADD CONSTRAINT "social_metrics_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMetrics" ADD CONSTRAINT "ProjectMetrics_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
