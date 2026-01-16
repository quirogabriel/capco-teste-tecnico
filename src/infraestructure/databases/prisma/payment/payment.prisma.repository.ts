import { Injectable } from '@nestjs/common';
import { PaymentWhereInput } from '../../../../../generated/prisma/models';
import { PaymentEntity } from '../../../../domain/entities/payment.entity';
import {
  FilterPaymentInput,
  IPaymentRepository,
} from '../../../../domain/repositories/payment.repository.interface';
import { PrismaService } from '../../../services/prisma/prisma.service';
import { PaymentPrismaMapper } from './payment.prisma.mapper';

@Injectable()
export class PaymentPrismaRepository implements IPaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payment: PaymentEntity): Promise<PaymentEntity> {
    const data = PaymentPrismaMapper.toPersistence(payment);
    const created = await this.prismaService.payment.create({ data });
    return PaymentPrismaMapper.toDomain(created);
  }

  async update(payment: PaymentEntity): Promise<PaymentEntity> {
    const data = PaymentPrismaMapper.toPersistence(payment);
    const updated = await this.prismaService.payment.update({
      where: { id: payment.id },
      data,
    });
    return PaymentPrismaMapper.toDomain(updated);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const found = await this.prismaService.payment.findUnique({
      where: { id },
    });
    return found ? PaymentPrismaMapper.toDomain(found) : null;
  }

  async findByExternalReference(
    external_reference: string,
  ): Promise<PaymentEntity | null> {
    const found = await this.prismaService.payment.findUnique({
      where: { external_reference },
    });
    return found ? PaymentPrismaMapper.toDomain(found) : null;
  }

  async filter(filter: FilterPaymentInput): Promise<PaymentEntity[]> {
    const where: PaymentWhereInput = {
      ...(filter.id && { id: filter.id }),
      ...(filter.external_reference && {
        external_reference: filter.external_reference,
      }),
      ...(filter.cpf && { cpf: filter.cpf }),
      ...(filter.description && {
        description: {
          contains: filter.description,
          mode: 'insensitive',
        },
      }),
      ...(filter.amount && { amount: filter.amount }),
      ...(filter.paymentMethod && {
        paymentMethod: filter.paymentMethod,
      }),
      ...(filter.status && { status: filter.status }),
    };
    const found = await this.prismaService.payment.findMany({
      where,
    });
    return found.map((p) => PaymentPrismaMapper.toDomain(p));
  }
}
