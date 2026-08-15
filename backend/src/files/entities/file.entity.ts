import { Patient } from 'src/patients/entities/patient.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id!: number;

  @Column()
  @ApiProperty({ example: 'model.ply', description: 'Original filename' })
  originalName!: string;

  @Column()
  @ApiProperty({ example: '20240815_123456_model.ply', description: 'Stored filename' })
  storedName!: string;

  @Column()
  @ApiProperty({ example: '/uploads/patients/1/20240815_123456_model.ply', description: 'File path' })
  filePath!: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 'ply', description: 'File extension', nullable: true })
  fileType!: string;

  @Column({ nullable: true })
  @ApiProperty({ example: 1024, description: 'File size in bytes', nullable: true })
  fileSize!: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ example: '2024-08-15T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ManyToOne(() => Patient, (patient) => patient.files, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Patient, description: 'Patient who owns this file' })
  patient!: Patient;
}
