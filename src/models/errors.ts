export class ErrorResponse {
  status: number;
  message: string;

  constructor(status?: number, message?: string) {
    this.status = status || 500;
    this.message = message || "Unknown error";
  }
}
