import swaggerJsdoc from "swaggerJsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Cadastro de Produtos",
      version: "1.0.0",
      description:
        "API desenvolvida para AV1 + AV2"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            id: {
              type: "integer"
            },
            nome: {
              type: "string"
            },
            email: {
              type: "string"
            }
          }
        },

        Produto: {
          type: "object",
          properties: {
            id: {
              type: "integer"
            },
            nome: {
              type: "string"
            },
            preco: {
              type: "number"
            },
            categoria: {
              type: "string"
            },
            estoque: {
              type: "integer"
            }
          }
        }
      }
    }
  },

  apis: ["./server.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;