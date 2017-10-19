import { Definition } from './Definition'
import { Model } from './Model'

export class Site extends Model {
  public definition: Definition
  public description: string
  public name: string
  public url: string
}
