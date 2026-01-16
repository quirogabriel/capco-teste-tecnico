import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
import { FilterPaymentUseCase } from '../filter-payment.usecase';

const mockPaymentRepository = {
  filter: jest.fn(),
};

const dummyPaymentEntity = PaymentEntity.create({
  id: 'test-id',
  cpf: '111.111.111-11',
  amount: 100,
  description: 'Test',
  status: PaymentStatus.PENDING,
  paymentMethod: PaymentMethod.PIX,
});

describe('FilterPaymentUseCase', () => {
  let useCase: FilterPaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterPaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<FilterPaymentUseCase>(FilterPaymentUseCase);
    jest.clearAllMocks();
  });

  it('should call repository.filter with the correct filter and return the result', async () => {
    const filter = { status: PaymentStatus.PENDING };
    mockPaymentRepository.filter.mockResolvedValue([dummyPaymentEntity]);

    const result = await useCase.execute(filter);

    expect(mockPaymentRepository.filter).toHaveBeenCalledWith(filter);
    expect(result).toEqual([dummyPaymentEntity]);
  });
});
