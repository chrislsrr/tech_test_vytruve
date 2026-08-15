import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class DuplicateEmailException extends CustomHttpException {
  constructor() {
    super(
      'An account with this email already exists',
      HttpStatus.CONFLICT,
      'DUPLICATE_EMAIL',
    );
  }
}
