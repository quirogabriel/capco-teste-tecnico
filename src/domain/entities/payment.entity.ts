import { Entity } from '../core/entity';
import { Amount } from '../value-objects/amount.vo';
import { Cpf } from '../value-objects/cpf.vo';

export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAIL = 'FAIL',
}

export type PaymentProps = {
  external_reference?: string;
  cpf: Cpf;
  description: string;
  amount: Amount;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: Date;
};

export type PaymentInput = {
  id?: string;
  external_reference?: string;
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod | string;
  status?: PaymentStatus | string;
  createdAt?: Date;
};

export class PaymentEntity extends Entity<PaymentProps> {
  constructor(props: PaymentProps, id?: string) {
    super(props, id);
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get cpf(): Cpf {
    return this.props.cpf;
  }

  get amount(): Amount {
    return this.props.amount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get description(): string {
    return this.props.description;
  }

  get externalReference(): string | undefined {
    return this.props.external_reference;
  }

  set externalReference(externalReference: string | undefined) {
    this.props.external_reference = externalReference;
  }

  static create(input: PaymentInput) {
    const paymentProps: PaymentProps = {
      external_reference: input.external_reference,
      cpf: Cpf.create(input.cpf),
      description: input.description,
      amount: Amount.create(input.amount),
      paymentMethod:
        PaymentMethod[input.paymentMethod as keyof typeof PaymentMethod],
      status:
        PaymentStatus[input.status as keyof typeof PaymentStatus] ||
        PaymentStatus.PENDING,
      createdAt: input.createdAt || new Date(),
    };

    return new PaymentEntity(paymentProps, input.id);
  }

  paid() {
    if (this.isFinal()) return false;
    this.props.status = PaymentStatus.PAID;
    return true;
  }

  fail() {
    if (!this.canFail()) return false;
    this.props.status = PaymentStatus.FAIL;
    return true;
  }

  canFail(): boolean {
    return (
      this.props.status !== PaymentStatus.PAID &&
      this.props.status !== PaymentStatus.FAIL
    );
  }

  isFinal(): boolean {
    return this.props.status === PaymentStatus.PAID;
  }

  updateStatus(newStatus: PaymentStatus): boolean {
    if (this.status === newStatus) {
      return false;
    }

    if (newStatus === PaymentStatus.PAID) {
      return this.paid();
    }

    if (newStatus === PaymentStatus.FAIL) {
      return this.fail();
    }

    return false;
  }
}

export class PaymentNotFoundError extends Error {
  constructor(id: string) {
    super(`Payment not found: ${id}`);
    this.name = 'PaymentNotFoundError';
  }
}

export class PaymentAlreadyPaidError extends Error {
  constructor(id: string) {
    super(`Payment already paid: ${id}`);
    this.name = 'PaymentAlreadyPaidError';
  }
}

export class PaymentCannotFailError extends Error {
  constructor(id: string) {
    super(`Payment already failed: ${id}`);
    this.name = 'PaymentCannotFailError';
  }
}
