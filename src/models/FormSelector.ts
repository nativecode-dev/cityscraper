import { Model } from './Model'

export class FormSelector extends Model {
  public name: string
  public selector: string
  public get key(): string {
    return 'cityscraper.form-selector'
  }
}
