import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../../domain/entities/payment.entity';
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

    const entity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });

    const result = await repository.create(entity);

    expect(prismaMock.payment.create).toHaveBeenCalled();
    expect(result).toBeInstanceOf(PaymentEntity);
  });

  it('updates a payment', async () => {
    prismaMock.payment.update.mockResolvedValue(prismaPayment);

    const entity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });

    const result = await repository.update(entity);

    expect(prismaMock.payment.update).toHaveBeenCalled();
    expect(result).toBeInstanceOf(PaymentEntity);
  });

  it('finds payment by id', async () => {
    prismaMock.payment.findUnique.mockResolvedValue(prismaPayment);

    const result = await repository.findById('test-id');

    expect(result?.id).toBe('test-id');
  });

  it('filters payments', async () => {
    prismaMock.payment.findMany.mockResolvedValue([prismaPayment]);

    const result = await repository.filter({ status: PaymentStatus.PENDING });

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(PaymentEntity);
  });
});
