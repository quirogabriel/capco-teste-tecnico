import {
  PaymentEntity,
  PaymentInput,
  PaymentMethod,
  PaymentStatus,
} from '../../../../../domain/entities/payment.entity';
import { FilterPaymentInput } from '../../../../../domain/repositories/payment.repository.interface';
import { PaymentPrismaRepository } from '../payment.prisma.repository';

jest.mock('../../../../services/prisma/prisma.service', () => {
  return {
    PrismaService: jest.fn().mockImplementation(() => ({
      payment: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    })),
  };
});

const prismaMock = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

const prismaPayment = {
  id: 'test-id',
  cpf: '11111111111',
  amount: 100,
  description: 'Test',
  status: 'PENDING',
  paymentMethod: 'PIX',
  external_reference: null,
  createdAt: new Date(),
};

describe('PaymentPrismaRepository', () => {
  let repository: PaymentPrismaRepository;

  beforeEach(() => {
    repository = new PaymentPrismaRepository(prismaMock as any);
    jest.clearAllMocks();
  });

  it('creates a payment', async () => {
    prismaMock.payment.create.mockResolvedValue(prismaPayment);
    const input: PaymentInput = {
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    };
    const entity = PaymentEntity.create(input);

    const result = await repository.create(entity);

    expect(prismaMock.payment.create).toHaveBeenCalled();
    expect(result).toBeInstanceOf(PaymentEntity);
  });

  it('updates a payment', async () => {
    prismaMock.payment.update.mockResolvedValue(prismaPayment);
    const input: PaymentInput = {
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    };
    const entity = PaymentEntity.create(input);

    const result = await repository.update(entity);

    expect(prismaMock.payment.update).toHaveBeenCalled();
    expect(result).toBeInstanceOf(PaymentEntity);
  });

  it('finds a existing payment by external reference', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(prismaPayment);

    const result = await repository.findByExternalReference('ext-ref-123');

    expect(result?.id).toBe('test-id');
  });

  it('returns null when payment is not found by external reference', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);

    const result = await repository.findByExternalReference('ext-ref-123');

    expect(result).toBe(null);
  });

  it('finds a existing payment by id', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(prismaPayment);

    const result = await repository.findById('test-id');

    expect(result?.id).toBe('test-id');
  });

  it('returns null when payment is not found by id', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);

    const result = await repository.findById('test-id');

    expect(result).toBe(null);
  });

  describe('filter', () => {
    it('returns filtered payment list if a payment is found (by status)', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { status: PaymentStatus.PENDING };
      const result = await repository.filter(filter);

      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: { status: PaymentStatus.PENDING },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(PaymentEntity);
    });

    it('returns empty filtered payment list if no payment is found (by status)', async () => {
      prismaMock.payment.findMany.mockResolvedValue([]);
      const filter: FilterPaymentInput = { status: PaymentStatus.PENDING };
      const result = await repository.filter(filter);

      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: { status: PaymentStatus.PENDING },
      });
      expect(result).toHaveLength(0);
    });

    it('filters by id', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { id: 'test-id' };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toHaveLength(1);
    });

    it('filters by external_reference', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { external_reference: 'ext-ref-123' };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: { external_reference: 'ext-ref-123' },
      });
      expect(result).toHaveLength(1);
    });

    it('filters by cpf', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { cpf: '11111111111' };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: { cpf: '11111111111' },
      });
      expect(result).toHaveLength(1);
    });

    it('filters by description (case insensitive)', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { description: 'Test' };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: {
          description: {
            contains: 'Test',
            mode: 'insensitive',
          },
        },
      });
      expect(result).toHaveLength(1);
    });

    it('filters by amount', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = { amount: 100 };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: filter,
      });
      expect(result).toHaveLength(1);
    });

    it('filters by paymentMethod', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = {
        paymentMethod: PaymentMethod.PIX,
      };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: filter,
      });
      expect(result).toHaveLength(1);
    });

    it('filters by multiple criteria', async () => {
      prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);
      const filter: FilterPaymentInput = {
        status: PaymentStatus.PENDING,
        cpf: '11111111111',
        paymentMethod: PaymentMethod.PIX,
      };
      const result = await repository.filter(filter);
      expect(prismaMock.payment.findMany).toHaveBeenCalledWith({
        where: filter,
      });
      expect(result).toHaveLength(1);
    });
  });
});
