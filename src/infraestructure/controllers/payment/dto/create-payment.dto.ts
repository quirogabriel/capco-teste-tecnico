import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDTO {
  @IsNotEmpty()
  cpf: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  paymentMethod: string;
}
