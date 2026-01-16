import { PaymentMethod, PaymentStatus } from '../../../generated/prisma/enums';
import { PaymentEntity } from '../entities/payment.entity';

export type FilterPaymentInput = {
  id?: string;
  external_reference?: string;
  cpf?: string;
  description?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
};

export interface IPaymentRepository {
  create(payment: PaymentEntity): Promise<PaymentEntity>;
  update(payment: PaymentEntity): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByExternalReference(
    external_reference: string,
  ): Promise<PaymentEntity | null>;
  filter(filter: FilterPaymentInput): Promise<PaymentEntity[]>;
}

export const IPaymentRepository = Symbol('IPaymentRepository');
