import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class StartPrintJobDto {
  @ApiProperty({ example: 1, description: 'ID of the patient' })
  @IsNumber()
  @IsNotEmpty()
  patientId!: number;

  @ApiProperty({ example: 1, description: 'ID of the file to print' })
  @IsNumber()
  @IsNotEmpty()
  fileId!: number;

  @ApiProperty({ example: 'socket-001', description: 'Your reference for the target socket/slot. Max 15 characters.', maxLength: 15 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  socketReference!: string;
}
