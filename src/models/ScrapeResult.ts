import { Model } from './Model'
import { Site, SiteResult } from './index'

export class ScrapeResult extends Model {
  public site: Site
  public results: SiteResult
}
