export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string>;

  constructor(statusCode: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    if (errors) {
      this.errors = errors;
    }

    // Fix prototype chain for extending built-in classes in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
