import { PaymentEntity } from '../entities/payment.entity.js';

export interface IPaymentRepository {
  create(payment: PaymentEntity): Promise<PaymentEntity>;
  update(payment: PaymentEntity): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByExternalReference(
    external_reference: string,
  ): Promise<PaymentEntity | null>;
}

export const IPaymentRepository = Symbol('IPaymentRepository');
