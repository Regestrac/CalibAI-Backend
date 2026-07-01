import express from 'express';
import dns from 'dns';
import connectDB from './config/db.js';
import router from './routes/billing.routes.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use("/", router);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Billing" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Billing started on port: ${PORT}`);

  connectDB();
});