import express from 'express';
import connectDB from './config/db.js';
import dns from 'dns';
import router from './routes/auth.route.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use("/", router)

app.get("/", (req, res) => {
  res.json({ message: "Hello from auth" })
})

app.listen(PORT, () => {
  console.log(`Auth service running on poer: ${PORT}`)

  connectDB();
})