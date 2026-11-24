import "dotenv/config";

const JWT_SECRET =
    process.env.JWT_SECRET || "chave_secreta_do_projeto";

export default JWT_SECRET;