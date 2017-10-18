import { FormResultSelection } from './FormResultSelection'
import { Model } from './Model'

export class FormResult extends Model {
  public content: string
  public selections: FormResultSelection[]
}
