import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCurrentUser } from './controllers/user.controller.js';
import protect from './middleware/auth.middleware.js';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());

app.use("/api/auth", proxy(process.env.AUTH_SERVICE));

app.get("/api/me", protect, getCurrentUser)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Gateway request success.' });
});

app.listen(PORT, () => {
  console.log(`Gateway started on port: ${PORT}`)
})