import { Request, Response } from 'express';
import Stripe from 'stripe';
import { getStripe } from '../config/stripe';
import { env } from '../config/env';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { IShippingAddress } from '../models/Order';

interface CartLine {
  productId: string;
  quantity: number;
}

const SHIPPING_FLAT = 0; // free shipping; adjust as needed
const TAX_RATE = 0; // set e.g. 0.1 for 10%

// POST /api/payment/create-checkout-session (customer)
// Body: { items: [{ productId, quantity }], shippingAddress }
export const createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress } = req.body as {
    items: CartLine[];
    shippingAddress: IShippingAddress;
  };

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }
  if (!shippingAddress?.fullName || !shippingAddress?.address) {
    throw new ApiError(400, 'Shipping address is required');
  }

  // Re-price every line on the server against the DB — never trust client prices.
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).populate('category', 'name');

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItems = [];
  let itemsPrice = 0;

  for (const line of items) {
    const product = products.find((p) => String(p._id) === line.productId);
    if (!product) throw new ApiError(400, `Product not found: ${line.productId}`);
    if (product.stock < line.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }
    const qty = Math.max(1, Math.floor(line.quantity));
    itemsPrice += product.price * qty;

    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          images: product.images.length ? [product.images[0]] : [],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: qty,
    });

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] ?? '',
      price: product.price,
      quantity: qty,
    });
  }

  const shippingPrice = SHIPPING_FLAT;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  // Create a pending order first so the webhook can reconcile it.
  const order = await Order.create({
    user: req.user!.id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: false,
    status: 'pending',
  });

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${env.clientUrl}/order-success?order=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/cart?canceled=1`,
    client_reference_id: String(order._id),
    metadata: { orderId: String(order._id), userId: req.user!.id },
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.status(201).json({ success: true, url: session.url, orderId: order._id });
});

// POST /api/payment/webhook  (Stripe -> raw body)
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const stripe = getStripe();
  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'paid';
        order.paymentIntentId = String(session.payment_intent ?? '');
        await order.save();
        // Decrement stock atomically.
        await Promise.all(
          order.items.map((item) =>
            Product.updateOne({ _id: item.product }, { $inc: { stock: -item.quantity } })
          )
        );
      }
    }
  }

  res.json({ received: true });
});

// GET /api/payment/verify/:orderId  (customer) — fallback confirmation for the success page
export const verifyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.user) !== req.user!.id && req.user!.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  res.json({ success: true, isPaid: order.isPaid, status: order.status, order });
});
