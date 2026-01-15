import { ValueObject } from '../core/value-object';

export class Cpf extends ValueObject<string> {
  private constructor(props: string) {
    super(props);
  }

  get value(): string {
    return this._value;
  }

  public static create(cpf: string): Cpf {
    if (!this.validate(cpf)) {
      throw new Error('Invalid CPF');
    }
    return new Cpf(this.format(cpf));
  }

  public static validate(cpf: string): boolean {
    const cpfRegex = /^\d{11}$/;
    return cpfRegex.test(this.format(cpf));
  }

  public static format(cpf: string): string {
    return cpf.replace(/[^\d]/g, '');
  }
}
