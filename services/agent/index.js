import express from 'express';

const PORT = process.env.PORT;

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Agent" });
})

app.listen(PORT, () => {
  console.log(`Agent started at port: ${PORT}`)
})