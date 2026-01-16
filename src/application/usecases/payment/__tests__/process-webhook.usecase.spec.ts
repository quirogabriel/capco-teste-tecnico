import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentEntity,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../../domain/repositories/payment.repository.interface';
import { WebhookDTO } from '../../../../infrastructure/controllers/payment/dto/request/webhook.dto';
import {
  IMercadoPagoService,
  MercadoPagoPayment,
} from '../../../../infrastructure/services/mercado-pago/mercado-pago.service.interface';
import { ProcessWebhookUseCase } from '../process-webhook.usecase';

const mockPaymentRepository = {
  findByExternalReference: jest.fn(),
  update: jest.fn(),
};

const mockMercadoPagoService = {
  getPayment: jest.fn(),
};

describe('ProcessWebhookUseCase', () => {
  let useCase: ProcessWebhookUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessWebhookUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepository },
        { provide: IMercadoPagoService, useValue: mockMercadoPagoService },
      ],
    })
      .setLogger({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      })
      .compile();

    useCase = module.get<ProcessWebhookUseCase>(ProcessWebhookUseCase);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update payment to PAID when Mercado Pago status is "approved"', async () => {
      const webhookDto: WebhookDTO = { type: 'payment', data: { id: '123' } };
      const mpPayment: MercadoPagoPayment = {
        id: 123,
        status: 'approved',
        external_reference: 'test-ref',
        date_approved: new Date().toISOString(),
      };

      const paymentEntity = PaymentEntity.create({
        id: 'payment-id',
        cpf: '111.111.111-11',
        amount: 100,
        status: PaymentStatus.PENDING,
        description: 'Test Payment',
        paymentMethod: 'CREDIT_CARD',
      });
      const paidSpy = jest.spyOn(paymentEntity, 'paid');

      mockMercadoPagoService.getPayment.mockResolvedValue(mpPayment);
      mockPaymentRepository.findByExternalReference.mockResolvedValue(
        paymentEntity,
      );

      await useCase.execute(webhookDto);

      expect(mockMercadoPagoService.getPayment).toHaveBeenCalledWith(123);
      expect(
        mockPaymentRepository.findByExternalReference,
      ).toHaveBeenCalledWith('test-ref');
      expect(paidSpy).toHaveBeenCalled();
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(paymentEntity);
      expect(paymentEntity.status).toBe(PaymentStatus.PAID);
    });

    it('should update payment to FAIL when Mercado Pago status is "rejected"', async () => {
      const webhookDto: WebhookDTO = { type: 'payment', data: { id: '123' } };
      const mpPayment: MercadoPagoPayment = {
        id: 123,
        status: 'rejected',
        external_reference: 'test-ref',
        date_approved: new Date().toISOString(),
      };

      const paymentEntity = PaymentEntity.create({
        id: 'payment-id',
        cpf: '111.111.111-11',
        amount: 100,
        status: PaymentStatus.PENDING,
        description: 'Test Payment',
        paymentMethod: 'CREDIT_CARD',
      });
      const failSpy = jest.spyOn(paymentEntity, 'fail');

      mockMercadoPagoService.getPayment.mockResolvedValue(mpPayment);
      mockPaymentRepository.findByExternalReference.mockResolvedValue(
        paymentEntity,
      );

      await useCase.execute(webhookDto);

      expect(failSpy).toHaveBeenCalled();
      expect(mockPaymentRepository.update).toHaveBeenCalledWith(paymentEntity);
      expect(paymentEntity.status).toBe(PaymentStatus.FAIL);
    });

    it('should not process if webhook is invalid', async () => {
      const webhookDto: WebhookDTO = {
        topic: 'merchant_order',
        resource: 'abc',
      };

      await useCase.execute(webhookDto);

      expect(mockMercadoPagoService.getPayment).not.toHaveBeenCalled();
      expect(
        mockPaymentRepository.findByExternalReference,
      ).not.toHaveBeenCalled();
      expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    });

    it('should not process if payment is not found', async () => {
      const webhookDto: WebhookDTO = { type: 'payment', data: { id: '123' } };
      const mpPayment: MercadoPagoPayment = {
        id: 123,
        status: 'approved',
        external_reference: 'test-ref',
        date_approved: new Date().toISOString(),
      };
      mockMercadoPagoService.getPayment.mockResolvedValue(mpPayment);
      mockPaymentRepository.findByExternalReference.mockResolvedValue(null);

      await useCase.execute(webhookDto);

      expect(mockMercadoPagoService.getPayment).toHaveBeenCalledWith(123);
      expect(
        mockPaymentRepository.findByExternalReference,
      ).toHaveBeenCalledWith('test-ref');
      expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    });

    it('should not process if payment is already in a final state', async () => {
      const webhookDto: WebhookDTO = { type: 'payment', data: { id: '123' } };
      const mpPayment: MercadoPagoPayment = {
        id: 123,
        status: 'approved',
        external_reference: 'test-ref',
        date_approved: new Date().toISOString(),
      };
      const paymentEntity = PaymentEntity.create({
        id: 'payment-id',
        cpf: '111.111.111-11',
        amount: 100,
        status: PaymentStatus.PAID,
        description: 'Test Payment',
        paymentMethod: 'CREDIT_CARD',
      });

      mockMercadoPagoService.getPayment.mockResolvedValue(mpPayment);
      mockPaymentRepository.findByExternalReference.mockResolvedValue(
        paymentEntity,
      );

      await useCase.execute(webhookDto);

      expect(
        mockPaymentRepository.findByExternalReference,
      ).toHaveBeenCalledWith('test-ref');
      expect(mockPaymentRepository.update).not.toHaveBeenCalled();
    });
  });
});
