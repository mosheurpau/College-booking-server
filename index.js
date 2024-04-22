const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xs3vutx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const collegeCollection = client
      .db("College-booking")
      .collection("colleges");
    const reviewsCollection = client
      .db("College-booking")
      .collection("reviews");
    const bookingCollection = client
      .db("College-booking")
      .collection("booking");
    const usersCollection = client.db("College-booking").collection("users");

    // insert user email if user doesn't exists
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ massage: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = await usersCollection.find(query);
      const userInfo = await cursor.toArray();
      console.log(userInfo);
      res.send(userInfo);
    });

    // Update userInfo by id
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const userInfo = req.body;
      console.log(id, userInfo);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUserInfo = {
        $set: {
          name: userInfo?.name,
          email: userInfo?.email,
          img: userInfo?.img,
          university: userInfo?.university,
          address: userInfo?.address,
          newEmail: userInfo?.newEmail,
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updateUserInfo,
        options
      );
      res.send(result);
    });

    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
    });

    // Get individual college by ID
    app.get("/college/:id", async (req, res) => {
      const { id } = req.params;
      const college = await collegeCollection.findOne({ _id: id });
      res.send(college);
    });

    app.post("/bookingCollege", async (req, res) => {
      const bookings = req.body;
      const result = await bookingCollection.insertOne(bookings);
      res.send(result);
    });

    app.get("/bookingCollege/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { candidateEmail: email };
      const cursor = await bookingCollection.find(query);
      const colleges = await cursor.toArray();
      console.log(colleges);
      res.send(colleges);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("College Booking is running");
});

app.listen(port, () => {
  console.log(`College booking app listening on port ${port}`);
});
