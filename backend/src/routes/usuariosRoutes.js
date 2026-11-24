
import express from "express";

import {
    cadastrarUsuario,
    login
} from "../controllers/usuariosController.js";

const router = express.Router();

router.post("/", cadastrarUsuario);
router.post("/login", login);

export default router;
