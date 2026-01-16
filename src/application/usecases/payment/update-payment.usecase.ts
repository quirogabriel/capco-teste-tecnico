import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentAlreadyPaidError,
  PaymentCannotFailError,
  PaymentNotFoundError,
  PaymentStatus,
} from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { PaymentResponseDTO } from '../../../infraestructure/controllers/payment/dto/response/payment-response.dto';
import { UseCase } from '../core/usecase';

export type UpdatePaymentInput = {
  id: string;
  status: PaymentStatus;
};

@Injectable()
export class UpdatePaymentUseCase implements UseCase<
  UpdatePaymentInput,
  PaymentResponseDTO
> {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(input: UpdatePaymentInput): Promise<PaymentResponseDTO> {
    const payment = await this.paymentRepository.findById(input.id);

    if (!payment) {
      throw new PaymentNotFoundError(input.id);
    }

    if (
      payment.status === PaymentStatus.PAID &&
      payment.status === input.status
    ) {
      throw new PaymentAlreadyPaidError(input.id);
    }

    if (
      payment.status === PaymentStatus.FAIL &&
      payment.status === input.status
    ) {
      throw new PaymentCannotFailError(input.id);
    }

    const updated = payment.updateStatus(input.status);

    if (!updated) {
      return {
        id: payment.id,
        external_reference: payment.externalReference,
        cpf: payment.cpf.value,
        description: payment.description,
        amount: payment.amount.value,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt,
      };
    }

    const updatedPayment = await this.paymentRepository.update(payment);

    return {
      id: updatedPayment.id,
      external_reference: updatedPayment.externalReference,
      cpf: updatedPayment.cpf.value,
      description: updatedPayment.description,
      amount: updatedPayment.amount.value,
      paymentMethod: updatedPayment.paymentMethod,
      status: updatedPayment.status,
      createdAt: updatedPayment.createdAt,
    };
  }
}
