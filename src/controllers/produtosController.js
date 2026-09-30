import produtos from "../data/produtos.js";

export function listarProdutos(req, res) {
    res.json(produtos);
}

export function buscarProduto(req, res) => {
  res.json({
    mensagem: "API funcionando!",
    disciplina: "Desenvolvimento de Sistemas",
    bimestre: "AV1 + AV2",
    documentacao: "/api-docs"
  });
}

export function cadastrarProduto(req, res) => {
  const { nome, preco, categoria, estoque } = req.body;

  if (
    !nome ||
    preco === undefined ||
    !categoria ||
    estoque === undefined
  ) {
    return res.status(400).json({
      mensagem:
        "Nome, preço, categoria e estoque são obrigatórios"
    });
  }

  const novoProduto = {
    id: proximoIdProduto,
    nome,
    preco: Number(preco),
    categoria,
    estoque: Number(estoque)
  };

  produtos.push(novoProduto);
  proximoIdProduto++;

  res.status(201).json({
    mensagem: "Produto cadastrado com sucesso",
    produto: novoProduto
  });
}

export function editarProduto(req, res) => {
  const id = Number(req.params.id);

  const produto = produtos.find(
    (produto) => produto.id === id
  );

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado"
    });
  }

  const { nome, preco, categoria, estoque } = req.body;

  if (nome !== undefined) {
    produto.nome = nome;
  }

  if (preco !== undefined) {
    produto.preco = Number(preco);
  }

  if (categoria !== undefined) {
    produto.categoria = categoria;
  }

  if (estoque !== undefined) {
    produto.estoque = Number(estoque);
  }

  res.json({
    mensagem: "Produto atualizado parcialmente com sucesso",
    produto
  });
}

export function deletarProduto(req, res) => {
  const id = Number(req.params.id);

  const indice = produtos.findIndex(
    (produto) => produto.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      mensagem: "Produto não encontrado"
    });
  }

  const produtoRemovido = produtos.splice(indice, 1)[0];

  res.json({
    mensagem: "Produto excluído com sucesso",
    produto: produtoRemovido
  });
}