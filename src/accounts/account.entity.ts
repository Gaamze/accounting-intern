import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccountType } from './account-type.enum';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  /** Chart-of-accounts code, e.g. "1000" for Cash. */
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  type: AccountType;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
