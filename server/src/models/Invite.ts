import { ObjectId } from 'bson';
import { Column, Entity, PrimaryKey } from '../realm/decorators';

export enum InviteStatus {
  Waiting,
  Accepted,
}
@Entity('Invite')
export class Invite {
  @PrimaryKey('objectId')
  id: ObjectId;

  @Column('string')
  userId: string;

  @Column('string')
  name: string;

  @Column('string')
  refId: string;

  @Column({ type: 'int', default: InviteStatus.Waiting })
  status?: InviteStatus;

  @Column({ type: 'string', optional: true })
  iUserId?: string;

  @Column({ type: 'string', optional: true })
  iName?: string;

  @Column({ type: 'string', optional: true })
  iRefId?: string;

  @Column({ type: 'date', default: new Date() })
  createDate?: Date;
}
