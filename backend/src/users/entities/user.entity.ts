import { Patient } from 'src/patients/entities/patient.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id!: number;

  @Column()
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name!: string;

  @Column({ unique: true })
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  email!: string;

  @Column()
  @ApiHideProperty()
  password!: string;

  @OneToMany(() => Patient, (patient) => patient.user, {
    cascade: true,
  })
  @ApiProperty({ type: () => Patient, isArray: true, description: 'List of patients belonging to this user' })
  patients!: Patient[];
}
