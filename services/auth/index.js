import express from 'express';
import connectDB from './config/db.js';

const PORT = process.env.PORT;

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello from auth" })
})

app.listen(PORT, () => {
  console.log(`Auth service running on poer: ${PORT}`)

  connectDB();
})