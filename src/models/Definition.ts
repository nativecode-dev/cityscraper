import { Model } from './Model'
import { Form } from './Form'

export class Definition extends Model {
  public form: Form
  public name: string
  public selector: string
}
