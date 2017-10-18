import { Model } from './Model'
import { FormSubmitAction } from './enums'

export class FormSubmit extends Model {
  public action: FormSubmitAction
  public postscript?: string
  public prescript?: string
  public url?: string
}
