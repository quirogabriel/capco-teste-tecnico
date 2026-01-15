import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
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
}
