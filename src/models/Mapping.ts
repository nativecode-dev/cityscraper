import { MappingSource } from './enums'
import { Model } from './Model'

export class Mapping extends Model {
  public source: MappingSource
  public value: string
  public get key(): string {
    return 'cityscraper.mapping'
  }
}
