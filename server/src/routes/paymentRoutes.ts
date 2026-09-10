import { Router } from 'express';
import { createCheckoutSession, verifyOrder } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = Router();
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/verify/:orderId', protect, verifyOrder);
export default router;
