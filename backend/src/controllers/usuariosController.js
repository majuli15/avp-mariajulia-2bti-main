
import jwt from "jsonwebtoken";
import JWT_SECRET from "../config/jwt.js";
import bcrypt from 'bcrypt';
import * as usuariosModel from '../models/usuariosModel.js';

export async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                message: "Preencha todos os campos!"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = await usuariosModel.cadastrarUsuario(
            nome,
            email,
            senhaHash
        );

        res.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            usuario: novoUsuario
        });

    } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    if (error.code === "P2002") {
        return res.status(409).json({
            message: "Este e-mail já está cadastrado."
        });
    }

    res.status(500).json({
        message: "Erro ao cadastrar usuário."
    });
}
}

export async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                message: "Informe o e-mail e a senha!"
            });
        }

        const usuario = await usuariosModel.buscarPorEmail(email);

        if (!usuario) {
            return res.status(401).json({
                message: "E-mail ou senha incorretos!"
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senhaHash
        );

        if (!senhaValida) {
            return res.status(401).json({
                message: "E-mail ou senha incorretos!"
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
    message: "Login realizado com sucesso!",
    token,
    usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
    }
});
    } catch (error) {
        console.error("Erro ao realizar login:", error);

        res.status(500).json({
            message: "Erro ao realizar login."
        });
    }
}
