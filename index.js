const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//MiddleWar:
app.use(cors());
app.use(express.json());

// MongoDB application code
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ds9li.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "your authorization filed" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "please valid token provide" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db("carRepaire").collection("services");
    const orderCollection = client.db("carRepaire").collection("order");

    // auth
    app.post("/login", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // all services product find
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const userData = await cursor.toArray();
      res.send(userData);
    });

    // one service product find
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const services = await servicesCollection.findOne(query);
      res.send(services);
    });

    // post
    app.post("/service", async (req, res) => {
      const newServices = req.body;
      const result = await servicesCollection.insertOne(newServices);
      console.log(result);
      res.send(result);
    });
    // delete

    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });

    // order details api
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.get("/order", verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query;

      if (email?.email === decodedEmail) {
        const query = { email: email.email };
        const cursor = orderCollection.find(query);
        const order = await cursor.toArray();
        res.send(order);
      } else {
        res.status.send({ message: "not valid token" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (reg, res) => {
  res.send("hello mongodb");
});

app.listen(port, () => {
  console.log(port);
});
