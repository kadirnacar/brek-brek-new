import { Column, Entity, PrimaryKey } from '../realm/decorators';

@Entity('Shader')
export class Shader {
  @PrimaryKey()
  @Column()
  id: string;
  @Column()
  Name: string;
  @Column()
  Vertex: string;
  @Column()
  Fragment: string;
}
