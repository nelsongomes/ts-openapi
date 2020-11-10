export class ApplicationError extends Error {
  public status: number;
  public message: string;
  public initialError?: Error;

  constructor(status: number, message: string, error?: Error) {
    super(message);

    this.status = status;
    this.message = message;
    if (error) {
      this.initialError = error;
    }
  }
}
