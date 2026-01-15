import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from './infraestructure/modules/payment/payment.module.js';
import { PrismaModule } from './infraestructure/services/prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PaymentModule,
  ],
})
export class AppModule {}
