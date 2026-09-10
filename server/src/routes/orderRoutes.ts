import { Router } from 'express';
import {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getAdminStats,
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();
router.get('/my', protect, getMyOrders);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
export default router;
