import { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../../services/payment.service';

export class PaymentsController {
  async createIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await paymentsService.createPaymentIntent(userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Payment intent created',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({
          status: 'error',
          message: 'Missing stripe-signature header',
        });
        return;
      }

      // Use rawBody captured by express.json verify middleware or fallback to req.body if buffer
      const rawBody = req.rawBody || req.body;

      if (!rawBody) {
        res.status(400).json({
          status: 'error',
          message: 'Missing raw request body for webhook verification',
        });
        return;
      }

      const result = await paymentsService.handleStripeWebhook(rawBody, signature);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentsService.verifyPayment(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
