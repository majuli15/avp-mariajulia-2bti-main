import bcrypt from 'bcryptjs';
import * as usuariosModel from '../models/usuariosModel.js';

export async function cadastrarUsuario(req, res) {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await usuariosModel.cadastrarUsuario(nome, email, senhaHash);

    res.status(201).json({
        message: "Usuário cadastrado com sucesso!",
        usuario: novoUsuario,
    });
}

export async function login(req, res) {
    const { email, senha } = req.body;

    const usuario = await usuariosModel.buscarPorEmail(email);

    if (!usuario) {
        return res.status(401).json({ message: "email ou senha incorretos!" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
        return res.status(401).json({ message: "email ou senha incorretos!" });
    }

    res.json({
        message: "Login realizado com sucesso!",
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            senhaHash: usuario.senhaHash,
        },
    });
}