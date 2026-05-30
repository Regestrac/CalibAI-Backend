import express from 'express';

const PORT = process.env.PORT;

const app = express()

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Chat" });
})

app.listen(PORT, () => {
  console.log(`Chat started on port: ${PORT}`)
})