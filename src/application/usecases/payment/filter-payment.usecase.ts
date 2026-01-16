import { Inject, Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { FilterPaymentDto } from '../../../infraestructure/controllers/payment/dto/request/filter-payment.dto';
import { UseCase } from '../core/usecase';

@Injectable()
export class FilterPaymentUseCase implements UseCase<
  FilterPaymentDto,
  PaymentEntity[]
> {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(input: FilterPaymentDto): Promise<PaymentEntity[]> {
    const payments = await this.paymentRepository.filter({
      id: input.id,
      external_reference: input.external_reference,
      cpf: input.cpf,
      description: input.description,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      status: input.status,
    });

    return payments;
  }
}
