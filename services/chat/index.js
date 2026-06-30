import express from 'express';
import connectDB from './config/db.js';
import dns from 'dns';
import router from './routes/chat.routes.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Chat" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat started on port: ${PORT}`);

  connectDB();
});