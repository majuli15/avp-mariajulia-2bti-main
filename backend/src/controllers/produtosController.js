
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
        const { nome, preco, categoria, estoque } = req.body ?? {};
        const nomeNormalizado = typeof nome === "string" ? nome.trim() : "";
        const categoriaNormalizada = typeof categoria === "string" ? categoria.trim() : "";
        const precoNumero = typeof preco === "number" || (typeof preco === "string" && preco.trim() !== "")
            ? Number(preco)
            : NaN;
        const estoqueNumero = typeof estoque === "number" || (typeof estoque === "string" && estoque.trim() !== "")
            ? Number(estoque)
            : NaN;

        if (
            !nomeNormalizado || nomeNormalizado.length > 100 ||
            !categoriaNormalizada || categoriaNormalizada.length > 60 ||
            !Number.isFinite(precoNumero) || precoNumero < 0 || precoNumero > 99999999.99 ||
            Number(precoNumero.toFixed(2)) !== precoNumero ||
            !Number.isInteger(estoqueNumero) || estoqueNumero < 0
        ) {
            return res.status(400).json({
                mensagem: "Informe nome, preço, categoria e estoque válidos"
            });
        }

        const novoProduto = await produtosModel.criarProduto({
            nome: nomeNormalizado,
            preco: precoNumero,
            categoria: categoriaNormalizada,
            estoque: estoqueNumero
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
        const { nome, preco, categoria, estoque } = req.body ?? {};

        if (nome !== undefined) {
            if (typeof nome !== "string" || !nome.trim() || nome.trim().length > 100) {
                return res.status(400).json({ mensagem: "Nome inválido" });
            }
            dados.nome = nome.trim();
        }

        if (categoria !== undefined) {
            if (typeof categoria !== "string" || !categoria.trim() || categoria.trim().length > 60) {
                return res.status(400).json({ mensagem: "Categoria inválida" });
            }
            dados.categoria = categoria.trim();
        }

        if (preco !== undefined) {
            const precoNumero = typeof preco === "number" || (typeof preco === "string" && preco.trim() !== "")
                ? Number(preco)
                : NaN;
            if (
                !Number.isFinite(precoNumero) || precoNumero < 0 ||
                precoNumero > 99999999.99 || Number(precoNumero.toFixed(2)) !== precoNumero
            ) {
                return res.status(400).json({
                    mensagem: "Preço inválido"
                });
            }
            dados.preco = precoNumero;
        }

        if (estoque !== undefined) {
            const estoqueNumero = typeof estoque === "number" || (typeof estoque === "string" && estoque.trim() !== "")
                ? Number(estoque)
                : NaN;
            if (
                !Number.isInteger(estoqueNumero) ||
                estoqueNumero < 0
            ) {
                return res.status(400).json({
                    mensagem: "Estoque inválido"
                });
            }
            dados.estoque = estoqueNumero;
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
