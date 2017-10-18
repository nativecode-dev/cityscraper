import { Model } from './Model'
import { MappingSource } from './enums'

export class Mapping extends Model {
  public source: MappingSource
  public value: string
}
