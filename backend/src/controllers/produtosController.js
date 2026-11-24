
import * as produtosModel from "../models/produtosModel.js";

// LISTAR TODOS OS PRODUTOS
export async function listarProdutos(req, res) {
    try {
        const produtos = await produtosModel.listarProdutos();
        res.json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensagem: "Erro ao listar produtos"
        });
    }
}

// BUSCAR PRODUTO PELO ID
export async function buscarProduto(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const produto = await produtosModel.buscarProdutoPorId(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        res.json(produto);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensagem: "Erro ao buscar produto"
        });
    }
}

// CADASTRAR PRODUTO
export async function cadastrarProduto(req, res) {
    try {
        const { nome, preco, categoria, estoque } = req.body;

        if (
            !nome ||
            !categoria ||
            preco === undefined ||
            estoque === undefined ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0 ||
            !Number.isInteger(Number(estoque)) ||
            Number(estoque) < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe nome, preço, categoria e estoque válidos"
            });
        }

        const novoProduto = await produtosModel.criarProduto({
            nome,
            preco: Number(preco),
            categoria,
            estoque: Number(estoque)
        });

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso",
            produto: novoProduto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensagem: "Erro ao cadastrar produto"
        });
    }
}

// EDITAR PRODUTO
export async function editarProduto(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const dados = {};
        const { nome, preco, categoria, estoque } = req.body;

        if (nome !== undefined) dados.nome = nome;
        if (categoria !== undefined) dados.categoria = categoria;

        if (preco !== undefined) {
            if (!Number.isFinite(Number(preco))) {
                return res.status(400).json({
                    mensagem: "Preço inválido"
                });
            }
            dados.preco = Number(preco);
        }

        if (estoque !== undefined) {
            if (
                !Number.isInteger(Number(estoque)) ||
                Number(estoque) < 0
            ) {
                return res.status(400).json({
                    mensagem: "Estoque inválido"
                });
            }
            dados.estoque = Number(estoque);
        }

        if (Object.keys(dados).length === 0) {
            return res.status(400).json({
                mensagem: "Informe pelo menos um campo para atualizar"
            });
        }

        const produtoAtualizado = await produtosModel.atualizarProduto(
            id,
            dados
        );

        res.json({
            mensagem: "Produto atualizado com sucesso",
            produto: produtoAtualizado
        });
    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        res.status(500).json({
            mensagem: "Erro ao atualizar produto"
        });
    }
}

// EXCLUIR PRODUTO
export async function deletarProduto(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "ID inválido"
            });
        }

        const produtoRemovido = await produtosModel.deletarProduto(id);

        res.json({
            mensagem: "Produto excluído com sucesso",
            produto: produtoRemovido
        });
    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
            return res.status(404).json({
                mensagem: "Produto não encontrado"
            });
        }

        res.status(500).json({
            mensagem: "Erro ao excluir produto"
        });
    }
}
