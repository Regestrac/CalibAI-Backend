import express from 'express';

const PORT = process.env.PORT;

const app = express();

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Gateway request success.' });
});

app.listen(PORT, () => {
  console.log(`Gateway started on port: ${PORT}`)
})