import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
import { FindPaymentUseCase } from '../find-payment.usecase';

const mockPaymentRepository = {
  findById: jest.fn(),
};

const dummyPaymentEntity = PaymentEntity.create({
  id: 'test-id',
  cpf: '111.111.111-11',
  amount: 100,
  description: 'Test',
  status: PaymentStatus.PENDING,
  paymentMethod: PaymentMethod.PIX,
});

describe('FindPaymentUseCase', () => {
  let useCase: FindPaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<FindPaymentUseCase>(FindPaymentUseCase);
    jest.clearAllMocks();
  });

  it('should call repository.findById and return the payment', async () => {
    mockPaymentRepository.findById.mockResolvedValue(dummyPaymentEntity);

    const result = await useCase.execute({ id: 'test-id' });

    expect(mockPaymentRepository.findById).toHaveBeenCalledWith('test-id');
    expect(result).toEqual(dummyPaymentEntity);
  });

  it('should throw an error if payment is not found', async () => {
    mockPaymentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'not-found-id' })).rejects.toThrow(
      'Payment not found: not-found-id',
    );
  });
});
