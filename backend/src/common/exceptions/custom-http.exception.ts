import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    errorCode?: string,
  ) {
    super(
      {
        statusCode,
        message,
        errorCode: errorCode || 'HTTP_ERROR',
      },
      statusCode,
    );
  }
}
