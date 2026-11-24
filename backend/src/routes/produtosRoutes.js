
import express from "express";

import {
    listarProdutos,
    buscarProduto,
    cadastrarProduto,
    editarProduto,
    deletarProduto
} from "../controllers/produtosController.js";

import autenticarToken from "../middlewares/autenticar.js";

const router = express.Router();

// Consultar produtos
router.get("/", listarProdutos);
router.get("/:id", buscarProduto);

// Operações protegidas pelo JWT
router.post("/", autenticarToken, cadastrarProduto);
router.patch("/:id", autenticarToken, editarProduto);
router.delete("/:id", autenticarToken, deletarProduto);

export default router;
