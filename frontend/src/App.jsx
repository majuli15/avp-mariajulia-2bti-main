import { useState } from "react";
import './App.css';

import CadastrarUsuario from "./pages/CadastrarUsuario";
import Login from "./pages/Login";
import Produtos from "./pages/Produtos";

function App() {
  const [tela, setTela] = useState("cadastro");
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  function entrar(tokenRecebido) {
    setToken(tokenRecebido);
  }

  function sair() {
    localStorage.removeItem("token");
    setToken(null);
    setTela("login");
  }

  if (token) {
    return <Produtos onLogout={sair} />;
  }

  return (
    <>
      {tela === "cadastro" ? (
        <>
          <CadastrarUsuario />

          <div className="text-center bg-slate-100 pb-6">
            <p>
              Já possui uma conta?
              <button
                onClick={() => setTela("login")}
                className="text-blue-600 font-semibold ml-2 cursor-pointer"
              >
                Entrar
              </button>
            </p>
          </div>
        </>
      ) : (
        <>
          <Login onLogin={entrar} />

          <div className="text-center bg-slate-100 pb-6">
            <p>
              Ainda não possui uma conta?
              <button
                onClick={() => setTela("cadastro")}
                className="text-blue-600 font-semibold ml-2 cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        </>
      )}
    </>
  );
}

export default App;