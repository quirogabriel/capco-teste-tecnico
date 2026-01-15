export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(props: T) {
    this._value = Object.freeze(props);
  }

  get value(): T {
    return this._value;
  }
}
