import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';
import { cancelUnpaidOrder, getOrderForUser, PaymentError } from '../services/payment.service';

export const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.get('/me', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20);
    if (!Number.isInteger(page) || page < 1 || page > 100000 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new PaymentError('Invalid pagination.');
    }
    const where = { userId: req.user!.id };
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * limit, take: limit,
        select: { id: true, orderNumber: true, createdAt: true, status: true, paymentStatus: true, totalAmount: true, currency: true } }),
      prisma.orders.count({ where }),
    ]);
    res.json({ status: 'success', data: { orders, pagination: { page, limit, total } } });
  } catch (error) { next(error); }
});
orderRouter.get('/:id', async (req, res, next) => {
  try { res.json({ status: 'success', data: { order: await getOrderForUser(String(req.params.id), req.user!.id) } }); }
  catch (error) { next(error); }
});
orderRouter.post('/:id/cancel', async (req, res, next) => {
  try { res.json({ status: 'success', data: { order: await cancelUnpaidOrder(String(req.params.id), req.user!.id) } }); }
  catch (error) { next(error); }
});
