import { Model } from './Model'
import { FormField } from './FormField'
import { FormSelector } from './FormSelector'
import { FormSubmit } from './FormSubmit'

export class Form extends Model {
  public fields: FormField[]
  public selectors: FormSelector[]
  public submit: FormSubmit
}
