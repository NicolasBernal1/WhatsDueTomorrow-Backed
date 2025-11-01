export class BaseResponseDto<T> {
  readonly status: number;
  readonly message: string;
  readonly data?: T;
}