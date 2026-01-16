import { PaymentEntity } from '../../../../domain/entities/payment.entity';
import { PaymentResponseDTO } from '../dto/response/payment-response.dto';

export class PaymentMapper {
  static toEntityResponse(payment: PaymentEntity): PaymentResponseDTO {
    return {
      id: payment.id,
      external_reference: payment.externalReference,
      cpf: payment.cpf.value,
      description: payment.description,
      amount: payment.amount.value,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }
}
