import { Payment } from '../../../../../generated/prisma/client';
import {
  PaymentEntity,
  PaymentMethod,
  PaymentProps,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { Amount } from '../../../../domain/value-objects/amount.vo';
import { Cpf } from '../../../../domain/value-objects/cpf.vo';

export class PaymentPrismaMapper {
  static toDomain(prismaPayment: Payment): PaymentEntity {
    const paymentProps: PaymentProps = {
      cpf: Cpf.create(prismaPayment.cpf),
      amount: Amount.create(Number(prismaPayment.amount)),
      description: prismaPayment.description,
      paymentMethod: prismaPayment.paymentMethod as PaymentMethod,
      status: prismaPayment.status as PaymentStatus,
      createdAt: prismaPayment.createdAt,
      external_reference: prismaPayment.external_reference ?? undefined,
    };
    return new PaymentEntity(paymentProps, prismaPayment.id);
  }

  static toPersistence(paymentEntity: PaymentEntity) {
    return {
      id: paymentEntity.id,
      cpf: paymentEntity.cpf.value,
      amount: paymentEntity.amount.value,
      description: paymentEntity.description,
      paymentMethod: paymentEntity.paymentMethod,
      status: paymentEntity.status,
      createdAt: paymentEntity.createdAt,
      external_reference: paymentEntity.externalReference,
    };
  }
}
