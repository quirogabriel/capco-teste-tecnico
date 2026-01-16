import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentAlreadyPaidError,
  PaymentCannotFailError,
  PaymentEntity,
  PaymentMethod,
  PaymentNotFoundError,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
import { UpdatePaymentUseCase } from '../update-payment.usecase';

const mockPaymentRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UpdatePaymentUseCase', () => {
  let useCase: UpdatePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepository },
      ],
    }).compile();

    useCase = module.get<UpdatePaymentUseCase>(UpdatePaymentUseCase);
    jest.clearAllMocks();
  });

  it('should find, update status, and save a payment if status is PENDING', async () => {
    const paymentEntity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      status: PaymentStatus.PENDING,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });
    const updateStatusSpy = jest.spyOn(paymentEntity, 'updateStatus');

    mockPaymentRepository.findById.mockResolvedValue(paymentEntity);
    mockPaymentRepository.update.mockImplementation((entity) =>
      Promise.resolve(entity),
    );

    const result = await useCase.execute({
      id: 'test-id',
      status: PaymentStatus.PAID,
    });

    expect(mockPaymentRepository.findById).toHaveBeenCalledWith('test-id');
    expect(updateStatusSpy).toHaveBeenCalledWith(PaymentStatus.PAID);
    expect(mockPaymentRepository.update).toHaveBeenCalledWith(paymentEntity);
    expect(result.status).toBe(PaymentStatus.PAID);
  });

  it('should find, update status, and save a payment if status is FAIL', async () => {
    const paymentEntity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      status: PaymentStatus.FAIL,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });
    const updateStatusSpy = jest.spyOn(paymentEntity, 'updateStatus');

    mockPaymentRepository.findById.mockResolvedValue(paymentEntity);
    mockPaymentRepository.update.mockImplementation((entity) =>
      Promise.resolve(entity),
    );

    const result = await useCase.execute({
      id: 'test-id',
      status: PaymentStatus.PAID,
    });

    expect(mockPaymentRepository.findById).toHaveBeenCalledWith('test-id');
    expect(updateStatusSpy).toHaveBeenCalledWith(PaymentStatus.PAID);
    expect(mockPaymentRepository.update).toHaveBeenCalledWith(paymentEntity);
    expect(result.status).toBe(PaymentStatus.PAID);
  });

  it('should throw PaymentNotFoundError if payment is not found', async () => {
    mockPaymentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 'not-found-id', status: PaymentStatus.PAID }),
    ).rejects.toThrow(new PaymentNotFoundError('not-found-id'));
  });

  it('should throw PaymentAlreadyPaidError if user is trying to update a PAID payment status to PAID', async () => {
    const paymentEntity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      status: PaymentStatus.PAID,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });

    mockPaymentRepository.findById.mockResolvedValue(paymentEntity);

    await expect(
      useCase.execute({ id: 'not-found-id', status: PaymentStatus.PAID }),
    ).rejects.toThrow(new PaymentAlreadyPaidError('not-found-id'));
  });

  it('should throw PaymentCannotFailError if user is trying to update a FAIL payment status to FAIL', async () => {
    const paymentEntity = PaymentEntity.create({
      id: 'test-id',
      cpf: '111.111.111-11',
      amount: 100,
      status: PaymentStatus.FAIL,
      description: 'Test',
      paymentMethod: PaymentMethod.PIX,
    });

    mockPaymentRepository.findById.mockResolvedValue(paymentEntity);

    await expect(
      useCase.execute({ id: 'not-found-id', status: PaymentStatus.FAIL }),
    ).rejects.toThrow(new PaymentCannotFailError('not-found-id'));
  });
});
