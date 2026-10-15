import { z } from 'zod';
import { createCheckoutSchema } from '../validation/payment.validation';

export type CreateCheckoutDTO = z.infer<typeof createCheckoutSchema>['body'];
