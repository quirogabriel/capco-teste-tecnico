import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PaymentEntity,
  PaymentMethod,
} from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { CreatePaymentDTO } from '../../../infraestructure/controllers/payment/dto/create-payment.dto';
import { PaymentResponseDTO } from '../../../infraestructure/controllers/payment/dto/payment-response.dto';
import { IMercadoPagoService } from '../../../infraestructure/services/mercado-pago/mercado-pago.service.interface';
import { UseCase } from '../core/usecase';

@Injectable()
export class CreatePaymentUseCase extends UseCase<
  CreatePaymentDTO,
  PaymentResponseDTO
> {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IMercadoPagoService)
    private readonly mercadoPagoService: IMercadoPagoService,
  ) {
    super();
  }
  async execute(input: CreatePaymentDTO): Promise<PaymentResponseDTO> {
    const paymentEntity = PaymentEntity.create(input);

    let createdPayment: PaymentEntity;
    try {
      if (PaymentMethod[input.paymentMethod] === PaymentMethod.PIX) {
        createdPayment = await this.paymentRepository.create(paymentEntity);
        return { paymentId: createdPayment.id };
      }
      const preference =
        await this.mercadoPagoService.createPreference(paymentEntity);

      paymentEntity.externalReference = preference.external_reference;

      createdPayment = await this.paymentRepository.create(paymentEntity);

      return {
        paymentId: createdPayment.id,
        initPoint: preference?.initPoint,
        external_reference: preference?.external_reference,
      };
    } catch (error) {
      Logger.log('Error creating payment:', error);
      throw error;
    }
  }
}
