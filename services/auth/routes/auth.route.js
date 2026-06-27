import express from 'express';
import { checkCredits, deductCredits, login, logout, updateUserPayment } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/update-plan', updateUserPayment);
router.post('/check-credits', checkCredits);
router.post('/deduct-credits', deductCredits);

export default router;