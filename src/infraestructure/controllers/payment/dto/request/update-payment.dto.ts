import { IsEnum } from 'class-validator';
import { PaymentStatus } from '../../../../../domain/entities/payment.entity';

export class UpdatePaymentDTO {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
