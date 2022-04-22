const express = require("express");
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

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db("carRepaire").collection("services");
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
