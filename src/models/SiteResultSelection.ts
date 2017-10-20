import { Model } from './Model'

export class SiteResultSelection extends Model {
  public html: string[]
  public name: string
  public get key(): string {
    return 'cityscraper.site-result-selection'
  }
}
