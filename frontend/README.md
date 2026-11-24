# Sistema de Gerenciamento de Produtos

Aplicação escolar AV1 + AV2 para cadastro e gerenciamento de produtos. O frontend React/Vite consome uma API Node.js/Express organizada em MVC, com persistência MySQL/MariaDB via Prisma e autenticação JWT.

## Funcionalidades

- Cadastro de usuário com validação e senha armazenada com bcrypt.
- Login com emissão de JWT de uma hora.
- Consulta pública da lista e de um produto por ID.
- Cadastro, edição parcial e exclusão de produtos autenticados.
- Formulários React com validação, mensagens de retorno e estados de carregamento.
- Proxy do Vite para a API local.

## Tecnologias

- Backend: Node.js (ES modules), Express, Prisma ORM, MySQL/MariaDB, bcrypt, jsonwebtoken e Swagger.
- Frontend: React, JavaScript, Vite e Tailwind CSS.

## Estrutura

```text
backend/
  prisma/                 schema e migrations existentes
  src/config/             Prisma, JWT e Swagger
  src/controllers/        regras de requisição
  src/middlewares/        autenticação JWT
  src/models/             acesso ao banco via Prisma
  src/routes/             rotas HTTP
  server.js               inicialização da API
frontend/
  src/pages/              cadastro, login e produtos
  src/App.jsx              navegação e estado de autenticação
  vite.config.js           proxy /usuarios e /produtos
```

## Requisitos

- Node.js e npm.
- Uma instância MySQL ou MariaDB criada e acessível. As credenciais reais não fazem parte do repositório.

## Configuração do banco e ambiente

1. Crie o banco de dados no seu MySQL/MariaDB e configure o arquivo `backend/.env` a partir de `backend/.env.example`.
2. Preencha `DATABASE_URL` com a URL da sua instância e `JWT_SECRET` com uma chave aleatória de pelo menos 32 caracteres. Não use os valores de exemplo em produção e não envie `.env` ao Git.

   Formato da URL, substituindo pelos dados locais:

   ```text
   mysql://usuario:senha@localhost:3306/nome_do_banco
   ```

   Caracteres especiais em usuário ou senha devem ser codificados para URL. O `.gitignore` exclui arquivos `.env`.

3. No terminal, gere o Prisma Client:

   ```powershell
   cd backend
   npm install
   npx prisma generate
   ```

4. Revise as migrations existentes e aplique-as apenas ao banco correto, depois de conferir a URL configurada:

   ```powershell
   npx prisma migrate deploy
   ```

O schema usa `Produto` (nome, preço decimal, categoria e estoque inteiro) e `Usuario` (nome, e-mail único e hash da senha), mapeados para as tabelas `produtos` e `usuarios`. Não execute migrations contra uma instância que você não identificou.

## Executar

Abra dois terminais na raiz do repositório.

Backend:

```powershell
cd backend
npm install
npm run dev
```

A API escuta em `http://localhost:3000`; o Swagger fica em `http://localhost:3000/api-docs`.

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite. As chamadas relativas a `/usuarios` e `/produtos` são encaminhadas para o backend pela configuração existente do Vite.

## Endpoints

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/usuarios` | Público | Cadastra nome, e-mail e senha |
| `POST` | `/usuarios/login` | Público | Autentica e retorna `token` e dados públicos do usuário |
| `GET` | `/produtos` | Público | Lista produtos |
| `GET` | `/produtos/:id` | Público | Busca produto por ID |
| `POST` | `/produtos` | JWT | Cadastra produto |
| `PATCH` | `/produtos/:id` | JWT | Atualiza um ou mais campos |
| `DELETE` | `/produtos/:id` | JWT | Exclui produto |

Os campos de produto são `nome`, `preco`, `categoria` e `estoque`. Escritas recebem JSON; preço deve ser não negativo e ter até duas casas decimais, e estoque deve ser inteiro não negativo.

## Autenticação

Após login, o frontend armazena o JWT no `localStorage` e envia `Authorization: Bearer <token>` nas operações protegidas. O backend valida assinatura e expiração; tokens ausentes, inválidos ou expirados recebem HTTP 401. O botão **Sair** remove o token local. A chave JWT deve permanecer apenas no `.env` do backend.

## Verificações

Na pasta `frontend`, `npm run lint` executa o ESLint e `npm run build` compila a aplicação. O backend não possui suíte automatizada configurada; `node --check` pode ser usado para verificar sintaxe. A geração do Prisma Client não precisa conectar ao banco, mas executar operações da API exige `DATABASE_URL` válida e banco acessível.