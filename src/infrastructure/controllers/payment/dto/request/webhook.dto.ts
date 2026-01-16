export class WebhookDTO {
  type?: string;
  topic?: string;
  action?: string;
  data?: {
    id?: string;
  };
  resource?: string;
}
