import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentEntity,
  PaymentNotFoundError,
} from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { FindByIdDto } from '../../../infrastructure/controllers/payment/dto/request/find-by-id.dto';
import { UseCase } from '../core/usecase';

@Injectable()
export class FindPaymentUseCase extends UseCase<FindByIdDto, PaymentEntity> {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {
    super();
  }
  async execute(input: FindByIdDto): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findById(input.id);

    if (!payment) throw new PaymentNotFoundError(input.id);

    return payment;
  }
}
