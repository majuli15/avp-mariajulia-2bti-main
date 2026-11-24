
import prisma from "../config/prisma.js";

// Cadastrar produto
export function criarProduto({ nome, preco, categoria, estoque }) {
    return prisma.produto.create({
        data: {
            nome,
            preco,
            categoria,
            estoque
        }
    });
}

// Listar todos os produtos
export function listarProdutos() {
    return prisma.produto.findMany({
        orderBy: { id: "asc" }
    });
}

// Buscar um produto pelo ID
export function buscarProdutoPorId(id) {
    return prisma.produto.findUnique({
        where: { id }
    });
}

// Atualizar produto
export function atualizarProduto(id, dados) {
    return prisma.produto.update({
        where: { id },
        data: dados
    });
}

// Excluir produto
export function deletarProduto(id) {
    return prisma.produto.delete({
        where: { id }
    });
}
