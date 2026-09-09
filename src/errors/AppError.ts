class AppError extends Error {
  public statusCode: number;
  public errors?: Array<{
    field: string;
    message: string;
  }>;

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{
      field: string;
      message: string;
    }>
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;