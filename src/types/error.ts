/**
 * Tipos relacionados a respostas de erro
 * Corresponde a ErrorResponse no backend
 */

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public error: string,
    public path: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromErrorResponse(response: ErrorResponse): ApiError {
    return new ApiError(
      response.status,
      response.error,
      response.path,
      response.message
    );
  }
}
