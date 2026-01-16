import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  CreatePaymentOutput,
  CreatePaymentUseCase,
} from '../../../application/usecases/payment/create-payment.usecase';
import { FilterPaymentUseCase } from '../../../application/usecases/payment/filter-payment.usecase';
import { FindPaymentUseCase } from '../../../application/usecases/payment/find-payment.usecase';
import { ProcessWebhookUseCase } from '../../../application/usecases/payment/process-webhook.usecase';
import { UpdatePaymentUseCase } from '../../../application/usecases/payment/update-payment.usecase';
import { PaymentExceptionFilter } from '../../filters/exceptions/exceptions.filter';
import { CreatePaymentDTO } from './dto/request/create-payment.dto';
import { FilterPaymentDto } from './dto/request/filter-payment.dto';
import { FindByIdDto } from './dto/request/find-by-id.dto';
import { UpdatePaymentDTO } from './dto/request/update-payment.dto';
import { WebhookDTO } from './dto/request/webhook.dto';
import { PaymentResponseDTO } from './dto/response/payment-response.dto';
import { PaymentMapper } from './mapper/payment.mapper';

@Controller('/api/payment')
export class PaymentController {
  constructor(
    private readonly findPaymentUseCase: FindPaymentUseCase,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
    private readonly filterPaymentUseCase: FilterPaymentUseCase,
    private readonly updatePaymentUseCase: UpdatePaymentUseCase,
  ) {}

  @Get()
  async filter(
    @Query() filterPaymentDto: FilterPaymentDto,
  ): Promise<PaymentResponseDTO[]> {
    const entities = await this.filterPaymentUseCase.execute(filterPaymentDto);
    return entities.map((entity) => PaymentMapper.toEntityResponse(entity));
  }

  @UseFilters(PaymentExceptionFilter)
  @Get(':id')
  async findById(@Param() param: FindByIdDto): Promise<PaymentResponseDTO> {
    const entity = await this.findPaymentUseCase.execute({ id: param.id });
    return PaymentMapper.toEntityResponse(entity);
  }

  @UseFilters(PaymentExceptionFilter)
  @Put(':id')
  async update(
    @Param() param: FindByIdDto,
    @Body() updatePaymentDto: UpdatePaymentDTO,
  ): Promise<PaymentResponseDTO> {
    return await this.updatePaymentUseCase.execute({
      id: param.id,
      ...updatePaymentDto,
    });
  }

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDTO,
  ): Promise<CreatePaymentOutput> {
    return await this.createPaymentUseCase.execute(createPaymentDto);
  }

  /**
   *  Guard está funcionando, porém n consegui achar o local certo para pegar a secret_key
   *  para validar a assinatura do webhook.
   *  Caso queira testar, crie um webhook na plataforma, cole a url gerada pelo ngrok e dispare
   *  uma requisição de teste.
   */
  // @UseGuards(WebhookSignatureGuard)
  @Post('/webhook')
  @HttpCode(200)
  async webhook(@Body() webhookDto: WebhookDTO): Promise<void> {
    await this.processWebhookUseCase.execute(webhookDto);
  }
}
