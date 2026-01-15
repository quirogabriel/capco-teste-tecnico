import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentEntity } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { WebhookDTO } from '../../../infraestructure/controllers/payment/dto/webhook.dto';
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
    if (input?.type !== 'payment' && input?.topic !== 'payment') {
      return;
    }

    const mpPaymentId = Number(input?.data?.id ?? input?.resource);
    const mpPayment = await this.mercadoPagoService.getPayment(mpPaymentId);
    this.logger.log(
      `Received Mercado Pago payment: ${JSON.stringify(mpPayment)}`,
    );
    if (!mpPayment?.external_reference) {
      this.logger.warn('Missing external_reference in Mercado Pago payment');
      return;
    }

    const payment = await this.paymentRepository.findByExternalReference(
      mpPayment.external_reference,
    );

    if (!payment) {
      this.logger.warn(
        `Payment with external_reference ${mpPayment.external_reference} not found`,
      );
      return;
    }

    if (payment?.isFinal()) {
      this.logger.log(`Payment ${payment.id} already finalized`);
      return;
    }

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
}
