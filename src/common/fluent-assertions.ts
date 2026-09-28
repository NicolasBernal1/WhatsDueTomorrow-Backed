import * as chai from 'chai';

chai.should();

export class ExceptionAssertion {
  constructor(public error: any) {}

  public WithMessage(expectedMessage: string): this {
    chai.expect(this.error.message).to.include(expectedMessage);
    return this;
  }

  public get And(): this {
    return this;
  }
}

export class FluentAssertion<T> {
  constructor(private actual: T) {}

  public get And(): this {
    return this;
  }

  public Be(expected: any): this {
    chai.expect(this.actual).to.equal(expected);
    return this;
  }

  public NotBe(expected: any): this {
    chai.expect(this.actual).to.not.equal(expected);
    return this;
  }

  public BeEquivalentTo(expected: any): this {
    chai.expect(this.actual).to.deep.equal(expected);
    return this;
  }

  public BeNull(): this {
    chai.expect(this.actual).to.be.null;
    return this;
  }

  public NotBeNull(): this {
    chai.expect(this.actual).to.not.be.null;
    return this;
  }

  public BeDefined(): this {
    chai.expect(this.actual).to.not.be.undefined;
    return this;
  }

  public BeUndefined(): this {
    chai.expect(this.actual).to.be.undefined;
    return this;
  }

  public BeTrue(): this {
    chai.expect(this.actual).to.be.true;
    return this;
  }

  public BeFalse(): this {
    chai.expect(this.actual).to.be.false;
    return this;
  }

  public BeEmpty(): this {
    chai.expect(this.actual).to.be.empty;
    return this;
  }

  public NotBeEmpty(): this {
    chai.expect(this.actual).to.not.be.empty;
    return this;
  }

  public HaveCount(expectedCount: number): this {
    chai.expect(this.actual).to.have.lengthOf(expectedCount);
    return this;
  }

  public Contain(substringOrItem: any): this {
    chai.expect(this.actual).to.include(substringOrItem);
    return this;
  }

  public NotContain(substringOrItem: any): this {
    chai.expect(this.actual).to.not.include(substringOrItem);
    return this;
  }

  public StartWith(prefix: string): this {
    chai.expect(this.actual).to.be.a('string');
    chai.expect((this.actual as unknown as string).startsWith(prefix)).to.be.true;
    return this;
  }

  public EndWith(suffix: string): this {
    chai.expect(this.actual).to.be.a('string');
    chai.expect((this.actual as unknown as string).endsWith(suffix)).to.be.true;
    return this;
  }

  public Match(regex: RegExp): this {
    chai.expect(this.actual).to.match(regex);
    return this;
  }

  public NotMatch(regex: RegExp): this {
    chai.expect(this.actual).to.not.match(regex);
    return this;
  }

  public BeGreaterThan(val: number): this {
    chai.expect(this.actual).to.be.above(val);
    return this;
  }

  public BeGreaterThanOrEqualTo(val: number): this {
    chai.expect(this.actual).to.be.at.least(val);
    return this;
  }

  public BeLessThan(val: number): this {
    chai.expect(this.actual).to.be.below(val);
    return this;
  }

  public BeLessThanOrEqualTo(val: number): this {
    chai.expect(this.actual).to.be.at.most(val);
    return this;
  }

  public BeInstanceOf(type: any): this {
    chai.expect(this.actual).to.be.instanceOf(type);
    return this;
  }

  public HaveBeenCalled(): this {
    if ((this.actual as any)?._isMockFunction || typeof (this.actual as any)?.mock === 'object') {
      chai.expect((this.actual as any).mock.calls.length).to.be.above(0);
    }
    return this;
  }

  public HaveBeenCalledWith(...args: any[]): this {
    if ((this.actual as any)?._isMockFunction || typeof (this.actual as any)?.mock === 'object') {
      expect(this.actual).toHaveBeenCalledWith(...args);
    }
    return this;
  }

  public HaveBeenCalledTimes(times: number): this {
    if ((this.actual as any)?._isMockFunction || typeof (this.actual as any)?.mock === 'object') {
      chai.expect((this.actual as any).mock.calls.length).to.equal(times);
    }
    return this;
  }

  public NotHaveBeenCalled(): this {
    if ((this.actual as any)?._isMockFunction || typeof (this.actual as any)?.mock === 'object') {
      chai.expect((this.actual as any).mock.calls.length).to.equal(0);
    }
    return this;
  }

  public Throw(expectedErrorOrMessage?: any): ExceptionAssertion {
    let thrownError: any = null;
    try {
      (this.actual as unknown as Function)();
    } catch (err) {
      thrownError = err;
    }
    chai.expect(thrownError, 'Expected function to throw an exception').to.not.be.null;
    if (expectedErrorOrMessage) {
      if (typeof expectedErrorOrMessage === 'string') {
        chai.expect(thrownError.message).to.include(expectedErrorOrMessage);
      } else if (typeof expectedErrorOrMessage === 'function') {
        chai.expect(thrownError).to.be.instanceOf(expectedErrorOrMessage);
      }
    }
    return new ExceptionAssertion(thrownError);
  }

  public async ThrowAsync(expectedErrorOrMessage?: any): Promise<ExceptionAssertion> {
    let thrownError: any = null;
    try {
      await (this.actual as unknown as Function)();
    } catch (err) {
      thrownError = err;
    }
    chai.expect(thrownError, 'Expected async function to reject/throw an exception').to.not.be.null;
    if (expectedErrorOrMessage) {
      if (typeof expectedErrorOrMessage === 'string') {
        chai.expect(thrownError.message).to.include(expectedErrorOrMessage);
      } else if (typeof expectedErrorOrMessage === 'function') {
        chai.expect(thrownError).to.be.instanceOf(expectedErrorOrMessage);
      }
    }
    return new ExceptionAssertion(thrownError);
  }
}

declare global {
  interface Object {
    Should(): FluentAssertion<this>;
  }
}

if (!Object.prototype.hasOwnProperty('Should')) {
  Object.defineProperty(Object.prototype, 'Should', {
    value: function () {
      return new FluentAssertion(this);
    },
    configurable: true,
    writable: true,
  });
}

export function Should<T>(actual: T): FluentAssertion<T> {
  return new FluentAssertion(actual);
}

export function should<T>(actual: T): FluentAssertion<T> {
  return new FluentAssertion(actual);
}

export function fluent<T>(actual: T): FluentAssertion<T> {
  return new FluentAssertion(actual);
}
