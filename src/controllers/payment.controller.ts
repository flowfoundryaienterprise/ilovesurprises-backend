import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { PaymentError } from '../services/payment.service';

const sendPaymentError = (error: unknown, res: Response, next: NextFunction) => {
  if (error instanceof PaymentError) {
    res.status(error.statusCode).json({ status: 'error', message: error.message });
    return;
  }
  next(error);
};

export const createCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await paymentService.createCheckout(req.user!.id, req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    sendPaymentError(error, res, next);
  }
};

export const getPaymentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await paymentService.getPaymentStatus(String(req.params.orderId), req.user!.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    sendPaymentError(error, res, next);
  }
};

/** Stripe webhook. Needs the raw request body for signature verification. */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    await paymentService.handleWebhook(req.body as Buffer, req.header('stripe-signature'));
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('[payments] Webhook rejected:', error?.message);
    res.status(400).json({ status: 'error', message: 'Webhook verification failed' });
  }
};

export const paymentController = { createCheckout, getPaymentStatus, handleWebhook };
