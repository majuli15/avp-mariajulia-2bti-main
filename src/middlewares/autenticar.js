export default function autenticarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      mensagem: "Token não informado"
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      mensagem: "Formato do token inválido"
    });
  }

  const token = partes[1];

  try {
    const usuario = jwt.verify(token, JWT_SECRET);

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      mensagem: "Token inválido ou expirado"
    });
  }
}