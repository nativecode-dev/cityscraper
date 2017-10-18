import { Mapping } from './Mapping'
import { Model } from './Model'

export class FormField extends Model {
  public ignore?: boolean
  public mapping: Mapping
  public name: string
  public priority: number
}
