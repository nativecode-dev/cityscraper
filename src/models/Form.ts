import { FormField } from './FormField'
import { FormSelector } from './FormSelector'
import { FormSubmit } from './FormSubmit'
import { Model } from './Model'

export class Form extends Model {
  public fields: FormField[] = []
  public selectors: FormSelector[] = []
  public submit: FormSubmit
  public get key(): string {
    return 'cityscraper.form'
  }
}
