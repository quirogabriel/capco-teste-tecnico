import { PaymentEntity } from '../../../domain/entities/payment.entity';

export type PreferenceCreationResponse = {
  external_reference: string;
  initPoint: string;
};

export type MercadoPagoPayment = {
  id: number;
  status:
    | 'approved'
    | 'pending'
    | 'in_process'
    | 'rejected'
    | 'cancelled'
    | 'refunded';
  external_reference: string;
  date_approved: string | null;
};

export interface IMercadoPagoService {
  createPreference(payment: PaymentEntity): Promise<PreferenceCreationResponse>;
  getPayment(paymentId: number): Promise<MercadoPagoPayment>;
}

export const IMercadoPagoService = Symbol('IMercadoPagoService');
