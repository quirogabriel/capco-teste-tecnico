import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../../domain/entities/payment.entity';
import { Amount } from '../../../../../domain/value-objects/amount.vo';
import { Cpf } from '../../../../../domain/value-objects/cpf.vo';
import { PaymentPrismaMapper } from '../payment.prisma.mapper';

type PrismaPayment = {
  id: string;
  cpf: string;
  description: string;
  amount: { toNumber: () => number };
  paymentMethod: string;
  status: string;
  external_reference?: string | null;
  createdAt: Date;
};

describe('PaymentPrismaMapper', () => {
  describe('toDomain', () => {
    it('should map Prisma payment to domain entity', () => {
      const prismaPayment: PrismaPayment = {
        id: 'domain-id',
        cpf: '12345678900',
        description: 'A test from prisma',
        amount: 150.75,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        external_reference: 'mp-ref-123',
        createdAt: new Date(),
      };

      const entity = PaymentPrismaMapper.toDomain(prismaPayment as any);

      expect(entity).toBeInstanceOf(PaymentEntity);
      expect(entity.id).toBe('domain-id');
      expect(entity.cpf).toBeInstanceOf(Cpf);
      expect(entity.cpf.value).toBe('12345678900');
      expect(entity.amount).toBeInstanceOf(Amount);
      expect(entity.amount.value).toBe(150.75);
      expect(entity.description).toBe('A test from prisma');
      expect(entity.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
      expect(entity.status).toBe(PaymentStatus.PAID);
      expect(entity.externalReference).toBe('mp-ref-123');
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to Prisma persistence object', () => {
      const entity = PaymentEntity.create({
        id: 'entity-id',
        cpf: '111.222.333-44',
        amount: 200,
        description: 'A test from entity',
        paymentMethod: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
      });

      const prismaObject = PaymentPrismaMapper.toPersistence(entity);

      expect(prismaObject).toMatchObject({
        id: 'entity-id',
        cpf: '11122233344',
        amount: 200,
        description: 'A test from entity',
        paymentMethod: 'PIX',
        status: 'PENDING',
        external_reference: undefined,
      });

      expect(prismaObject.createdAt).toBeInstanceOf(Date);
    });
  });
});
