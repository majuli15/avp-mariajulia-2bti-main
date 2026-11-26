/*
  Warnings:

  - You are about to drop the column `turma` on the `produtos` table. All the data in the column will be lost.
  - Added the required column `categoria` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estoque` to the `produtos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preco` to the `produtos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `produtos` DROP COLUMN `turma`,
    ADD COLUMN `categoria` VARCHAR(60) NOT NULL,
    ADD COLUMN `estoque` INTEGER NOT NULL,
    ADD COLUMN `preco` DECIMAL(10, 2) NOT NULL;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senhaHash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
