import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = 3000;

const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_do_projeto";

app.use(express.json());

// =====================================================
// CONFIGURAÇÃO DA PASTA DE UPLOADS
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// =====================================================
// DADOS EM MEMÓRIA
// =====================================================

const usuarios = [];

const produtos = [
  {
    id: 1,
    nome: "Notebook",
    preco: 3500,
    categoria: "Informática",
    estoque: 10,
    imagem: null
  },
  {
    id: 2,
    nome: "Mouse Gamer",
    preco: 150,
    categoria: "Periféricos",
    estoque: 25,
    imagem: null
  }
];

let proximoIdUsuario = 1;
let proximoIdProduto = 3;

// =====================================================
// ROTA INICIAL
// =====================================================

app.get("/", (req, res) => {
  res.json({
    mensagem: "API de Cadastro de Produtos funcionando!",
    disciplina: "Desenvolvimento de Websites",
    bimestre: "3º bimestre",
    documentacao: "/api-docs"
  });
});

// =====================================================
// CADASTRO DE USUÁRIO
// POST /usuarios
// =====================================================

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
      return res.status(409).json({
        mensagem: "Este email já está cadastrado"
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: proximoIdUsuario++,
      nome,
      email,
      senha: senhaCriptografada
    };

    usuarios.push(novoUsuario);

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

// =====================================================
// LOGIN
// POST /login
// =====================================================

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
      token: token
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao realizar login"
    });
  }
});

// =====================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// =====================================================

function autenticarToken(req, res, next) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({
      mensagem: "Token não informado"
    });
  }

  const partes = cabecalho.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato do token inválido. Use: Bearer TOKEN"
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

// =====================================================
// CRUD DE PRODUTOS
// =====================================================

// CADASTRAR PRODUTO
// POST /produtos

app.post("/produtos", autenticarToken, (req, res) => {
  const { nome, preco, categoria, estoque } = req.body;

  if (
    !nome ||
    preco === undefined ||
    !categoria ||
    estoque === undefined
  ) {
    return res.status(400).json({
      mensagem: "Nome, preço, categoria e estoque são obrigatórios"
    });
  }

  const novoProduto = {
    id: proximoIdProduto++,
    nome,
    preco: Number(preco),
    categoria,
    estoque: Number(estoque),
    imagem: null
  };

  produtos.push(novoProduto);

  res.status(201).json({
    mensagem: "Produto cadastrado com sucesso",
    produto: novoProduto
  });
});

// LISTAR PRODUTOS
// GET /produtos

app.get("/produtos", autenticarToken, (req, res) => {
  res.json(produtos);
});

// CONSULTAR PRODUTO POR ID
// GET /produtos/:id

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

// EDITAR PRODUTO
// PUT /produtos/:id

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
    mensagem: "Produto atualizado com sucesso",
    produto: produto
  });
});

// EXCLUIR PRODUTO
// DELETE /produtos/:id

app.delete("/produtos/:id", autenticarToken, (req, res) => {
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
});

// =====================================================
// UPLOAD DE IMAGEM
// POST /upload
// =====================================================

const armazenamento = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);

    const nomeUnico =
      `${Date.now()}-${Math.round(Math.random() * 1000000000)}${extensao}`;

    cb(null, nomeUnico);
  }
});

const filtroArquivo = (req, file, cb) => {
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG, PNG ou WEBP são permitidas"));
  }
};

const upload = multer({
  storage: armazenamento,
  fileFilter: filtroArquivo,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.post(
  "/upload",
  autenticarToken,
  upload.single("imagem"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        mensagem: "Nenhuma imagem foi enviada"
      });
    }

    res.status(201).json({
      mensagem: "Imagem enviada com sucesso",
      arquivo: {
        nome: req.file.filename,
        tamanho: req.file.size,
        tipo: req.file.mimetype,
        pasta: "uploads"
      }
    });
  }
);

// =====================================================
// TRATAMENTO DE ERROS DO UPLOAD
// =====================================================

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        mensagem: "O arquivo não pode ter mais de 5 MB"
      });
    }

    return res.status(400).json({
      mensagem: "Erro no upload do arquivo"
    });
  }

  if (err) {
    return res.status(400).json({
      mensagem: err.message
    });
  }

  next();
});

// =====================================================
// SWAGGER
// =====================================================

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "API de Cadastro de Produtos",
      version: "1.0.0",
      description:
        "API REST para cadastro e gerenciamento de produtos."
    },

    servers: [
      {
        url: "http://localhost:3000"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      schemas: {
        Produto: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            nome: {
              type: "string",
              example: "Notebook"
            },
            preco: {
              type: "number",
              example: 3500
            },
            categoria: {
              type: "string",
              example: "Informática"
            },
            estoque: {
              type: "integer",
              example: 10
            },
            imagem: {
              type: "string",
              nullable: true,
              example: null
            }
          }
        },

        UsuarioCadastro: {
          type: "object",
          required: ["nome", "email", "senha"],
          properties: {
            nome: {
              type: "string",
              example: "Maria"
            },
            email: {
              type: "string",
              example: "maria@email.com"
            },
            senha: {
              type: "string",
              example: "123456"
            }
          }
        },

        Login: {
          type: "object",
          required: ["email", "senha"],
          properties: {
            email: {
              type: "string",
              example: "maria@email.com"
            },
            senha: {
              type: "string",
              example: "123456"
            }
          }
        }
      }
    }
  },

  apis: ["./server.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// =====================================================
// DOCUMENTAÇÃO SWAGGER
// =====================================================

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
 *     summary: Cadastra um usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCadastro'
 *     responses:
 *       201:
 *         description: Usuário cadastrado
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Realiza login
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login realizado e token gerado
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
 *
 *   post:
 *     summary: Cadastra um produto
 *     tags: [Produtos]
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
 *         description: Produto cadastrado
 */

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Consulta produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 *
 *   put:
 *     summary: Edita produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto atualizado
 *
 *   delete:
 *     summary: Exclui produto pelo ID
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto excluído
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Envia uma imagem
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagem
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagem enviada com sucesso
 */

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log(`Documentação em http://localhost:${port}/api-docs`);
});