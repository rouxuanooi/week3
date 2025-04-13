const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const port = 3000;

const app = express();
app.use(express.json());

let db;

async function connectToMongoDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    db = client.db("testDB");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

connectToMongoDB();

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});

/* -------- USERS CRUD -------- */

// CREATE a new user
app.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await db.collection('users').insertOne({ username, email, password });
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// READ all users
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// READ single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
});

// UPDATE user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { username, email, password } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'User not found or data unchanged' });
    }
    res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID or data' });
  }
});

// DELETE user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: 'Invalid user ID' });
  }
});
