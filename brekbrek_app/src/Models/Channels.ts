import { Column, Entity, PrimaryKey } from '../realm/decorators';
import { ObjectId } from 'bson';

@Entity('Users')
export class Users {
  @PrimaryKey('objectId')
  id: ObjectId;

  @Column('string')
  Name: string;

  @Column({ type: 'bool', default: false })
  isSystem: boolean = false;

  @Column({ type: 'data', optional: true })
  Image?: ArrayBuffer;
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

// @Entity('Contacts')
// export class Contacts {
//   @PrimaryKey('objectId')
//   id: ObjectId;

//   @Column('string')
//   Name: string;

//   @Column({ type: 'string', optional: true })
//   Nickname?: string;

//   @Column({ type: 'bool', default: false })
//   HasMyList?: boolean;

//   @Column({ type: 'data', optional: true })
//   Image?: ArrayBuffer;
// }
