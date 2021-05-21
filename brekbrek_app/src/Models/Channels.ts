import { Column, Entity, PrimaryKey } from '../realm/decorators';
import { ObjectId } from 'bson';

@Entity('Users')
export class Users {
  @PrimaryKey('objectId')
  id: ObjectId;

  @Column('string')
  refId?: string;

  @Column('string')
  Name?: string;

  @Column({ type: 'bool', default: false })
  isSystem: boolean = false;

  @Column({ type: 'data', optional: true })
  Image?: ArrayBuffer;
}

@Entity('Invite')
export class Invite {
  @PrimaryKey('objectId')
  id: ObjectId;
}

@Entity('Channels')
export class Channels {
  @PrimaryKey('objectId')
  id: ObjectId;

  @Column('string')
  refId: string;

  @Column('string')
  Name: string;

  @Column({ type: 'data', optional: true })
  Image?: ArrayBuffer;

  @Column({ type: 'list', objectType: 'Users' })
  Contacts?: Users[];
}
