import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  PaymentEntity,
  PaymentMethod,
} from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { CreatePaymentDTO } from '../../../infrastructure/controllers/payment/dto/request/create-payment.dto';
import { IMercadoPagoService } from '../../../infrastructure/services/mercado-pago/mercado-pago.service.interface';
import { UseCase } from '../core/usecase';

export type CreatePaymentOutput = {
  id: string;
  status: string;
  paymentMethod: PaymentMethod;
  initPoint?: string;
};

@Injectable()
export class CreatePaymentUseCase extends UseCase<
  CreatePaymentDTO,
  CreatePaymentOutput
> {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IMercadoPagoService)
    private readonly mercadoPagoService: IMercadoPagoService,
  ) {
    super();
  }
  async execute(input: CreatePaymentDTO): Promise<CreatePaymentOutput> {
    const paymentEntity = PaymentEntity.create(input);

    let createdPayment: PaymentEntity;
    try {
      if (PaymentMethod[input.paymentMethod] === PaymentMethod.PIX) {
        createdPayment = await this.paymentRepository.create(paymentEntity);

        return {
          id: createdPayment.id,
          status: createdPayment.status,
          paymentMethod: createdPayment.paymentMethod,
        };
      }

      const preference =
        await this.mercadoPagoService.createPreference(paymentEntity);

      paymentEntity.externalReference = preference.external_reference;

      createdPayment = await this.paymentRepository.create(paymentEntity);

      return {
        id: createdPayment.id,
        status: createdPayment.status,
        paymentMethod: createdPayment.paymentMethod,
        initPoint: preference.initPoint,
      };
    } catch (error) {
      Logger.error('Error creating payment:', error);
      throw error;
    }
  }
}
