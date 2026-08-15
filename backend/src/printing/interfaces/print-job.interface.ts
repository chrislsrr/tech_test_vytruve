import { ApiProperty } from '@nestjs/swagger';

export class PrintJob {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique identifier for the job (UUID)' })
  id!: string;

  @ApiProperty({ example: '2024-08-15T12:00:00.000Z', description: 'When the print starts (ISO 8601, UTC)' })
  startDate!: string;

  @ApiProperty({ example: '2024-08-15T12:30:00.000Z', description: 'When the print finishes (ISO 8601, UTC)' })
  endDate!: string;

  @ApiProperty({ enum: ['success', 'failed', null], example: null, description: 'Outcome of the job: "success", "failed", or null if still running' })
  status!: 'success' | 'failed' | null;
}
