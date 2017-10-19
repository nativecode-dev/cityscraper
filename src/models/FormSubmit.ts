import { FormSubmitAction } from './enums'
import { Model } from './Model'

export class FormSubmit extends Model {
  public action: FormSubmitAction
  public postscript?: string
  public prescript?: string
  public url?: string
}
