import { useState } from "react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function entrar(event) {
        event.preventDefault();

        setMensagem("");
        setErro("");
        setCarregando(true);

        try {
            const resposta = await fetch("/usuarios/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const texto = await resposta.text();

            let dados = {};

            try {
               dados = texto ? JSON.parse(texto) : {};
            } catch {
               throw new Error("O servidor retornou uma resposta inválida.");
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.message ||
                    dados.mensagem ||
                    "E-mail ou senha inválidos."
                );
            }

            localStorage.setItem("token", dados.token);
            onLogin(dados.token);
            setMensagem("Login realizado com sucesso!");
            setEmail("");
            setSenha("");

        } catch (error) {
            setErro(error.message || "Falha de comunicação com a API.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

                <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
                    Entrar
                </h1>

                <p className="text-center text-gray-500 mb-6">
                    Acesse sua conta.
                </p>

                <form onSubmit={entrar} className="space-y-4">

                    <div>
                        <label htmlFor="email" className="block mb-1 font-medium">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(evento) => setEmail(evento.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3"
                        />
                    </div>

                    <div>
                        <label htmlFor="senha" className="block mb-1 font-medium">
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(evento) => setSenha(evento.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="w-full border border-gray-300 rounded-lg p-3"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>

                </form>

                {mensagem && (
                    <p role="status" className="mt-4 text-center text-green-600">
                        {mensagem}
                    </p>
                )}

                {erro && (
                    <p role="alert" className="mt-4 text-center text-red-600">
                        {erro}
                    </p>
                )}

            </div>
        </main>
    );
}