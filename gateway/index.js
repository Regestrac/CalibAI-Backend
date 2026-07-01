import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCurrentUser } from './controllers/user.controller.js';
import protect from './middleware/auth.middleware.js';
import { proxyWithHeader } from './utils/proxyWithHeader.js';
import morgan from 'morgan';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use("/api/auth", proxy(process.env.AUTH_SERVICE));
app.use("/api/chat", protect, proxyWithHeader(process.env.CHAT_SERVICE));
app.use("/api/agent", protect, proxyWithHeader(process.env.AGENT_SERVICE));
app.use("/api/billing", protect, proxyWithHeader(process.env.BILLING_SERVICE));

app.get("/api/me", protect, getCurrentUser)

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Gateway request success.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway started on port: ${PORT}`)
})