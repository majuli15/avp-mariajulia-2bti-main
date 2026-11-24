import { useEffect, useState } from "react";

export default function Produtos({ onLogout }) {
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    async function carregarProdutos() {
        setCarregando(true);
        setErro("");

        try {
            const token = localStorage.getItem("token");

            const resposta = await fetch("/produtos", {
               headers: {
               Authorization: `Bearer ${token}`
             }
            });
            const texto = await resposta.text();
            const dados = texto ? JSON.parse(texto) : [];

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || "Erro ao carregar produtos."
                );
            }

            setProdutos(dados);
        } catch (error) {
            setErro(error.message || "Falha ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarProdutos();
    }, []);

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
             <h1 className="text-3xl font-bold text-blue-600">
                 Gerenciamento de Produtos
             </h1>

    <button
        onClick={onLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
    >
        Sair
    </button>
</div>
                {carregando && (
                    <p className="text-gray-600">
                        Carregando produtos...
                    </p>
                )}

                {erro && (
                    <p role="alert" className="text-red-600 mb-4">
                        {erro}
                    </p>
                )}

                {!carregando && !erro && produtos.length === 0 && (
                    <p className="text-gray-600">
                        Nenhum produto cadastrado.
                    </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">

                    {produtos.map((produto) => (
                        <div
                            key={produto.id}
                            className="bg-white p-5 rounded-xl shadow"
                        >
                            <h2 className="text-xl font-bold text-gray-800">
                                {produto.nome}
                            </h2>

                            <p className="text-gray-600">
                                Categoria: {produto.categoria}
                            </p>

                            <p className="text-gray-600">
                                Preço: R$ {Number(produto.preco).toFixed(2)}
                            </p>

                            <p className="text-gray-600">
                                Estoque: {produto.estoque}
                            </p>
                        </div>
                    ))}

                </div>

            </div>
        </main>
    );
}