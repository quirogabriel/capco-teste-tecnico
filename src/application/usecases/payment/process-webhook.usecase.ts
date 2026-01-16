import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { WebhookDTO } from '../../../infraestructure/controllers/payment/dto/request/webhook.dto';
import {
  IMercadoPagoService,
  MercadoPagoPayment,
} from '../../../infraestructure/services/mercado-pago/mercado-pago.service.interface';
import { UseCase } from '../core/usecase';

@Injectable()
export class ProcessWebhookUseCase extends UseCase<WebhookDTO, void> {
  private readonly logger = new Logger(ProcessWebhookUseCase.name);

  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IMercadoPagoService)
    private readonly mercadoPagoService: IMercadoPagoService,
  ) {
    super();
  }

  async execute(input: WebhookDTO): Promise<void> {
    this.logger.log(`Processing webhook: ${JSON.stringify(input)}`);

    if (!this.isValidWebhook(input)) {
      this.logger.warn(
        `Invalid webhook type or topic: ${JSON.stringify(input)}`,
      );
      return;
    }

    const mpPayment = await this.fetchMercadoPagoPayment(input);

    this.logger.log(
      `Received Mercado Pago payment: ${JSON.stringify(mpPayment)}`,
    );

    const payment = await this.retrieveAndValidatePayment(mpPayment);
    if (!payment) {
      return;
    }

    await this.handlePaymentUpdateAndSave(payment, mpPayment);
  }

  private async retrieveAndValidatePayment(
    mpPayment: MercadoPagoPayment,
  ): Promise<PaymentEntity | null> {
    if (!mpPayment?.external_reference) {
      this.logger.warn('Missing external_reference in Mercado Pago payment');
      return null;
    }

    const payment = await this.paymentRepository.findByExternalReference(
      mpPayment.external_reference,
    );

    if (!payment) {
      this.logger.warn(
        `Payment with external_reference ${mpPayment.external_reference} not found`,
      );
      return null;
    }

    if (payment.isFinal()) {
      this.logger.log(`Payment ${payment.id} already finalized`);
      return null;
    }

    return payment;
  }

  private async handlePaymentUpdateAndSave(
    payment: PaymentEntity,
    mpPayment: MercadoPagoPayment,
  ): Promise<void> {
    const updated = this.updatePaymentStatus(payment, mpPayment);

    if (!updated) {
      this.logger.log(
        `Payment ${payment.id} not updated. Current status: ${payment.status}, MP status: ${mpPayment.status}`,
      );
      return;
    }

    await this.paymentRepository.update(payment);
    this.logger.log(
      `Payment ${payment.id} status updated to ${payment.status}`,
    );
  }

  private updatePaymentStatus(
    payment: PaymentEntity,
    mpPayment: MercadoPagoPayment,
  ) {
    switch (mpPayment.status) {
      case 'approved':
        return payment.paid();
      case 'rejected':
      case 'cancelled':
        return payment.fail();
      default:
        this.logger.log(
          `Payment status [${mpPayment.status}] is not final, no action taken.`,
        );
        return false;
    }
  }

  private isValidWebhook(input: WebhookDTO): boolean {
    return input?.type === 'payment';
  }

  private async fetchMercadoPagoPayment(input: WebhookDTO) {
    const mpPaymentId = Number(input?.data?.id ?? input?.resource);
    return await this.mercadoPagoService.getPayment(mpPaymentId);
  }
}
