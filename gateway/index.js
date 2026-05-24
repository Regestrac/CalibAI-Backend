import express from 'express';
import proxy from 'express-http-proxy';

const PORT = process.env.PORT;

const app = express();

app.use("/auth", proxy(process.env.AUTH_SERVICE));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Gateway request success.' });
});

app.listen(PORT, () => {
  console.log(`Gateway started on port: ${PORT}`)
})