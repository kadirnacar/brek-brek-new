import { ObjectId } from 'bson';
import { Column, Entity, PrimaryKey } from '../realm/decorators';

@Entity('Invite')
export class Invite {
  @PrimaryKey('objectId')
  id: ObjectId;

  @Column('string')
  userId: string;

  @Column('string')
  refId: string;

  @Column('string')
  inviteId: string;

  @Column({ type: 'date', default: new Date() })
  createDate?: Date;
}
