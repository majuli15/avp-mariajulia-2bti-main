import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import { listarProdutos } from "./src/controllers/produtosController.js";
import swaggerSpec from "./scr/config/swagger.js";

dotenv.config();

const app = express();
const PORT = 3000;

const JWT_SECRET =
  process.env.JWT_SECRET || "chave_secreta_do_projeto";

app.use(express.json());

// ===============================
// USUÁRIOS
// ===============================

const usuarios = [];

let proximoIdUsuario = 1;

// ===============================
// PRODUTOS
// ===============================



let proximoIdProduto = 3;

app.get("/produtos", listarProdutos);



app.get("/produtos/:id", buscarProduto );

// ===============================
// CADASTRO DE USUÁRIO
// ===============================

app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, email e senha são obrigatórios"
      });
    }

    const usuarioExistente = usuarios.find(
      (usuario) => usuario.email === email
    );

    if (usuarioExistente) {
      return res.status(400).json({
        mensagem: "Email já cadastrado"
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: proximoIdUsuario,
      nome,
      email,
      senha: senhaCriptografada
    };

    usuarios.push(novoUsuario);
    proximoIdUsuario++;

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email
      }
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cadastrar usuário"
    });
  }
});

// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Email e senha são obrigatórios"
      });
    }

    const usuario = usuarios.find(
      (usuario) => usuario.email === email
    );

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos"
      });
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "Email ou senha inválidos"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email
      },
      JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      token
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao realizar login"
    });
  }
});

// ===============================
// MIDDLEWARE DE AUTENTICAÇÃO
// ===============================

function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não informado"
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato do token inválido"
    });
  }

  const token = partes[1];

  try {
    const usuario = jwt.verify(token, JWT_SECRET);

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado"
    });
  }
}

// ===============================
// GET - LISTAR PRODUTOS
// ===============================

app.get("/produtos", autenticarToken, (req, res) => {
  res.json(produtos);
});

// ===============================
// GET - BUSCAR PRODUTO POR ID
// ===============================

app.get("/produtos/:id", autenticarToken, (req, res) => {
  const id = Number(req.params.id);

  const produto = produtos.find(
    (produto) => produto.id === id
  );

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado"
    });
  }

  res.json(produto);
});

// ===============================
// POST - CADASTRAR PRODUTO
// ===============================

app.post("/produtos", autenticarToken, cadastrarProduto);

// ===============================
// PUT - ATUALIZAR PRODUTO COMPLETO
// ===============================

app.put("/produtos/:id", autenticarToken, (req, res) => {
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

  produto.nome = nome;
  produto.preco = Number(preco);
  produto.categoria = categoria;
  produto.estoque = Number(estoque);

  res.json({
    mensagem: "Produto atualizado com sucesso",
    produto
  });
});

// ===============================
// PATCH - ATUALIZAR PARCIALMENTE
// ===============================

app.patch("/produtos/:id", autenticarToken, editarProduto);

// ===============================
// DELETE - EXCLUIR PRODUTO
// ===============================

app.delete("/produtos/:id", autenticarToken, deletarProduto);

// ===============================
// SWAGGER
// ===============================



app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ===============================
// DOCUMENTAÇÃO SWAGGER
// ===============================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verifica se a API está funcionando
 *     responses:
 *       200:
 *         description: API funcionando
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login e gera token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Email ou senha inválidos
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
 *       401:
 *         description: Token não informado ou inválido
 */

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cadastra um produto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso
 *       401:
 *         description: Não autorizado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca um produto pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza um produto completamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   patch:
 *     summary: Atualiza parcialmente um produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               categoria:
 *                 type: string
 *               estoque:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado parcialmente com sucesso
 *       404:
 *         description: Produto não encontrado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 */

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(
    `Swagger disponível em http://localhost:${PORT}/api-docs`
  );
});