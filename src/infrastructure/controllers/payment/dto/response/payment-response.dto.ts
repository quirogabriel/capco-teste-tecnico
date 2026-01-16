import {
  PaymentMethod,
  PaymentStatus,
} from '../../../../../../generated/prisma/enums';

export class PaymentResponseDTO {
  id: string;
  external_reference?: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
  initPoint?: string;
}
