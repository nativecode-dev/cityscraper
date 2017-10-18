import { Model } from './Model'
import { Definition } from './Definition'

export class Site extends Model {
  public definition: Definition
  public description: string
  public name: string
  public url: string
}
