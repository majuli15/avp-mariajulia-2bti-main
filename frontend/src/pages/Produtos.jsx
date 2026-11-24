import { useEffect, useState } from "react";

const formularioVazio = {
    nome: "",
    preco: "",
    categoria: "",
    estoque: ""
};

async function lerResposta(resposta) {
    const texto = await resposta.text();
    try {
        return texto ? JSON.parse(texto) : {};
    } catch {
        throw new Error("O servidor retornou uma resposta inválida.");
    }
}

async function buscarProdutos() {
    const resposta = await fetch("/produtos");
    const dados = await lerResposta(resposta);
    if (!resposta.ok) {
        throw new Error(dados.mensagem || dados.message || "Erro ao carregar produtos.");
    }
    if (!Array.isArray(dados)) {
        throw new Error("A resposta da API não contém uma lista de produtos.");
    }
    return dados;
}

export default function Produtos({ onLogout, mensagemInicial = "" }) {
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);
    const [formulario, setFormulario] = useState(formularioVazio);
    const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
    const [mensagem, setMensagem] = useState(mensagemInicial);
    const [erro, setErro] = useState("");

    async function carregarProdutos() {
        setCarregando(true);
        setErro("");

        try {
            setProdutos(await buscarProdutos());
        } catch (error) {
            setErro(error.message || "Falha ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        let ativa = true;
        async function carregarInicial() {
            try {
                const dados = await buscarProdutos();
                if (ativa) setProdutos(dados);
            } catch (error) {
                if (ativa) setErro(error.message || "Falha ao conectar com o servidor.");
            } finally {
                if (ativa) setCarregando(false);
            }
        }
        carregarInicial();
        return () => {
            ativa = false;
        };
    }, []);

    function atualizarCampo(evento) {
        setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
    }

    function iniciarEdicao(produto) {
        setProdutoEmEdicao(produto.id);
        setFormulario({
            nome: produto.nome,
            preco: String(produto.preco),
            categoria: produto.categoria,
            estoque: String(produto.estoque)
        });
        setMensagem("");
        setErro("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelarEdicao() {
        setProdutoEmEdicao(null);
        setFormulario(formularioVazio);
        setErro("");
    }

    async function salvarProduto(evento) {
        evento.preventDefault();
        setMensagem("");
        setErro("");

        const token = localStorage.getItem("token");
        if (!token) {
            setErro("Entre novamente para cadastrar ou editar produtos.");
            onLogout();
            return;
        }

        const preco = Number(formulario.preco);
        const estoque = Number(formulario.estoque);
        if (
            !formulario.nome.trim() || !formulario.categoria.trim() ||
            formulario.preco.trim() === "" || !Number.isFinite(preco) || preco < 0 ||
            formulario.estoque.trim() === "" || !Number.isInteger(estoque) || estoque < 0
        ) {
            setErro("Preencha todos os campos com valores válidos.");
            return;
        }

        setSalvando(true);
        try {
            const resposta = await fetch(
                produtoEmEdicao ? `/produtos/${produtoEmEdicao}` : "/produtos",
                {
                    method: produtoEmEdicao ? "PATCH" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nome: formulario.nome.trim(),
                        preco,
                        categoria: formulario.categoria.trim(),
                        estoque
                    })
                }
            );
            if (resposta.status === 401) {
                onLogout();
                return;
            }
            const dados = await lerResposta(resposta);
            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.message || "Não foi possível salvar o produto.");
            }

            setMensagem(dados.mensagem || (produtoEmEdicao ? "Produto atualizado." : "Produto cadastrado."));
            setProdutoEmEdicao(null);
            setFormulario(formularioVazio);
            await carregarProdutos();
        } catch (error) {
            setErro(error.message || "Falha ao comunicar com o servidor.");
        } finally {
            setSalvando(false);
        }
    }

    async function excluirProduto(produto) {
        if (!window.confirm(`Excluir o produto "${produto.nome}"?`)) return;

        const token = localStorage.getItem("token");
        if (!token) {
            onLogout();
            return;
        }

        setMensagem("");
        setErro("");
        setExcluindoId(produto.id);
        try {
            const resposta = await fetch(`/produtos/${produto.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (resposta.status === 401) {
                onLogout();
                return;
            }
            const dados = await lerResposta(resposta);
            if (!resposta.ok) {
                throw new Error(dados.mensagem || dados.message || "Não foi possível excluir o produto.");
            }

            setMensagem(dados.mensagem || "Produto excluído.");
            await carregarProdutos();
        } catch (error) {
            setErro(error.message || "Falha ao comunicar com o servidor.");
        } finally {
            setExcluindoId(null);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-blue-600">Gerenciamento de Produtos</h1>
                    <button
                        onClick={onLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Sair
                    </button>
                </div>

                <section className="bg-white p-5 rounded-xl shadow mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {produtoEmEdicao ? "Editar produto" : "Cadastrar produto"}
                    </h2>
                    <form onSubmit={salvarProduto} className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="nomeProduto" className="block mb-1 font-medium">Nome</label>
                            <input
                                id="nomeProduto"
                                name="nome"
                                value={formulario.nome}
                                onChange={atualizarCampo}
                                maxLength={100}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="categoriaProduto" className="block mb-1 font-medium">Categoria</label>
                            <input
                                id="categoriaProduto"
                                name="categoria"
                                value={formulario.categoria}
                                onChange={atualizarCampo}
                                maxLength={60}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="precoProduto" className="block mb-1 font-medium">Preço (R$)</label>
                            <input
                                id="precoProduto"
                                name="preco"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formulario.preco}
                                onChange={atualizarCampo}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label htmlFor="estoqueProduto" className="block mb-1 font-medium">Estoque</label>
                            <input
                                id="estoqueProduto"
                                name="estoque"
                                type="number"
                                min="0"
                                step="1"
                                value={formulario.estoque}
                                onChange={atualizarCampo}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 sm:col-span-2">
                            <button
                                type="submit"
                                disabled={salvando}
                                className="bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {salvando ? "Salvando..." : produtoEmEdicao ? "Salvar alterações" : "Cadastrar produto"}
                            </button>
                            {produtoEmEdicao && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicao}
                                    disabled={salvando}
                                    className="border border-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar edição
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {mensagem && <p role="status" className="mb-4 text-green-700">{mensagem}</p>}
                {carregando && <p className="text-gray-600">Carregando produtos...</p>}
                {erro && <p role="alert" className="text-red-600 mb-4">{erro}</p>}

                {!carregando && !erro && produtos.length === 0 && (
                    <p className="text-gray-600">Nenhum produto cadastrado.</p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {produtos.map((produto) => (
                        <div key={produto.id} className="bg-white p-5 rounded-xl shadow">
                            <h2 className="text-xl font-bold text-gray-800">{produto.nome}</h2>
                            <p className="text-gray-600">Categoria: {produto.categoria}</p>
                            <p className="text-gray-600">
                                Preço: {Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                            <p className="text-gray-600">Estoque: {produto.estoque}</p>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => iniciarEdicao(produto)}
                                    className="border border-blue-600 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50"
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => excluirProduto(produto)}
                                    disabled={excluindoId === produto.id}
                                    className="border border-red-600 text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                >
                                    {excluindoId === produto.id ? "Excluindo..." : "Excluir"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}