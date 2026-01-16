import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
import { CreatePaymentDTO } from '../../../../infraestructure/controllers/payment/dto/request/create-payment.dto';
import {
  IMercadoPagoService,
  PreferenceCreationResponse,
} from '../../../../infraestructure/services/mercado-pago/mercado-pago.service.interface';
import { CreatePaymentUseCase } from '../create-payment.usecase';

const mockPaymentRepository: jest.Mocked<IPaymentRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByExternalReference: jest.fn(),
  filter: jest.fn(),
};

const mockMercadoPagoService: jest.Mocked<IMercadoPagoService> = {
  createPreference: jest.fn(),
  getPayment: jest.fn(),
};

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepository },
        { provide: IMercadoPagoService, useValue: mockMercadoPagoService },
      ],
    }).compile();

    useCase = module.get(CreatePaymentUseCase);
    jest.clearAllMocks();

    mockPaymentRepository.create.mockImplementation((entity: PaymentEntity) =>
      Promise.resolve(entity),
    );
  });

  describe('execute', () => {
    it('should create a PIX payment without calling Mercado Pago', async () => {
      const dto: CreatePaymentDTO = {
        cpf: '123.456.789-00',
        description: 'PIX Payment',
        amount: 50,
        paymentMethod: PaymentMethod.PIX,
      };

      const result = await useCase.execute(dto);

      /* eslint-disable @typescript-eslint/unbound-method */
      expect(mockPaymentRepository.create).toHaveBeenCalledTimes(1);
      expect(mockMercadoPagoService.createPreference).not.toHaveBeenCalled();

      const createdEntity = mockPaymentRepository.create.mock.calls[0][0];

      expect(createdEntity.paymentMethod).toBe(PaymentMethod.PIX);
      expect(createdEntity.status).toBe(PaymentStatus.PENDING);

      expect(result).toMatchObject({
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.PIX,
      });
    });

    it('should create a CREDIT_CARD payment calling Mercado Pago', async () => {
      const dto: CreatePaymentDTO = {
        cpf: '123.456.789-00',
        description: 'Credit Card Payment',
        amount: 150,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      const preference: PreferenceCreationResponse = {
        initPoint: 'http://mercadopago.com/checkout',
        external_reference: 'mp-test-ref',
      };

      mockMercadoPagoService.createPreference.mockResolvedValue(preference);

      const result = await useCase.execute(dto);

      /* eslint-disable @typescript-eslint/unbound-method */
      expect(mockMercadoPagoService.createPreference).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.create).toHaveBeenCalledTimes(1);

      const createdEntity = mockPaymentRepository.create.mock.calls[0][0];

      expect(createdEntity.externalReference).toBe('mp-test-ref');
      expect(createdEntity.status).toBe(PaymentStatus.PENDING);

      expect(result).toMatchObject({
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        initPoint: 'http://mercadopago.com/checkout',
      });
    });
  });
});
