import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

// GET /api/orders/my  (customer)
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ApiError(404, 'Order not found');
  const isOwner = String((order.user as unknown as { _id: unknown })._id ?? order.user) === req.user!.id;
  if (!isOwner && req.user!.role !== 'admin') throw new ApiError(403, 'Not authorized');
  res.json({ success: true, order });
});

// GET /api/orders  (admin)
export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// PUT /api/orders/:id/status  (admin)
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body as { status: string };
  const allowed = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid status value');
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  order.status = status as typeof order.status;
  await order.save();
  res.json({ success: true, order });
});

// GET /api/orders/admin/stats  (admin)
export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [orderCount, paidOrders, revenueAgg] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ isPaid: true }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);
  res.json({
    success: true,
    stats: {
      orderCount,
      paidOrders,
      revenue: revenueAgg[0]?.total ?? 0,
    },
  });
});
