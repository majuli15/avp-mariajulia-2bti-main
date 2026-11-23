import prisma from "../config/prisma.js";

export function criarProduto({ nome, preço, categoria, estoque }) {
    return prisma.produto.create({
        data: { nome, preço, categoria, estoque }
    });
}

export function listarProdutos() {
    return prisma.produto.findMany({
        orderBy: { id: "asc" }
    });
}