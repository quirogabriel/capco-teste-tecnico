import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import {
  PaymentEntity,
  PaymentMethod,
  PaymentStatus,
} from '../../../../domain/entities/payment.entity';
import { MercadoPagoService } from '../mercado-pago.service';

jest.mock('mercadopago');

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;

  const preferenceCreateMock = jest.fn();
  const paymentGetMock = jest.fn();

  beforeEach(async () => {
    (MercadoPagoConfig as jest.Mock).mockImplementation(() => ({}));

    (Preference as jest.Mock).mockImplementation(() => ({
      create: preferenceCreateMock,
    }));

    (Payment as jest.Mock).mockImplementation(() => ({
      get: paymentGetMock,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'MP_ACCESS_TOKEN') return 'test-token';
              if (key === 'MP_WEBHOOK_URL') return 'http://test.com/webhook';
            }),
          },
        },
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

    service = module.get(MercadoPagoService);
    jest.clearAllMocks();
  });

  describe('createPreference', () => {
    it('creates a Mercado Pago preference', async () => {
      const payment = PaymentEntity.create({
        cpf: '12345678900',
        amount: 100,
        description: 'Test payment',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
      });

      preferenceCreateMock.mockResolvedValue({
        id: 'a-mock-preference-id',
        init_point: 'http://mp.com/pay',
        external_reference: 'any-ref',
      });

      const result = await service.createPreference(payment);

      expect(preferenceCreateMock).toHaveBeenCalled();
      expect(result).toEqual({
        initPoint: 'http://mp.com/pay',
        external_reference: 'any-ref',
      });
    });

    it('throws error when Mercado Pago fails', async () => {
      const payment = PaymentEntity.create({
        cpf: '12345678900',
        amount: 100,
        description: 'Test payment',
        paymentMethod: PaymentMethod.CREDIT_CARD,
        status: PaymentStatus.PENDING,
      });

      preferenceCreateMock.mockRejectedValue(new Error('MP error'));

      await expect(() => service.createPreference(payment)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('getPayment', () => {
    it('returns payment details', async () => {
      paymentGetMock.mockResolvedValue({
        id: 1,
        status: 'approved',
        external_reference: 'ref-123',
      });

      const result = await service.getPayment(1);

      expect(paymentGetMock).toHaveBeenCalledWith({ id: 1 });
      expect(result.status).toBe('approved');
    });

    it('throws error when payment fetch fails', async () => {
      paymentGetMock.mockRejectedValue(new Error('MP error'));

      await expect(service.getPayment(1)).rejects.toThrow();
    });
  });
});
