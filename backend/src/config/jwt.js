import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET deve estar configurada com pelo menos 32 caracteres no .env do backend.");
}

export default JWT_SECRET;