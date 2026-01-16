import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import {
  PaymentAlreadyPaidError,
  PaymentCannotFailError,
  PaymentNotFoundError,
} from '../../../domain/entities/payment.entity';

@Catch(PaymentNotFoundError, PaymentAlreadyPaidError, PaymentCannotFailError)
export class PaymentExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof PaymentNotFoundError) {
      response.status(404).json({
        name: exception.name,
        message: exception.message,
        cause: exception.cause,
      });
      return;
    }

    response.status(400).json({
      name: exception.name,
      message: exception.message,
      cause: exception.cause,
    });
  }
}
