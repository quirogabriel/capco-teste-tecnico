import { Cpf } from '../cpf.vo';

describe('Cpf Value Object', () => {
  it('should create a valid Cpf instance with formatted CPF', () => {
    const cpf = Cpf.create('12345678909');
    expect(cpf).toBeInstanceOf(Cpf);
    expect(cpf.value).toBe('12345678909');
  });

  it('should create a valid Cpf instance with unformatted CPF', () => {
    const cpf = Cpf.create('123.456.789-09');
    expect(cpf).toBeInstanceOf(Cpf);
    expect(cpf.value).toBe('12345678909');
  });

  it('should throw an error for an invalid CPF (wrong length)', () => {
    expect(() => Cpf.create('123')).toThrow('The CPF 123 is invalid.');
    expect(() => Cpf.create('123456789090')).toThrow(
      'The CPF 123456789090 is invalid.',
    );
  });

  it('should throw an error for an invalid CPF (non-digits after formatting)', () => {
    expect(() => Cpf.create('1234567890a')).toThrow(
      'The CPF 1234567890a is invalid.',
    );
  });

  it('should return the correct formatted value', () => {
    const cpf = Cpf.create('123.456.789-09');
    expect(cpf.value).toBe('12345678909');
  });

  it('should validate a valid CPF as true', () => {
    expect(Cpf.validate('12345678909')).toBe(true);
    expect(Cpf.validate('123.456.789-09')).toBe(true);
  });

  it('should validate an invalid CPF (wrong length) as false', () => {
    expect(Cpf.validate('123')).toBe(false);
    expect(Cpf.validate('123456789090')).toBe(false);
  });

  it('should validate an invalid CPF (non-digits) as false', () => {
    expect(Cpf.validate('1234567890a')).toBe(false);
  });

  it('should format a CPF by removing non-digits', () => {
    expect(Cpf.format('123.456.789-09')).toBe('12345678909');
    expect(Cpf.format('123abc456def789ghi09')).toBe('12345678909');
    expect(Cpf.format('12345678909')).toBe('12345678909');
  });
});
