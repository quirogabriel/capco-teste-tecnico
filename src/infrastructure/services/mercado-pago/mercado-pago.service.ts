import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { PaymentEntity } from '../../../domain/entities/payment.entity';
import {
  IMercadoPagoService,
  MercadoPagoPayment,
  PreferenceCreationResponse,
} from './mercado-pago.service.interface';

@Injectable()
export class MercadoPagoService implements IMercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private readonly client: MercadoPagoConfig;

  constructor(private readonly configService: ConfigService) {
    const accessToken =
      process.env.MP_ACCESS_TOKEN ||
      this.configService.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago access token is not configured.');
    }
    this.client = new MercadoPagoConfig({ accessToken });
  }

  async createPreference(
    payment: PaymentEntity,
  ): Promise<PreferenceCreationResponse> {
    try {
      const preference = new Preference(this.client);
      const webhookUrl = this.configService.get<string>('MP_WEBHOOK_URL');
      if (!webhookUrl) {
        throw new Error('Mercado Pago webhook URL is not configured.');
      }

      const result = await preference.create({
        body: {
          items: [
            {
              id: payment.id,
              title: payment.description,
              quantity: 1,
              unit_price: payment.amount.value,
            },
          ],
          external_reference: randomUUID(),
          notification_url: webhookUrl,
        },
      });

      if (!result.id || !result.init_point) {
        throw new Error(
          'Failed to retrieve preference ID or init point from Mercado Pago.',
        );
      }

      this.logger.log(`Preference created for payment ${payment.id}`);

      return {
        external_reference: result.external_reference as string,
        initPoint: result.init_point,
      };
    } catch (error) {
      this.logger.error(
        `Error creating preference for payment ${payment.id}`,
        error,
      );
      throw new Error('Failed to create Mercado Pago preference.');
    }
  }

  async getPayment(paymentId: number): Promise<MercadoPagoPayment> {
    try {
      const paymentProvider = new Payment(this.client);
      const mpPayment = await paymentProvider.get({ id: paymentId });

      if (!mpPayment.id || !mpPayment.external_reference) {
        throw new Error(
          'Failed to retrieve Mercado Pago payment ID or external reference.',
        );
      }

      this.logger.log(`Payment data fetched from MP for id: ${paymentId}`);

      return {
        id: mpPayment.id,
        status: mpPayment.status as MercadoPagoPayment['status'],
        external_reference: mpPayment.external_reference,
        date_approved: mpPayment.date_approved ?? null,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching payment from Mercado Pago for id: ${paymentId}`,
        error,
      );
      throw new Error('Failed to get payment from Mercado Pago.');
    }
  }
}
