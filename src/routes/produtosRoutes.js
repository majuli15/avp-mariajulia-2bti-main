import express from "express";

app.get("/produtos", listarProdutos);
app.post("/produtos", autenticarToken, cadastrarProduto);
app.patch("/produtos/:id", autenticarToken, editarProduto);
app.delete("/produtos/:id", autenticarToken, deletarProduto);
