import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  lastName!: string;

  @Column()
  firstName!: string;

  @Column()
  age!: number;

  @ManyToOne(() => User, (user) => user.patients, {
    cascade: true,
  })
  user!: User;
}
