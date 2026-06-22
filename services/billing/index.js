import express from 'express';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Billing" });
});

app.listen(PORT, () => {
  console.log(`Billing started on port: ${PORT}`);
});