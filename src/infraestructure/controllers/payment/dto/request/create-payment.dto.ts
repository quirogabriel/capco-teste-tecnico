import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../../../../../domain/entities/payment.entity';

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
