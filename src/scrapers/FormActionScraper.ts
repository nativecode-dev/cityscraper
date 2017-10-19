import { Site, SiteResult } from '../models'
import { ISiteScraper } from './ISiteScraper'

export class FormActionScraper implements ISiteScraper {
  public scrape(site: Site): Promise<SiteResult> {
    return Promise.resolve(new SiteResult())
  }
}
