import express from 'express';

const PORT = process.env.PORT;

const app = express();

app.listen(PORT, () => {
  console.log(`Auth service running on poer: ${PORT}`)
})