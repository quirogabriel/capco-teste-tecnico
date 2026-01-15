import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreatePaymentUseCase } from '../../../application/usecases/payment/create-payment.usecase';
import { ProcessWebhookUseCase } from '../../../application/usecases/payment/process-webhook.usecase';
import { CreatePaymentDTO } from './dto/create-payment.dto';
import { PaymentResponseDTO } from './dto/payment-response.dto'; // Import PaymentResponseDTO
import { WebhookDTO } from './dto/webhook.dto';

@Controller('/api/payment')
export class PaymentController {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
  ) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDTO,
  ): Promise<PaymentResponseDTO> {
    return this.createPaymentUseCase.execute(createPaymentDto);
  }

  @Post('/webhook')
  @HttpCode(200)
  async webhook(@Body() webhookDto: WebhookDTO): Promise<void> {
    await this.processWebhookUseCase.execute(webhookDto);
  }
}
