const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express4");


const userClient = require("./grpc-clients/userClient");

const resolvers = require("./resolvers");

const app = express();
app.use(cors());
app.use(express.json());


const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.gql"),
  "utf8"
);

const server = new ApolloServer({
  typeDefs,
  resolvers
});

async function start() {
  await server.start();


  app.use("/graphql", expressMiddleware(server));


  app.get("/", (req, res) => {
    res.json({
      message: "API Gateway Library running",
      status: "OK"
    });
  });

  
  app.post("/users", (req, res) => {
    const { name, email } = req.body;

    userClient.CreateUser({ name, email }, (err, response) => {
      if (err) return res.status(500).send(err);

      res.json(response);
    });
  });

  app.get("/users", (req, res) => {
    userClient.GetUsers({}, (err, response) => {
      if (err) return res.status(500).send(err);

      res.json(response);
    });
  });

 
  app.listen(3000, () => {
    console.log("API Gateway running on http://localhost:3000");
    console.log("GraphQL on http://localhost:3000/graphql");
  });
}

start();