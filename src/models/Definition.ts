import { Form } from './Form'
import { Model } from './Model'

export class Definition extends Model {
  public form: Form
  public name: string
  public selector: string
}
