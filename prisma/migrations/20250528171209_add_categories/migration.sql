-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ERC20Coin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ERC20Coin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ERC20Coin_address_key" ON "ERC20Coin"("address");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectCategories_AB_unique" ON "_ProjectCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectCategories_B_index" ON "_ProjectCategories"("B");

-- AddForeignKey
ALTER TABLE "_ProjectCategories" ADD CONSTRAINT "_ProjectCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectCategories" ADD CONSTRAINT "_ProjectCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
