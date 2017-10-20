import { Model } from './Model'
import { SiteResultSelection } from './SiteResultSelection'

export class SiteResult extends Model {
  public content: string
  public selections: SiteResultSelection[] = []
}
