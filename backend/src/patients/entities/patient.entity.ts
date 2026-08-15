import { User } from 'src/users/entities/user.entity';
import { File } from 'src/files/entities/file.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  id!: number;

  @Column()
  @ApiProperty({ example: 'Dupont', description: 'Patient last name' })
  lastName!: string;

  @Column()
  @ApiProperty({ example: 'Jean', description: 'Patient first name' })
  firstName!: string;

  @Column()
  @ApiProperty({ example: 45, description: 'Patient age' })
  age!: number;

  @ManyToOne(() => User, (user) => user.patients, {
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => User, description: 'User who owns this patient' })
  user!: User;

  @OneToMany(() => File, (file) => file.patient, {
    cascade: true,
  })
  @ApiProperty({ type: () => File, isArray: true, description: 'List of files belonging to this patient' })
  files!: File[];

}
