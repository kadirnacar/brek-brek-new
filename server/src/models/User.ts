import { Column, Entity, PrimaryKey } from '../realm/decorators';

@Entity('User')
export class User {
  @PrimaryKey()
  @Column()
  id: string;

  @Column()
  Name?: string;

  @Column()
  Password?: string;

  @Column()
  Image?: string;

  @Column()
  Email?: string;

  @Column()
  IsValidated?: boolean;

  @Column()
  IsAccepted?: boolean;
}
