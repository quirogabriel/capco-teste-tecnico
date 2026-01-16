import { WebhookSignatureGuard } from './webhook-signature.guard';

describe('WebhookSignatureGuard', () => {
  it('should be defined', () => {
    expect(new WebhookSignatureGuard()).toBeDefined();
  });
});
