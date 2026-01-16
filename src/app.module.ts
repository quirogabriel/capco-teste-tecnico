import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './infrastructure/modules/payment/payment.module';
import { PrismaModule } from './infrastructure/services/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PaymentModule,
  ],
})
export class AppModule {}
