import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { Request } from 'express';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const signatureHeader = request.headers['x-signature'];
    const xRequestId = request.headers['x-request-id'];

    if (typeof signatureHeader !== 'string' || typeof xRequestId !== 'string') {
      return false;
    }

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    const dataId: string =
      (request.body?.data?.id as string) ??
      (request.body?.resource?.split('/').pop() as string);

    if (!dataId) {
      return true;
    }

    const parts = signatureHeader.split(',');
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const sigPart = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !sigPart) {
      return false;
    }

    const ts = tsPart.split('=')[1];
    const signature = sigPart.split('=')[1];

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.MP_WEBHOOK_SECRET!)
      .update(manifest)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
