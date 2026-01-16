import { Amount } from '../../value-objects/amount.vo';
import { Cpf } from '../../value-objects/cpf.vo';
import { PaymentEntity, PaymentMethod, PaymentStatus } from '../payment.entity';

describe('Payment Entity', () => {
  it('should create a Payment instance with all provided properties', () => {
    const paymentDate = new Date();
    const payment = PaymentEntity.create({
      id: '123',
      external_reference: 'mp_456',
      cpf: '123.456.789-00',
      description: 'Test Payment',
      amount: 100.5,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PAID,
      createdAt: paymentDate,
    });

    expect(payment).toBeInstanceOf(PaymentEntity);
    expect(payment.id).toBe('123');
    expect(payment.externalReference).toBe('mp_456');
    expect(payment.cpf.value).toBe('12345678900');
    expect(payment.description).toBe('Test Payment');
    expect(payment.amount.value).toBe(100.5);
    expect(payment.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
    expect(payment.status).toBe(PaymentStatus.PAID);
    expect(payment.createdAt).toBe(paymentDate);
  });

  it('should generate an id if not provided', () => {
    const payment = PaymentEntity.create({
      cpf: '123.456.789-00',
      description: 'Test Payment',
      amount: 100.5,
      paymentMethod: PaymentMethod.PIX,
    });

    expect(payment.id).toBeDefined();
    expect(typeof payment.id).toBe('string');
    expect(payment.cpf).toBeInstanceOf(Cpf);
    expect(payment.amount).toBeInstanceOf(Amount);
  });

  it('should set status to PENDING if not provided', () => {
    const payment = PaymentEntity.create({
      id: '123',
      cpf: '123.456.789-00',
      description: 'Test Payment',
      amount: 100.5,
      paymentMethod: PaymentMethod.PIX,
    });

    expect(payment.status).toBe(PaymentStatus.PENDING);
    expect(payment.cpf).toBeInstanceOf(Cpf);
    expect(payment.amount).toBeInstanceOf(Amount);
  });

  it('should set createdAt to a Date object if not provided', () => {
    const payment: PaymentEntity = PaymentEntity.create({
      id: '123',
      cpf: '123.456.789-00',
      description: 'Test Payment',
      amount: 100.5,
      paymentMethod: PaymentMethod.PIX,
    });

    expect(payment.createdAt).toBeInstanceOf(Date);
    expect(payment.cpf).toBeInstanceOf(Cpf);
    expect(payment.amount).toBeInstanceOf(Amount);
  });

  it('should change status to PAID when paid() is called on a PENDING payment', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PENDING,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const result = payment.paid();
    expect(result).toBe(true);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('should NOT change status when paid() is called on a PAID payment', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PAID,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const result = payment.paid();
    expect(result).toBe(false);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('should change status to FAIL when fail() is called on a PENDING payment', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PENDING,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const result = payment.fail();
    expect(result).toBe(true);
    expect(payment.status).toBe(PaymentStatus.FAIL);
  });

  it('should NOT change status when fail() is called on a PAID payment', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PAID,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const result = payment.fail();
    expect(result).toBe(false);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('isFinal should return true only for PAID status', () => {
    const pendingPayment = PaymentEntity.create({
      status: PaymentStatus.PENDING,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const paidPayment = PaymentEntity.create({
      status: PaymentStatus.PAID,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });
    const failPayment = PaymentEntity.create({
      status: PaymentStatus.FAIL,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });

    expect(pendingPayment.isFinal()).toBe(false);
    expect(paidPayment.isFinal()).toBe(true);
    expect(failPayment.isFinal()).toBe(false);
  });

  it('should update status via updateStatus method', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PENDING,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });

    const result = payment.updateStatus(PaymentStatus.PAID);

    expect(result).toBe(true);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('should not update status via updateStatus if already in the target state', () => {
    const payment = PaymentEntity.create({
      status: PaymentStatus.PAID,
      cpf: '123.456.789-00',
      description: 'Test',
      amount: 100,
      paymentMethod: PaymentMethod.PIX,
    });

    const result = payment.updateStatus(PaymentStatus.PAID);

    expect(result).toBe(false);
    expect(payment.status).toBe(PaymentStatus.PAID);
  });

  it('should set externalReference correctly', () => {
    const payment = PaymentEntity.create({
      cpf: '123.456.789-00',
      description: 'Test Payment',
      amount: 100.5,
      paymentMethod: PaymentMethod.PIX,
    });

    const newExternalRef = 'new_mp_ref_789';
    payment.externalReference = newExternalRef;
    expect(payment.externalReference).toBe(newExternalRef);
  });
});
