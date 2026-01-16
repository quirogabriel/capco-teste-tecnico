import { ValueObject } from '../core/value-object';

export class Amount extends ValueObject<number> {
  private constructor(value: number) {
    super(value);
  }

  get value(): number {
    return this._value;
  }

  public static create(amount: number): Amount {
    if (!this.validate(amount)) {
      throw new InvalidAmountError();
    }
    return new Amount(amount);
  }

  public static validate(amount: number): boolean {
    return amount > 0;
  }
}

export class InvalidAmountError extends Error {
  constructor() {
    super(`Amount must be greater than 0.`);
    this.name = 'InvalidAmountError';
  }
}
