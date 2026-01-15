import { Amount } from '../amount.vo';

describe('Amount Value Object', () => {
  it('should create a valid Amount instance', () => {
    const amount = Amount.create(100);
    expect(amount).toBeInstanceOf(Amount);
    expect(amount.value).toBe(100);
  });

  it('should throw an error for an invalid amount (zero)', () => {
    expect(() => Amount.create(0)).toThrow('Amount must be greater than 0');
  });

  it('should throw an error for an invalid amount (negative)', () => {
    expect(() => Amount.create(-50)).toThrow('Amount must be greater than 0');
  });

  it('should return the correct value', () => {
    const amount = Amount.create(250);
    expect(amount.value).toBe(250);
  });

  it('should validate a positive amount as true', () => {
    expect(Amount.validate(1)).toBe(true);
  });

  it('should validate zero amount as false', () => {
    expect(Amount.validate(0)).toBe(false);
  });

  it('should validate a negative amount as false', () => {
    expect(Amount.validate(-10)).toBe(false);
  });
});
