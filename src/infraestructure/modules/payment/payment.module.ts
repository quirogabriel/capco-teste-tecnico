import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreatePaymentUseCase } from '../../../application/usecases/payment/create-payment.usecase';
import { ProcessWebhookUseCase } from '../../../application/usecases/payment/process-webhook.usecase';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface';
import { PaymentController } from '../../controllers/payment/payment.controller';
import { PaymentPrismaRepository } from '../../databases/prisma/payment/payment.prisma.repository';
import { MercadoPagoService } from '../../services/mercado-pago/mercado-pago.service';
import { IMercadoPagoService } from '../../services/mercado-pago/mercado-pago.service.interface';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [
    CreatePaymentUseCase,
    ProcessWebhookUseCase,
    {
      provide: IPaymentRepository,
      useClass: PaymentPrismaRepository,
    },
    {
      provide: IMercadoPagoService,
      useClass: MercadoPagoService,
    },
  ],
})
export class PaymentModule {}
